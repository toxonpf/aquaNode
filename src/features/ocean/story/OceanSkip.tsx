import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {t} from '../../i18n/i18n';

function geometry(width:number,height:number,x:number,y:number){
  const end={x:width*.52,y:height-6},neck=end.y-8,space=Math.max(4,neck-y);
  const poses=[0,1,-1,0].map(bend=>{
    const left=width*(.38+bend*.035),right=width*(.64-bend*.035);
    return `M${x} ${y}C${x} ${y+space*.17} ${left} ${y+space*.17} ${left} ${y+space*.36}C${left} ${y+space*.55} ${right} ${y+space*.49} ${right} ${y+space*.68}C${right} ${y+space*.85} ${end.x} ${neck-2} ${end.x} ${neck}L${end.x} ${end.y}`;
  });
  return {width,height,poses,head:`M${end.x-3.3} ${end.y-4.5}L${end.x} ${end.y}L${end.x+3.3} ${end.y-4.5}`};
}

export default function OceanSkip({onSkip}:{onSkip:()=>void}){
  const link=useRef<HTMLAnchorElement>(null),label=useRef<HTMLSpanElement>(null);
  const [shape,setShape]=useState(()=>geometry(64,70,46,24));
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion:reduce)'),update=()=>setReduced(media.matches);
    media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
  },[]);
  useLayoutEffect(()=>{
    let alive=true;
    const measure=()=>{
      if(!alive||!link.current||!label.current)return;
      const box=link.current.getBoundingClientRect(),text=label.current.getBoundingClientRect();
      const next=geometry(box.width,box.height,text.right-box.left-5,text.bottom-box.top+3);
      setShape(previous=>JSON.stringify(previous)===JSON.stringify(next)?previous:next);
    };
    const observer=new ResizeObserver(measure);observer.observe(link.current!);observer.observe(label.current!);
    document.fonts.ready.then(measure);measure();
    return()=>{alive=false;observer.disconnect()};
  },[]);
  return <a ref={link} className="ocean-chapters-skip" href="#progress" onClick={event=>{event.preventDefault();onSkip()}} aria-label={t('Skip buoy story')}>
    <span ref={label} className="ocean-chapters-skip-label">{t('SKIP')}</span>
    <svg className="ocean-chapters-skip-icon" viewBox={`0 0 ${shape.width} ${shape.height}`} fill="none" aria-hidden="true" focusable="false">
      {['',' ocean-chapters-skip-current ocean-chapters-skip-trail',' ocean-chapters-skip-current'].map(extra=><path key={extra} className={'ocean-chapters-skip-line'+extra} pathLength="100" d={shape.poses[0]}>
        {!reduced&&<animate attributeName="d" values={shape.poses.join(';')} dur="3.4s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.33;.66;1" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/>}
      </path>)}
      <path className="ocean-chapters-skip-head" d={shape.head}/>
    </svg>
  </a>;
}
