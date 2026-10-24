import {useEffect,useRef} from 'react';

function wavePath(phase:number){
  const points=Array.from({length:41},(_,i)=>{
    const u=i/40,envelope=Math.sin(Math.PI*u)**2;
    return {x:u*1440,y:35+envelope*(18*Math.sin(u*Math.PI*4.4-phase)+4*Math.sin(u*Math.PI*7+phase*.6))};
  });
  let path=`M0 ${points[0].y}`;
  for(let i=0;i<points.length-1;i++){
    const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
    path+=`C${(p1.x+(p2.x-p0.x)/6).toFixed(2)} ${(p1.y+(p2.y-p0.y)/6).toFixed(2)} ${(p2.x-(p3.x-p1.x)/6).toFixed(2)} ${(p2.y-(p3.y-p1.y)/6).toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return path;
}

export default function FooterCurrent(){
  const host=useRef<SVGSVGElement>(null),path=useRef<SVGPathElement>(null);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let visible=false,frame=0,last=0,phase=0;
    const draw=(time:number)=>{
      if(last)phase+=Math.min(time-last,40)*.0006;
      last=time;path.current?.setAttribute('d',wavePath(phase));frame=requestAnimationFrame(draw);
    };
    const sync=()=>{
      cancelAnimationFrame(frame);last=0;
      if(visible&&!media.matches&&!document.hidden)frame=requestAnimationFrame(draw);
    };
    const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);sync()},{rootMargin:'80px'});
    if(host.current)observer.observe(host.current);
    media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
  },[]);
  return <svg ref={host} className="footer-current" viewBox="0 0 1440 70" preserveAspectRatio="none" fill="none" aria-hidden="true"><path ref={path} d={wavePath(0)}/></svg>;
}
