import {t} from '../../i18n/i18n';
import FlexibleArrow from '../../../components/ui/FlexibleArrow';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {SceneShot} from '../sceneTypes';
import {readingMetrics} from './readingMetrics';

export default function StoryPanel({chapter,className,label,children}:{chapter:SceneShot;className:string;label:string;children:ReactNode}){
  const reader=useRef<HTMLDivElement>(null);
  const [progress,setProgress]=useState(0);
  const [overflow,setOverflow]=useState(false);
  useEffect(()=>{
    const node=reader.current;
    if(!node)return;
    const measure=()=>{
      const state=readingMetrics(node);
      setOverflow(state.overflow);
      setProgress(state.progress);
    };
    node.addEventListener('scroll',measure,{passive:true});
    const resize=new ResizeObserver(measure);
    resize.observe(node);
    Array.from(node.children).forEach(child=>resize.observe(child));
    measure();
    return()=>{node.removeEventListener('scroll',measure);resize.disconnect()};
  },[]);
  return <div className="story-panel" data-reader={chapter} data-heading-lines="2" data-at-start={progress<.005} data-at-end={progress===1}>
    <div ref={reader} className={className+' story-scroll'} data-story-scroll tabIndex={0} role="region" aria-label={label}>{children}</div>
    <div className="story-reading-status" aria-hidden="true"><span>{overflow&&progress<1?t("SCROLL TO READ MORE"):t("SCROLL TO THE NEXT CHAPTER")}</span><span>{overflow?String(Math.floor(progress*100)).padStart(2,'0')+'%':<FlexibleArrow direction="down"/>}</span><div><i style={{transform:`scaleX(${progress})`}}/></div></div>
  </div>;
}
