import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router-dom';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {buoys,stations,regionPoints,type Buoy,type RegionId} from './data';
import {createBuoyClusters} from './cluster';
import {useMapCopy} from './copy';

export type MapRequest={region:RegionId|'world';sequence:number;buoyId?:string};
type Props={request:MapRequest;selectedId:string|null;onSelect:(buoy:Buoy)=>void;embedded?:boolean;detailHref?:string;onInspect?:()=>void};
const buoyIcon='<svg viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M14 5v5m-4 0h8v9h-8zM6 20c3-3 5 3 8 0s5 3 8 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const groupsAtZoom=createBuoyClusters(buoys);

export default function ObservationMap({request,selectedId,onSelect,embedded=false,detailHref,onInspect}:Props){
  const host=useRef<HTMLDivElement>(null),tiles=useRef<L.TileLayer|null>(null);
  const mount=useRef<HTMLDivElement>(null);
  const [portal]=useState(()=>{const node=document.createElement('div');node.className='atlas-map-portal';return node});
  const [map,setMap]=useState<L.Map|null>(null),[tileError,setTileError]=useState(false),[loading,setLoading]=useState(true);
  const [interactive,setInteractive]=useState(()=>!embedded&&!matchMedia('(pointer:coarse)').matches);
  const [expanded,setExpanded]=useState(false),[zoom,setZoom]=useState(2);
  const interactionBeforeExpand=useRef(interactive);
  const collapse=()=>{setExpanded(false);if(expanded)setInteractive(interactionBeforeExpand.current)};
  const toggleExpanded=()=>{
    if(expanded){collapse();return}
    interactionBeforeExpand.current=interactive;setInteractive(true);setExpanded(true);
  };
  const expandButton=useRef<HTMLButtonElement>(null),fit=useRef<()=>void>(()=>{});
  const {ru,text,region}=useMapCopy();
  const selected=buoys.find(buoy=>buoy.id===selectedId);
  // The portal target stays the same, so expanding an embedded map does not
  // recreate Leaflet or inherit a transformed/clipped animation container.
  useLayoutEffect(()=>{
    (expanded?document.body:mount.current)?.appendChild(portal);
    return()=>portal.remove();
  },[expanded,portal]);
  useEffect(()=>{
    if(!host.current)return;
    const instance=L.map(host.current,{center:[23,10],zoom:2,minZoom:0,maxZoom:20,
      zoomControl:false,attributionControl:false,worldCopyJump:true,scrollWheelZoom:false,dragging:false,touchZoom:false,keyboard:false,doubleClickZoom:false,
      zoomAnimation:!matchMedia('(prefers-reduced-motion:reduce)').matches,fadeAnimation:!matchMedia('(prefers-reduced-motion:reduce)').matches,
      maxBounds:[[-80,-240],[85,240]],maxBoundsViscosity:.8});
    L.control.attribution({prefix:false,position:'bottomright'}).addTo(instance);
    L.control.scale({imperial:false,position:'bottomleft',maxWidth:100}).addTo(instance);
    const layer=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxNativeZoom:19,maxZoom:20,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      keepBuffer:1,
    }).addTo(instance);
    tiles.current=layer;
    layer.on('tileerror',()=>{setTileError(true);setLoading(false)});
    layer.on('loading',()=>setLoading(true));
    layer.on('load',()=>setLoading(false));
    setMap(instance);
    const updateZoom=()=>setZoom(instance.getZoom());instance.on('zoomend',updateZoom);
    const resize=new ResizeObserver(()=>instance.invalidateSize({pan:false}));resize.observe(host.current);
    return()=>{resize.disconnect();tiles.current=null;instance.remove()};
  },[]);
  useEffect(()=>{
    if(!map||!host.current)return;
    for(const handler of [map.dragging,map.touchZoom,map.doubleClickZoom,map.keyboard,map.boxZoom])interactive?handler.enable():handler.disable();
    host.current.style.touchAction=interactive?'none':'pan-y';
    let accumulated=0,last=0;
    const wheel=(event:WheelEvent)=>{
      if(!interactive||!expanded&&!event.ctrlKey&&!event.metaKey)return;
      event.preventDefault();event.stopPropagation();
      accumulated+=event.deltaY*(event.deltaMode===1?16:1);
      if(Math.abs(accumulated)<15||performance.now()-last<140)return;
      map.setZoomAround(map.mouseEventToContainerPoint(event),map.getZoom()+(accumulated<0?1:-1),{animate:false});
      accumulated=0;last=performance.now();
    };
    host.current.addEventListener('wheel',wheel,{passive:false});
    const node=host.current;
    return()=>node.removeEventListener('wheel',wheel);
  },[map,interactive,expanded]);
  useEffect(()=>{
    if(!expanded)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const close=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();collapse();expandButton.current?.focus()}
      if(event.key==='Tab'){
        const items=[...host.current!.parentElement!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex="0"]')].filter(node=>{
          const box=node.getBoundingClientRect();return box.width&&box.height&&box.left>=0&&box.right<=innerWidth&&box.top>=0&&box.bottom<=innerHeight;
        });
        const edge=event.shiftKey?items[0]:items.at(-1),target=event.shiftKey?items.at(-1):items[0];
        if(document.activeElement===edge){event.preventDefault();target?.focus()}
      }
    };
    window.addEventListener('keydown',close);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',close)};
  },[expanded]);
  useEffect(()=>{
    if(!map)return;
    const animate=!matchMedia('(prefers-reduced-motion:reduce)').matches;
    const focus=()=>{
      const buoy=buoys.find(item=>item.id===request.buoyId);
      if(buoy){map.setView(buoy.position,buoy.region==='aktau'?20:17,{animate});return}
      if(request.region==='world')map.fitBounds(L.latLngBounds(buoys.map(buoy=>buoy.position)),{padding:[40,40],maxZoom:2,animate});
      else map.fitBounds(L.latLngBounds(regionPoints(request.region)),{padding:[54,54],maxZoom:request.region==='taiwan'?10:16,animate,duration:.85});
    };
    fit.current=focus;focus();
  },[map,request]);
  useEffect(()=>{
    if(!map)return;
    const layer=L.layerGroup().addTo(map);
    const render=()=>{
      layer.clearLayers();
      groupsAtZoom(map.getZoom()).forEach(group=>{
        const members=group.members,clustered=members.length>1,first=members[0],selected=members.some(buoy=>buoy.id===selectedId);
        const label=clustered?`${region[first.region]} · ${members.length} ${text('buoys. Zoom in','буйков. Приблизить')}`:`${text('Buoy','Буй')} ${first.id}`;
        const size=clustered?(members.length>=50?48:members.length>=10?42:36):32;
        const marker=L.marker(group.position,{title:label,alt:label,keyboard:true,riseOnHover:true,zIndexOffset:selected?500:0,
          icon:L.divIcon({className:`atlas-marker ${clustered?'atlas-cluster':'atlas-buoy'}${selected?' is-selected':''}`,html:clustered?`<span>${members.length}</span>`:buoyIcon,iconSize:[size,size],iconAnchor:[size/2,size/2]})}).addTo(layer);
        const element=marker.getElement();
        element?.setAttribute('role','button');element?.setAttribute('aria-label',label);
        if(element){element.dataset.region=first.region;element.dataset.count=String(members.length);element.dataset.group=group.id}
        if(!clustered)element?.setAttribute('aria-pressed',String(selected));
        marker.on('click',()=>{
          if(clustered){
            map.setView(group.position,Math.min(20,group.expansionZoom),{animate:!matchMedia('(prefers-reduced-motion:reduce)').matches});
          }
          else onSelect(first);
        });
        if(clustered){
          let coverage:L.Polyline|undefined;
          const show=()=>{
            coverage?.remove();
            const ordered=[...members].sort((a,b)=>a.id.localeCompare(b.id));
            coverage=L.polyline(ordered.map(buoy=>buoy.position),{color:'#5a7650',weight:3,opacity:.65,interactive:false,dashArray:'3 6'}).addTo(layer);
          };
          const hide=()=>{coverage?.remove();coverage=undefined};
          marker.on('mouseover',show);marker.on('mouseout',hide);
          element?.addEventListener('focus',show);element?.addEventListener('blur',hide);
        }
      });
      // Reference stations stay distinct from the AquaNode markers.
      if(map.getZoom()>=8)stations.forEach(station=>{
        const buoy=buoys.find(item=>item.stationId===station.id)!;
        const label=`${text('Reference station','Референсная станция')} ${station.id} · ${station.name}`;
        const marker=L.marker(station.position,{title:label,alt:label,keyboard:true,zIndexOffset:-100,
          icon:L.divIcon({className:'atlas-station',html:'<span></span>',iconSize:[24,24],iconAnchor:[12,12]})}).addTo(layer);
        marker.getElement()?.setAttribute('role','button');marker.getElement()?.setAttribute('aria-label',label);
        marker.on('click',()=>onSelect(buoy));
        if(selectedId===buoy.id)L.polyline([station.position,buoy.position],{color:'#164b60',weight:1.5,dashArray:'3 5',interactive:false}).addTo(layer);
      });
    };
    render();map.on('zoomend',render);
    return()=>{map.off('zoomend',render);layer.remove()};
  },[map,selectedId,onSelect,ru]);
  return <><div className="atlas-map-mount" ref={mount}/>{createPortal(<div className="atlas-map-shell" data-native-scroll data-embedded={embedded} data-expanded={expanded} data-interactive={interactive} data-zoom={zoom} role={expanded?'dialog':undefined} aria-modal={expanded||undefined} aria-label={expanded?text('Expanded observation map','Развёрнутая карта наблюдений'):undefined}>
      <div className="atlas-map" ref={host} role="region" aria-label={expanded?text('Interactive buoy map. Scroll to zoom, drag to move.','Интерактивная карта буйков. Колесо — масштаб, перетаскивание — перемещение.'):text('Interactive buoy map. Use the map controls; Ctrl or Command + wheel to zoom.','Интерактивная карта буйков. Используйте кнопки; Ctrl или Command + колесо для масштаба.')}/>
    <div className="atlas-map-tools" aria-label={text('Map controls','Управление картой')}>
      <button type="button" disabled={zoom>=20} onClick={()=>map?.zoomIn(undefined,{animate:false})} aria-label={text('Zoom in','Приблизить')} title={text('Zoom in','Приблизить')}>+</button>
      <button type="button" disabled={zoom<=0} onClick={()=>map?.zoomOut(undefined,{animate:false})} aria-label={text('Zoom out','Отдалить')} title={text('Zoom out','Отдалить')}>−</button>
      <button type="button" onClick={()=>fit.current()} aria-label={text('Reset map view','Вернуть обзор карты')} title={text('Reset map view','Вернуть обзор карты')}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/></svg></button>
        <button ref={expandButton} type="button" aria-pressed={expanded} onClick={toggleExpanded} aria-label={text(expanded?'Exit full screen':'Expand map',expanded?'Свернуть карту':'Развернуть карту')} title={text(expanded?'Exit full screen':'Expand map',expanded?'Свернуть карту':'Развернуть карту')}><svg viewBox="0 0 24 24" aria-hidden="true">{expanded?<path d="M3 9h6V3m6 0v6h6M3 15h6v6m6 0v-6h6"/>:<path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6"/>}</svg></button>
    </div>
    <div className="atlas-map-caption"><span className="atlas-map-cross" aria-hidden="true">+</span>{text('A shared field of observation','Общее поле наблюдений')}</div>
      <div className="atlas-map-interaction">{!expanded&&<button type="button" aria-pressed={interactive} onClick={()=>setInteractive(value=>!value)}>{interactive?text('Scroll the page','Листать страницу'):text('Explore the map','Управлять картой')}<span aria-hidden="true">{interactive?'✓':'↔'}</span></button>}<span>{expanded?text('Drag · pinch · scroll to zoom','Перетаскивание · щипок · колесо для масштаба'):interactive?text('Drag · pinch · Ctrl + wheel','Перетаскивайте · щипок · Ctrl + колесо'):text('Page scrolling is available','Карту можно листать вместе со страницей')}</span></div>
      {selected&&(onInspect||detailHref)&&(!embedded||expanded)&&<div className="atlas-map-selection"><span><b>{selected.id}</b><small>{region[selected.region]}</small></span>{detailHref?<Link to={detailHref} onClick={collapse}>{text('View readings','К показаниям')}</Link>:<button type="button" onClick={()=>{collapse();requestAnimationFrame(()=>onInspect?.())}}>{text('View readings','К показаниям')}</button>}</div>}
    {loading&&!tileError&&<div className="atlas-tile-status" role="status">{text('Loading the basemap…','Загружаем карту…')}</div>}
    {tileError&&<div className="atlas-tile-status" role="status">{text('Map tiles could not be loaded. Buoy markers remain available.','Подложка карты не загрузилась. Точки буйков доступны.')} <button type="button" onClick={()=>{setTileError(false);tiles.current?.redraw()}}>{text('Retry','Повторить')}</button></div>}
  </div>,portal)}</>;
}
