import {useEffect} from 'react';
import {createPageScroller} from './pageScroller';

function usesOwnScroll(target:EventTarget|null){
  let element=target instanceof Element?target:null;
  while(element&&element!==document.body){
    if(element.matches('dialog,textarea,input,select,[contenteditable=true],[data-native-scroll],.story-scroll,.site-header nav.open'))return true;
    if(element.matches('.scene')&&!element.closest('.node-viewer'))return true;
    const style=getComputedStyle(element);
    if(/(auto|scroll)/.test(style.overflowY)&&element.scrollHeight>element.clientHeight+2)return true;
    element=element.parentElement;
  }
  return false;
}

export function useComfortScroll(pathname:string){
  useEffect(()=>{
    // The overview uses the same scroller with its ocean return boundary.
    if(pathname==='/')return;
    const root=document.documentElement;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const coarse=matchMedia('(pointer: coarse)');
    const scroller=createPageScroller(()=>({min:0,max:Math.max(0,root.scrollHeight-innerHeight)}));
    const stop=()=>scroller.stop();
    const onWheel=(event:WheelEvent)=>{
      if(reduced.matches||coarse.matches||event.defaultPrevented||!event.cancelable||event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||usesOwnScroll(event.target)||document.querySelector('dialog[open]')){stop();return}
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
      if(!delta)return;
      // Keep native scrolling out of a still-running animation at its edge.
      event.preventDefault();scroller.add(delta);
    };
    const onKey=(event:KeyboardEvent)=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))stop()};
    window.addEventListener('wheel',onWheel,{passive:false});
    window.addEventListener('keydown',onKey);
    window.addEventListener('pointerdown',stop);
    window.addEventListener('click',stop);
    window.addEventListener('touchstart',stop,{passive:true});
    reduced.addEventListener('change',stop);
    return()=>{stop();window.removeEventListener('wheel',onWheel);window.removeEventListener('keydown',onKey);window.removeEventListener('pointerdown',stop);window.removeEventListener('click',stop);window.removeEventListener('touchstart',stop);reduced.removeEventListener('change',stop)};
  },[pathname]);
}
