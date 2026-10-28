import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {regionIds,type Buoy,type RegionId} from './data';
import {useMapCopy} from './copy';
import type {MapRequest} from './ObservationMap';

const ObservationMap=lazy(()=>import('./ObservationMap'));
export default function MapEmbed({initialRegion='world',compact=false}:{initialRegion?:RegionId|'world';compact?:boolean}){
  const host=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false),[selected,setSelected]=useState<Buoy|null>(null);
  const [request,setRequest]=useState<MapRequest>({region:initialRegion,sequence:0});
  const {text,region}=useMapCopy();
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect()}},{rootMargin:'200px'});
    if(host.current)observer.observe(host.current);
    return()=>observer.disconnect();
  },[]);
  const href=selected?`/map?buoy=${selected.id}`:request.region==='world'?'/map':`/map?region=${request.region}`;
  return <div className={'map-embed'+(compact?' map-embed--compact':'')} ref={host}>
    <div className="map-embed-toolbar" role="group" aria-label={text('Map preview regions','Регионы на карте')}>
      {(['world',...regionIds] as const).map(id=><button type="button" key={id} aria-pressed={request.region===id} onClick={()=>{setSelected(null);setRequest(value=>({region:id,sequence:value.sequence+1}))}}>{id==='world'?text('World','Мир'):region[id]}</button>)}
    </div>
    <div className="map-embed-viewport">
      {visible?<Suspense fallback={<div className="map-embed-placeholder" role="status">{text('Opening the atlas…','Открываем карту…')}</div>}><ObservationMap request={request} selectedId={selected?.id??null} onSelect={setSelected} embedded detailHref={href}/></Suspense>:<div className="map-embed-placeholder"><span aria-hidden="true">≈</span>{text('A shared field of observation','Общее поле наблюдений')}</div>}
    </div>
    <div className="map-embed-footer"><Link className="arrow-link" to={href}>{selected?`${text('Open buoy','Открыть буй')} ${selected.id}`:text('Explore the atlas','Открыть карту')}<FlexibleArrow direction="up-right"/></Link></div>
  </div>;
}
