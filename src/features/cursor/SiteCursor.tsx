import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {t} from '../i18n/i18n';
import {useCursorStyle} from './cursorStyle';
type Point={x:number;y:number};
const count=9,origin=64;
const fullTurn=Math.PI*2;
const bearings={ne:{x:Math.SQRT1_2,y:-Math.SQRT1_2},right:{x:1,y:0},left:{x:-1,y:0},up:{x:0,y:-1},down:{x:0,y:1}} as const;
type Bearing=keyof typeof bearings;
const path=(points:Point[])=>{
  let d=`M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for(let i=0;i<points.length-1;i++){
    const before=points[Math.max(0,i-1)],a=points[i],b=points[i+1],after=points[Math.min(points.length-1,i+2)];
    d+=`C${(a.x+(b.x-before.x)/6).toFixed(2)} ${(a.y+(b.y-before.y)/6).toFixed(2)} ${(b.x-(after.x-a.x)/6).toFixed(2)} ${(b.y-(after.y-a.y)/6).toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }
  return d;
};
const arrowHead=(tip:Point,{x,y}:Point,shaft=false)=>{
  return `${shaft?`M${tip.x-x*14} ${tip.y-y*14}L${tip.x} ${tip.y}`:''}M${tip.x-x*9.5-y*5} ${tip.y-y*9.5+x*5}L${tip.x} ${tip.y}L${tip.x-x*9.5+y*5} ${tip.y-y*9.5-x*5}`;
};

export default function SiteCursor(){
  const style=useCursorStyle();
  const cursor=useRef<HTMLDivElement>(null);
  const [host,setHost]=useState<HTMLElement>(()=>document.body);
  const gradient=useId().replace(/:/g,'');
  const pointer=useRef({x:0,y:0,frameX:0,frameY:0,vx:0,vy:0,dx:1,dy:0,moved:-Infinity,motion:0,dragWidth:22,dragBend:0,dragLag:0,bearing:'ne' as Bearing,pressedAt:-Infinity,visible:false,mode:'default',down:false});
  const headOpacity=useRef<Record<Bearing,number>>({ne:0,right:0,left:0,up:0,down:0});
  const spine=useRef<Point[]>([]);

  useEffect(()=>{
    // A native dialog sits above every document z-index, including the cursor.
    const sync=()=>setHost(document.querySelector<HTMLDialogElement>('dialog[open]')??document.body);
    const observer=new MutationObserver(sync);
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
    sync();return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    const enabled=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) and (forced-colors:none)');
    const root=document.documentElement,state=pointer.current;
    let frame=0,last=0;
    const paint=(now:number)=>{
      frame=0;
      const node=cursor.current;if(!node||style===0||!enabled.matches)return;
      const dt=Math.min(Math.max((now-last)/1000,1/120),.035);last=now;
      const follow=(rate:number)=>1-Math.exp(-dt*rate);
      const vx=(state.x-state.frameX)/dt,vy=(state.y-state.frameY)/dt;
      state.frameX=state.x;state.frameY=state.y;
      const cap=Math.min(1,1800/Math.max(1,Math.hypot(vx,vy)));
      state.vx+=(vx*cap-state.vx)*follow(25);state.vy+=(vy*cap-state.vy)*follow(25);
      if(now-state.moved>180&&Math.hypot(state.vx,state.vy)<1){state.vx=0;state.vy=0}
      const velocity=Math.hypot(state.vx,state.vy),speed=Math.min(1,velocity/800);
      if(velocity>2){state.dx=state.vx/velocity;state.dy=state.vy/velocity}
      const energy=now-state.moved<100?Math.min(1,speed*3):0;
      state.motion+=(energy-state.motion)*follow(energy>state.motion?28:10);
      if(energy===0&&state.motion<.002)state.motion=0;
      const interactive=state.mode==='link'||state.mode==='portrait';
      const direction=interactive?bearings[state.bearing]:{x:state.dx,y:state.dy};
      const normal={x:-direction.y,y:direction.x};
      const length=(interactive?30+speed*42*state.motion:(25+speed*49)*state.motion)*(state.down ? .82 : 1);
      const waveStrength=interactive ? .55+state.motion*.45 : state.motion;
      const neck=interactive?14:0;
      // The head and drag handles have fixed bearings. Only the wake deforms
      // in response to the full two-dimensional velocity; no angle accumulates.
      const bend=interactive?-(state.vx*normal.x+state.vy*normal.y)*.018*state.motion:0;
      const phase=now/1000*fullTurn/2.4;
      const points:Point[]=[{x:origin,y:origin}];
      for(let i=1;i<count;i++){
        const position=interactive?(i-1)/(count-2):i/(count-1);
        const distance=neck+length*position;
        const wave=Math.sin(position*fullTurn-phase)*Math.sin(Math.PI*position)*3.2*waveStrength;
        const offset=wave+Math.max(-22,Math.min(22,bend))*position;
        const target={x:state.x-direction.x*distance+normal.x*offset,y:state.y-direction.y*distance+normal.y*offset};
        const point=spine.current[i]??(spine.current[i]={...target});
        const response=follow(45-i*2.6);
        point.x+=(target.x-point.x)*response;point.y+=(target.y-point.y)*response;
        if(interactive&&i===1){point.x=target.x;point.y=target.y}
        // A fast jump must leave a short wake, never a line across the page.
        const x=point.x-state.x,y=point.y-state.y,radius=Math.hypot(x,y),limit=neck+length+12;
        if(radius>limit){point.x=state.x+x/radius*limit;point.y=state.y+y/radius*limit}
        points.push({x:origin+point.x-state.x,y:origin+point.y-state.y});
      }
      node.querySelector('.site-cursor-current')?.setAttribute('d',path(points));
      for(const side of [-1,1]){
        const wake=points.map((point,i)=>{
          const before=points[Math.max(0,i-1)],after=points[Math.min(count-1,i+1)];
          const angle=Math.atan2(after.y-before.y,after.x-before.x);
          const offset=side*Math.sin(i/(count-1)*Math.PI/2)*4*waveStrength;
          return {x:point.x-Math.sin(angle)*offset,y:point.y+Math.cos(angle)*offset};
        });
        node.querySelector(side<0?'.site-cursor-wake-first':'.site-cursor-wake-second')?.setAttribute('d',path(wake));
      }
      let headsSettling=false;
      node.querySelectorAll<SVGPathElement>('.site-cursor-head').forEach(head=>{
        const bearing=head.dataset.bearing as Bearing,target=interactive&&state.bearing===bearing?1:0;
        const value=headOpacity.current[bearing]+(target-headOpacity.current[bearing])*follow(20);
        headOpacity.current[bearing]=value;head.style.opacity=String(value);
        if(Math.abs(target-value)>.001)headsSettling=true;
      });
      const stretch=speed*(state.down?1.3:.9),x=state.dx,y=state.dy;
      node.querySelector('.site-cursor-tip')?.setAttribute('transform',`translate(${origin} ${origin}) matrix(${1+stretch*x*x} ${stretch*x*y} ${stretch*x*y} ${1+stretch*y*y} 0 0) translate(${-origin} ${-origin})`);
      // The model keeps its original two-ended wave. Endpoints only translate
      // horizontally; vertical motion bends the bridge, never the arrowheads.
      state.dragWidth+=(22+Math.min(15,Math.abs(state.vx)*.018)-state.dragWidth)*follow(18);
      state.dragBend+=(Math.max(-24,Math.min(24,-state.vy*.025))-state.dragBend)*follow(18);
      state.dragLag+=(Math.max(-9,Math.min(9,-state.vx*.01))-state.dragLag)*follow(18);
      const left=origin-state.dragWidth,right=origin+state.dragWidth,middle=origin+state.dragLag;
      const bendY=origin+state.dragBend,wave=Math.sin(phase)*3;
      node.querySelector('.site-cursor-drag-line')?.setAttribute('d',`M${left} ${origin}C${left+10} ${origin} ${middle-12} ${bendY+wave} ${middle} ${bendY}C${middle+12} ${bendY-wave} ${right-10} ${origin} ${right} ${origin}`);
      node.querySelector('.site-cursor-drag-head[data-bearing=left]')?.setAttribute('transform',`translate(${-state.dragWidth} 0)`);
      node.querySelector('.site-cursor-drag-head[data-bearing=right]')?.setAttribute('transform',`translate(${state.dragWidth} 0)`);
      const ink=node.querySelector('linearGradient');
      ink?.setAttribute('x1',String(points[count-1].x));ink?.setAttribute('y1',String(points[count-1].y));
      const splash=node.querySelector<SVGCircleElement>('.site-cursor-splash');
      const ripple=Math.min(1,(now-state.pressedAt)/550);
      splash?.setAttribute('r',String(4+19*(1-(1-ripple)**3)));if(splash)splash.style.opacity=String((1-ripple)*.6);
      node.dataset.visible=String(state.visible&&enabled.matches);
      node.dataset.mode=state.mode;node.dataset.down=String(state.down);
      node.style.setProperty('--cursor-tail-opacity',String(interactive?1:state.mode==='drag'?0:state.motion));
      node.style.setProperty('--cursor-x',`${state.x}px`);node.style.setProperty('--cursor-y',`${state.y}px`);
      if(state.visible&&enabled.matches&&(interactive||state.mode==='drag'||now-state.moved<180||state.motion>.001||velocity>1||headsSettling||ripple<1))frame=requestAnimationFrame(paint);
    };
    const schedule=()=>{if(!frame){last=performance.now()-16;frame=requestAnimationFrame(paint)}};
    const hide=()=>{
      cancelAnimationFrame(frame);frame=0;
      state.visible=false;state.down=false;delete root.dataset.customCursor;
      if(cursor.current)cursor.current.dataset.visible='false';
    };
    const move=(event:PointerEvent)=>{
      if(event.pointerType!=='mouse'||!enabled.matches){hide();return}
      const target=event.target instanceof Element?event.target:null;
      if(target?.closest('input,textarea,select,[contenteditable=true]')){hide();return}
      if(!state.visible){spine.current=[];state.frameX=event.clientX;state.frameY=event.clientY;state.vx=0;state.vy=0;state.motion=0}
      else{
        const x=event.clientX-state.x,y=event.clientY-state.y,distance=Math.hypot(x,y);
        if(distance>.05)state.moved=performance.now();
      }
      state.x=event.clientX;state.y=event.clientY;state.visible=true;
      const action=target?.closest('a,button:not(:disabled),summary,[role=button]');
      const dragging=state.down&&state.mode==='drag';
      state.mode=dragging?'drag':target?.closest('.team-portrait-trigger')?'portrait':action?'link':target?.closest('canvas,[data-cursor=drag],[draggable=true]')?'drag':'default';
      const arrow=action?.querySelector('.flexible-arrow')?.classList;
      state.bearing=arrow?.contains('flexible-arrow--left')?'left':arrow?.contains('flexible-arrow--down')?'down':arrow?.contains('flexible-arrow--up')?'up':arrow?.contains('flexible-arrow--right')?'right':'ne';
      if(style===0)return;
      root.dataset.customCursor='true';schedule();
    };
    const press=(event:PointerEvent)=>{if(style!==0&&event.pointerType==='mouse'&&state.visible){state.down=true;state.pressedAt=performance.now();schedule()}};
    const release=()=>{state.down=false;if(style!==0)schedule()};
    const leave=(event:PointerEvent)=>{if(!event.relatedTarget)hide()};
    const keyboard=(event:KeyboardEvent)=>{if(event.key==='Tab')hide()};
    const preference=()=>{if(!enabled.matches)hide()};
    document.addEventListener('pointermove',move,{passive:true});
    document.addEventListener('pointerover',move,{passive:true});
    document.addEventListener('pointerout',leave,{passive:true});
    document.addEventListener('pointerdown',press,{passive:true});
    document.addEventListener('pointerup',release,{passive:true});
    document.addEventListener('keydown',keyboard);
    window.addEventListener('blur',hide);enabled.addEventListener('change',preference);
    if(style===0&&cursor.current)cursor.current.dataset.visible='false';
    if(style!==0&&state.visible&&enabled.matches){root.dataset.customCursor='true';schedule()}
    return()=>{
      cancelAnimationFrame(frame);delete root.dataset.customCursor;
      document.removeEventListener('pointermove',move);document.removeEventListener('pointerover',move);
      document.removeEventListener('pointerout',leave);document.removeEventListener('pointerdown',press);
      document.removeEventListener('pointerup',release);document.removeEventListener('keydown',keyboard);
      window.removeEventListener('blur',hide);enabled.removeEventListener('change',preference);
    };
  },[host,style]);

  return createPortal(<div ref={cursor} className="site-cursor" aria-hidden="true">
    <svg className="site-cursor-ink" viewBox="0 0 128 128" fill="none">
      <defs><linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="35" y1="93" x2="64" y2="64"><stop stopColor="currentColor" stopOpacity=".08"/><stop offset=".55" stopColor="currentColor" stopOpacity=".65"/><stop offset="1" stopColor="currentColor"/></linearGradient></defs>
      <g className="site-cursor-tail">
        <path className="site-cursor-wake-first" stroke={`url(#${gradient})`}/>
        <path className="site-cursor-wake-second" stroke={`url(#${gradient})`}/>
        <path className="site-cursor-current" stroke={`url(#${gradient})`}/>
      </g>
      {Object.entries(bearings).map(([bearing,direction])=><path key={bearing} className="site-cursor-head" data-bearing={bearing} d={arrowHead({x:origin,y:origin},direction,true)}/>)}
      <g className="site-cursor-drag">
        <path className="site-cursor-drag-line"/>
        {(['left','right'] as const).map(bearing=><path key={bearing} className="site-cursor-drag-head" data-bearing={bearing} d={arrowHead({x:origin,y:origin},bearings[bearing])}/>)}
      </g>
      <circle className="site-cursor-tip" cx="64" cy="64" r="3.2"/>
      <circle className="site-cursor-splash" cx="64" cy="64" r="4"/>
    </svg>
    <span className="site-cursor-label">{t('VIEW PROFILE')}</span>
  </div>,host);
}
