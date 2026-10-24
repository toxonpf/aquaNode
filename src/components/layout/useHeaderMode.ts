import {useLayoutEffect,useState} from 'react';

export function useHeaderMode(pathname:string){
  const [solid,setSolid]=useState(pathname!=='/');
  useLayoutEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;
      const story=document.querySelector('.ocean-story');
      setSolid(pathname!=='/'||!story||story.getBoundingClientRect().bottom<innerHeight-2);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    update();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
  },[pathname]);
  return pathname!=='/'||solid;
}
