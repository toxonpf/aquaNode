import {useId,useLayoutEffect,useRef,useState} from 'react';

type Point={x:number;y:number};
export default function JournalThread({active}:{active:number}){
  const svg=useRef<SVGSVGElement>(null),id=useId().replace(/:/g,'');
  const [shape,setShape]=useState<{height:number;path:string;stops:Point[]}>({height:600,path:'M16 8C16 200 8 300 16 592',stops:[]});
  const [visible,setVisible]=useState(false);
  useLayoutEffect(()=>{
    const cover=svg.current!.parentElement!;
    const measure=()=>{
      const box=cover.getBoundingClientRect(),height=box.height;
      const stops=Array.from(cover.querySelectorAll('.journal-cover-link')).map((link,index)=>{
        const row=link.getBoundingClientRect();return {x:index%2?23:9,y:row.top+row.height/2-box.top};
      });
      const points=[{x:16,y:8},...stops,{x:16,y:height-8}];
      let path=`M${points[0].x} ${points[0].y}`;
      for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i],mid=(a.y+b.y)/2;
        path+=`C${a.x} ${mid} ${b.x} ${mid} ${b.x} ${b.y}`;
      }
      setShape(previous=>previous.path===path?previous:{height,path,stops});
    };
    const resize=new ResizeObserver(measure);resize.observe(cover);
    cover.querySelectorAll('.journal-cover-link').forEach(link=>resize.observe(link));
    const view=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));view.observe(cover);measure();
    return()=>{resize.disconnect();view.disconnect()};
  },[]);
  return <svg ref={svg} className="journal-cover-current" viewBox={`0 0 32 ${shape.height}`} fill="none" preserveAspectRatio="none" aria-hidden="true" data-visible={visible}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c9dcae" stopOpacity=".15"/><stop offset=".2" stopColor="#c9dcae"/><stop offset=".85" stopColor="#c9dcae"/><stop offset="1" stopColor="#c9dcae" stopOpacity=".15"/></linearGradient></defs>
    <path className="journal-thread-track" pathLength="1" d={shape.path} stroke={`url(#${id})`}/>
    <path className="journal-thread-current" pathLength="100" d={shape.path}/>
    {shape.stops.map((point,index)=><g key={index} className="journal-thread-stop" data-active={index===active}>
      <circle className="journal-thread-ring" cx={point.x} cy={point.y} r="5.5"/>
      <circle className="journal-thread-dot" cx={point.x} cy={point.y} r="2"/>
    </g>)}
  </svg>;
}
