import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {SceneShot} from './sceneTypes';

export default function StoryPanel({chapter,className,label,children}:{chapter:SceneShot;className:string;label:string;children:ReactNode}){
  const reader=useRef<HTMLDivElement>(null);
  const [progress,setProgress]=useState(0);
  const [overflow,setOverflow]=useState(false);
  useEffect(()=>{
    const node=reader.current;
    if(!node)return;
    const measure=()=>{
      const distance=node.scrollHeight-node.clientHeight;
      setOverflow(distance>2);
      setProgress(distance>2?Math.min(1,Math.max(0,node.scrollTop/distance)):1);
    };
    node.addEventListener('scroll',measure,{passive:true});
    const resize=new ResizeObserver(measure);
    resize.observe(node);
    Array.from(node.children).forEach(child=>resize.observe(child));
    measure();
    return()=>{node.removeEventListener('scroll',measure);resize.disconnect()};
  },[]);
  return <div className="story-panel" data-reader={chapter} data-at-start={progress<.005} data-at-end={progress>.995}>
    <div ref={reader} className={className+' story-scroll'} data-story-scroll tabIndex={0} role="region" aria-label={label}>{children}</div>
    <div className="story-reading-status" aria-hidden="true"><span>{overflow&&progress<.995?'SCROLL TO READ MORE':'SCROLL TO THE NEXT CHAPTER'}</span><span>{overflow?String(Math.round(progress*100)).padStart(2,'0')+'%':'↓'}</span><div><i style={{transform:`scaleX(${progress})`}}/></div></div>
  </div>;
}
