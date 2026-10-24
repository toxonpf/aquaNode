import {useEffect,useRef} from 'react';

function wave(phase:number,offset:number){
  const points=Array.from({length:37},(_,index)=>{
    const u=index/36,envelope=Math.sin(Math.PI*u)**2;
    return {x:u*600,y:12+offset+envelope*3*Math.sin(u*Math.PI*4-phase)};
  });
  let path=`M${points[0].x} ${points[0].y}`;
  for(let index=0;index<points.length-1;index++){
    const a=points[Math.max(0,index-1)],b=points[index],c=points[index+1],d=points[Math.min(points.length-1,index+2)];
    path+=`C${(b.x+(c.x-a.x)/6).toFixed(2)} ${(b.y+(c.y-a.y)/6).toFixed(2)} ${(c.x-(d.x-b.x)/6).toFixed(2)} ${(c.y-(d.y-b.y)/6).toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
  }
  return path;
}

export default function TeamCurrent({index}:{index:number}){
  const host=useRef<SVGSVGElement>(null);
  useEffect(()=>{
    const node=host.current!,paths=node.querySelectorAll('path');
    const media=matchMedia('(prefers-reduced-motion:reduce)');
    let visible=false,frame=0,last=0,phase=index*.8;
    const draw=(time:number)=>{
      if(last)phase+=Math.min(time-last,40)*.00045;
      last=time;
      paths.forEach((path,i)=>path.setAttribute('d',wave(phase,(i-1)*1.5)));
      frame=requestAnimationFrame(draw);
    };
    const sync=()=>{
      cancelAnimationFrame(frame);last=0;
      if(visible&&!document.hidden&&!media.matches)frame=requestAnimationFrame(draw);
    };
    const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});view.observe(node);
    media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    return()=>{cancelAnimationFrame(frame);view.disconnect();media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
  },[index]);
  return <svg ref={host} className="team-pagination-current" viewBox="0 0 600 24" preserveAspectRatio="none" fill="none" aria-hidden="true">{[-1.5,0,1.5].map(offset=><path key={offset} d={wave(index*.8,offset)}/>)}</svg>;
}
