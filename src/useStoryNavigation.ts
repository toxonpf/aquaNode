import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import type {SceneShot} from './sceneTypes';

export const chapters:SceneShot[]=['surface','detail','sensing','inside','signal'];
const GESTURE_PAUSE=280;

export function useStoryNavigation(story:RefObject<HTMLDivElement|null>,presented:boolean,staticScene:boolean){
  const [shot,setShot]=useState<SceneShot>('surface');
  const [settledShot,setSettledShot]=useState<SceneShot|null>('surface');
  const current=useRef<SceneShot>('surface');
  const readyAt=useRef(0);
  const options=useRef({presented,staticScene});
  options.current={presented,staticScene};
  const controls=useRef<{navigate:(shot:SceneShot)=>void}|null>(null);
  const select=useCallback((next:SceneShot)=>{
    if(next===current.current)return;
    current.current=next;readyAt.current=Infinity;
    setSettledShot(null);setShot(next);
  },[]);
  const onShotSettled=useCallback((next:SceneShot)=>{
    if(next!==current.current)return;
    setSettledShot(next);
    // Let the copy finish appearing before accepting a new gesture.
    readyAt.current=performance.now()+(matchMedia('(prefers-reduced-motion: reduce)').matches?0:700);
  },[]);
  useEffect(()=>{if(staticScene)onShotSettled(shot)},[staticScene,shot,onShotSettled]);

  useEffect(()=>{
    const host=story.current;
    if(!host)return;
    let lastInput=-Infinity,consumed=false,accumulated=0,direction=0,edgeUntil=0,gestureRead=false,keyRead=false;
    let touch:{x:number;y:number;lastY:number;captured:boolean;blocked:boolean;read:boolean}|null=null;
    let readerMotion:{node:HTMLElement;target:number;tween:gsap.core.Tween}|null=null;
    const readerFor=(chapter:SceneShot)=>host.querySelector<HTMLElement>(`[data-reader="${chapter}"] [data-story-scroll]`);
    const stopReading=()=>{readerMotion?.tween.kill();readerMotion=null};
    const dimensions=()=>{
      const height=host.querySelector('.ocean-stage')!.clientHeight;
      return {top:scrollY+host.getBoundingClientRect().top,height,step:(host.offsetHeight-height)/(chapters.length-1),bottom:scrollY+host.getBoundingClientRect().bottom};
    };
    let previousStep=dimensions().step;
    const navigate=(next:SceneShot,entry:'start'|'end'='start')=>{
      consumed=true;accumulated=0;lastInput=performance.now();
      stopReading();
      const reader=readerFor(next);
      if(reader&&next!==current.current)reader.scrollTop=entry==='end'?reader.scrollHeight-reader.clientHeight:0;
      select(next);
      const {top,step}=dimensions();
      window.scrollTo({top:top+chapters.indexOf(next)*step,behavior:'instant'});
    };
    controls.current={navigate};
    const syncPosition=()=>{
      const {top,step}=dimensions(),distance=scrollY-top;
      select(chapters[Math.min(chapters.length-1,Math.max(0,Math.floor((distance+2)/step)))])
    };
    const trigger=ScrollTrigger.create({trigger:host,start:'top top',end:'bottom bottom',onUpdate:syncPosition,onRefresh:syncPosition});
    const resize=()=>{
      const {top,step}=dimensions();
      if(scrollY>=top-2&&scrollY<=top+Math.max(previousStep,step)*(chapters.length-1)+2){
        window.scrollTo({top:top+chapters.indexOf(current.current)*step,behavior:'instant'});
      }
      previousStep=step;
    };
    const canHandle=(delta:number)=>{
      const {top,bottom}=dimensions();
      const exit=bottom-(innerWidth<=760?56:64);
      const y=scrollY;
      const now=performance.now();
      const leavingGesture=edgeUntil>0&&(now<edgeUntil||now-lastInput<GESTURE_PAUSE);
      return leavingGesture || (y>=top-2&&y<exit-1) || (delta<0&&y>=exit&&y+delta<exit) || (delta>0&&y<top&&y+delta>=top);
    };
    const blocked=()=>!options.current.presented||performance.now()<readyAt.current||performance.now()<edgeUntil;
    const scrollReading=(delta:number)=>{
      const {top,step}=dimensions();
      if(scrollY<top-2||scrollY>top+step*(chapters.length-1)+2)return false;
      const reader=readerFor(current.current);
      if(!reader)return false;
      const maximum=reader.scrollHeight-reader.clientHeight;
      const position=readerMotion?.node===reader?readerMotion.target:reader.scrollTop;
      const next=Math.max(0,Math.min(maximum,position+delta));
      if(maximum<2||Math.abs(next-position)<.5)return readerMotion?.node===reader;
      stopReading();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){reader.scrollTop=next;return true}
      const tween=gsap.to(reader,{scrollTop:next,duration:.35,ease:'power2.out',onComplete:()=>{if(readerMotion?.tween===tween)readerMotion=null}});
      readerMotion={node:reader,target:next,tween};
      return true;
    };
    const advance=(sign:number)=>{
      const {top,step,bottom}=dimensions();
      // Re-enter the story at its nearest chapter rather than crossing all of it.
      if(scrollY>top+step*(chapters.length-1)+2&&sign<0){
        select(chapters[chapters.length-1]);edgeUntil=performance.now()+800;
        window.scrollTo({top:top+step*(chapters.length-1),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        return;
      }
      const index=chapters.indexOf(current.current),next=index+sign;
      if(next>=0&&next<chapters.length){navigate(chapters[next],sign<0?'end':'start');return}
      if(next>=chapters.length){
        edgeUntil=performance.now()+800;
        window.scrollTo({top:bottom-(innerWidth<=760?56:64),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      }else if(top>0){
        edgeUntil=performance.now()+800;
        window.scrollTo({top:Math.max(0,top-dimensions().height),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      }
    };
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.deltaY===0)return;
      if((event.target as Element)?.closest?.('.site-header nav.open'))return;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
      if(!canHandle(delta))return;
      event.preventDefault();
      const now=performance.now(),sign=Math.sign(delta);
      if(now-lastInput>GESTURE_PAUSE){consumed=false;accumulated=0;direction=sign;gestureRead=false}
      lastInput=now;
      if(consumed||blocked()){consumed=true;return}
      if(scrollReading(delta)){gestureRead=true;return}
      // Reaching the end consumes this gesture; a fresh one changes the chapter.
      if(gestureRead)return;
      if(sign!==direction){direction=sign;accumulated=0}
      accumulated+=Math.abs(delta);
      if(accumulated<8)return;
      consumed=true;advance(sign);
    };
    const keydown=(event:KeyboardEvent)=>{
      if(event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target as Element;
      if(target?.closest?.('input,textarea,select,[contenteditable=true],.site-header nav.open'))return;
      if(event.key===' '&&target?.closest?.('button,a'))return;
      const sign=event.key==='ArrowDown'||event.key==='PageDown'||(event.key===' '&&!event.shiftKey)?1:event.key==='ArrowUp'||event.key==='PageUp'||(event.key===' '&&event.shiftKey)?-1:0;
      if(!sign||!canHandle(sign*innerHeight))return;
      event.preventDefault();
      if(blocked())return;
      const reader=readerFor(current.current);
      const delta=sign*(event.key.startsWith('Arrow')?48:(reader?.clientHeight??innerHeight)*.8);
      if(scrollReading(delta)){keyRead=true;return}
      if(keyRead||event.repeat||performance.now()-lastInput<GESTURE_PAUSE)return;
      consumed=true;lastInput=performance.now();advance(sign);
    };
    const keyup=()=>{keyRead=false};
    const touchstart=(event:TouchEvent)=>{
      if(event.touches.length!==1||(event.target as Element)?.closest?.('.site-header')){touch=null;return}
      touch={x:event.touches[0].clientX,y:event.touches[0].clientY,lastY:event.touches[0].clientY,captured:false,blocked:blocked(),read:false};
    };
    const touchmove=(event:TouchEvent)=>{
      if(!touch||event.touches.length!==1)return;
      const dx=touch.x-event.touches[0].clientX,dy=touch.y-event.touches[0].clientY;
      if(Math.abs(dy)<=Math.abs(dx)||!canHandle(dy))return;
      event.preventDefault();touch.captured=true;
      const delta=touch.lastY-event.touches[0].clientY;
      touch.lastY=event.touches[0].clientY;
      if(touch.blocked||blocked())return;
      if(scrollReading(delta)){touch.read=true;return}
      if(touch.read)return;
      // Consume the complete swipe, including any moves during the camera tween.
      if(Math.abs(dy)<30||touch.blocked)return;
      touch.blocked=true;consumed=true;lastInput=performance.now();
      if(!blocked())advance(Math.sign(dy));
    };
    const touchend=()=>{if(touch?.captured)lastInput=performance.now();touch=null};
    window.addEventListener('wheel',wheel,{passive:false});
    window.addEventListener('resize',resize);
    window.addEventListener('keydown',keydown);
    window.addEventListener('keyup',keyup);
    window.addEventListener('touchstart',touchstart,{passive:true});
    window.addEventListener('touchmove',touchmove,{passive:false});
    window.addEventListener('touchend',touchend);
    window.addEventListener('touchcancel',touchend);
    return()=>{
      trigger.kill();controls.current=null;stopReading();
      window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',keydown);
      window.removeEventListener('keyup',keyup);
      window.removeEventListener('resize',resize);
      window.removeEventListener('touchstart',touchstart);window.removeEventListener('touchmove',touchmove);
      window.removeEventListener('touchend',touchend);window.removeEventListener('touchcancel',touchend);
    };
  },[story,select]);
  const navigate=useCallback((next:SceneShot)=>controls.current?.navigate(next),[]);
  return {shot,settledShot,onShotSettled,navigate};
}
