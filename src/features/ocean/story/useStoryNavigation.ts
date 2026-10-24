import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import type {SceneShot} from '../sceneTypes';
import {STORY_HOME_EVENT} from '../../../shared/navigation/pageScroll';
import {createPageScroller} from '../../../shared/navigation/pageScroller';

export const chapters:SceneShot[]=['surface','detail','sensing','inside','signal'];
const GESTURE_PAUSE=280;

export function useStoryNavigation(story:RefObject<HTMLDivElement|null>,presented:boolean,staticScene:boolean){
  const [shot,setShot]=useState<SceneShot>('surface');
  const [settledShot,setSettledShot]=useState<SceneShot|null>('surface');
  const [returnHint,setReturnHint]=useState(false);
  const current=useRef<SceneShot>('surface');
  const readyAt=useRef(0);
  const resumeReading=useRef(()=>{});
  const options=useRef({presented,staticScene});
  options.current={presented,staticScene};
  const controls=useRef<{navigate:(shot:SceneShot)=>void;skip:()=>void;returnToStory:()=>void}|null>(null);
  const select=useCallback((next:SceneShot)=>{
    if(next===current.current)return;
    current.current=next;readyAt.current=Infinity;
    setSettledShot(null);setShot(next);
  },[]);
  const onShotSettled=useCallback((next:SceneShot)=>{
    if(next!==current.current)return;
    setSettledShot(next);
    // Reading starts with new input after the camera and copy are ready.
    readyAt.current=performance.now()+(matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);
    resumeReading.current();
  },[]);
  useEffect(()=>{if(staticScene)onShotSettled(shot)},[staticScene,shot,onShotSettled]);

  useEffect(()=>{
    const host=story.current;
    if(!host)return;
    let lastInput=-Infinity,lastDelta=0,edgeIntent=0,edgePulses=0,consumed=false,accumulated=0,direction=0,edgeUntil=0,gestureRead=false,keyRead=false;
    let touch:{x:number;y:number;lastY:number;captured:boolean;blocked:boolean;read:boolean;edgeIntent:number}|null=null;
    let readerMotion:{node:HTMLElement;target:number;tween:gsap.core.Tween}|null=null;
    let pageMotion:gsap.core.Tween|null=null;
    let contentMotion:{target:number;tween:gsap.core.Tween}|null=null;
    let resumeTimer=0;
    let contentMode=false;
    let exploredContent=false;
    resumeReading.current=()=>{
      window.clearTimeout(resumeTimer);
      resumeTimer=window.setTimeout(()=>{
        consumed=false;accumulated=0;gestureRead=false;edgeIntent=0;edgePulses=0;
      },Math.max(0,readyAt.current-performance.now())+16);
    };
    const readerFor=(chapter:SceneShot)=>host.querySelector<HTMLElement>(`[data-reader="${chapter}"] [data-story-scroll]`);
    const stopReading=()=>{readerMotion?.tween.kill();readerMotion=null};
    const dimensions=()=>{
      const height=host.querySelector('.ocean-stage')!.clientHeight;
      return {top:scrollY+host.getBoundingClientRect().top,height,step:(host.offsetHeight-height)/(chapters.length-1),bottom:scrollY+host.getBoundingClientRect().bottom};
    };
    let previousStep=dimensions().step;
    const contentEdge=()=>dimensions().bottom-(innerWidth<=760?56:64);
    const updateReturnHint=()=>{
      const visible=contentMode&&exploredContent&&options.current.presented&&Math.abs(scrollY-contentEdge())<=2;
      if(visible){
        const award=document.querySelector<HTMLElement>('.award');
        host.style.setProperty('--return-hint-top',`${(innerWidth<=760?56:64)+(award?.offsetHeight??70)+12}px`);
      }
      setReturnHint(visible);
    };
    const documentScroller=createPageScroller(()=>({min:contentEdge(),max:Math.max(contentEdge(),document.documentElement.scrollHeight-innerHeight)}),updateReturnHint);
    const stopDocument=()=>documentScroller.stop();
    const stopContent=()=>{contentMotion?.tween.kill();contentMotion=null;stopDocument()};
    const navigate=(next:SceneShot,entry:'start'|'end'='start')=>{
      contentMode=false;exploredContent=false;stopContent();setReturnHint(false);
      window.clearTimeout(resumeTimer);
      pageMotion?.kill();pageMotion=null;
      consumed=true;accumulated=0;lastInput=performance.now();
      stopReading();
      const reader=readerFor(next);
      if(reader&&next!==current.current)reader.scrollTop=entry==='end'?reader.scrollHeight-reader.clientHeight:0;
      select(next);
      const {top,step}=dimensions();
      window.scrollTo({top:top+chapters.indexOf(next)*step,behavior:'instant'});
    };
    const syncPosition=()=>{
      if(pageMotion)return;
      const {top,step}=dimensions(),distance=scrollY-top;
      select(chapters[Math.min(chapters.length-1,Math.max(0,Math.floor((distance+2)/step)))])
    };
    const scrollPage=(destination:number)=>{
      stopContent();
      pageMotion?.kill();stopReading();consumed=true;edgeIntent=0;lastInput=performance.now();
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduced||Math.abs(destination-scrollY)<1){pageMotion=null;window.scrollTo({top:destination,behavior:'instant'});contentMode=destination>=contentEdge()-1;syncPosition();updateReturnHint();return}
      const position={y:scrollY};
      pageMotion=gsap.to(position,{y:destination,duration:.9,ease:'power3.inOut',onUpdate:()=>window.scrollTo({top:position.y,behavior:'instant'}),onComplete:()=>{pageMotion=null;contentMode=destination>=contentEdge()-1;syncPosition();updateReturnHint()}});
    };
    const skip=()=>{
      exploredContent=false;setReturnHint(false);
      const content=document.querySelector('.award')??document.querySelector('#progress');
      if(content)scrollPage(scrollY+content.getBoundingClientRect().top-(innerWidth<=760?56:64));
    };
    const home=(event:Event)=>{
      event.preventDefault();contentMode=false;exploredContent=false;setReturnHint(false);select('surface');
      host.querySelectorAll<HTMLElement>('[data-story-scroll]').forEach(reader=>{reader.scrollTop=0});
      scrollPage(0);
    };
    controls.current={navigate,skip,returnToStory:()=>advance(-1)};
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
      return leavingGesture || (y>=top-2&&y<exit-1) || (delta<0&&y>=exit-1) || (delta>0&&y<top&&y+delta>=top);
    };
    const blocked=()=>!!pageMotion||!options.current.presented||performance.now()<readyAt.current||performance.now()<edgeUntil;
    // Bound the input destination before scrolling. Correcting native scroll
    // in a `scroll` handler exposes the ocean for a frame, then snaps back.
    const scrollContent=(delta:number)=>{
      if(delta>=0){stopContent();return false}
      const edge=contentEdge();
      if(scrollY<=edge+1&&!contentMotion)return false;
      contentMode=true;
      if(scrollY>edge+32)exploredContent=true;
      const position=contentMotion?.target??scrollY;
      const target=Math.max(edge,position+delta);
      if(target<=edge+1){consumed=true;lastInput=performance.now()}
      if(contentMotion&&Math.abs(target-contentMotion.target)<.5)return true;
      stopContent();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){
        window.scrollTo({top:target,behavior:'instant'});updateReturnHint();return true;
      }
      const point={y:scrollY};
      const tween=gsap.to(point,{y:target,duration:.28,ease:'power2.out',onUpdate:()=>window.scrollTo({top:Math.max(contentEdge(),point.y),behavior:'instant'}),onComplete:()=>{
        if(contentMotion?.tween===tween)contentMotion=null;
        updateReturnHint();
      }});
      contentMotion={target,tween};
      return true;
    };
    const pageScroll=()=>{
      if(pageMotion)return;
      const edge=contentEdge();
      if(scrollY>=edge-1)contentMode=true;
      if(contentMode&&scrollY>edge+32)exploredContent=true;
      if(contentMode&&scrollY<edge-1){
        // Explicit scrollbar/programmatic navigation must not be bounced
        // back after the destination has already been painted.
        contentMode=false;exploredContent=false;
      }
      updateReturnHint();
    };
    const atReadingEdge=(sign:number)=>{
      const reader=readerFor(current.current);
      return !reader||(sign>0?reader.scrollHeight-reader.clientHeight-reader.scrollTop<=.5:reader.scrollTop<=.5);
    };
    const scrollReading=(delta:number)=>{
      const {top,step}=dimensions();
      if(scrollY<top-2||scrollY>top+step*(chapters.length-1)+2)return false;
      const reader=readerFor(current.current);
      if(!reader)return false;
      const maximum=reader.scrollHeight-reader.clientHeight;
      const position=readerMotion?.node===reader?readerMotion.target:reader.scrollTop;
      const next=Math.max(0,Math.min(maximum,position+delta));
      if(maximum<2)return false;
      if(Math.abs(next-position)<.5)return !atReadingEdge(Math.sign(delta));
      stopReading();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){reader.scrollTop=next;return true}
      const tween=gsap.to(reader,{scrollTop:next,duration:.35,ease:'power2.out',onComplete:()=>{
        if(readerMotion?.tween===tween)readerMotion=null;
      }});
      readerMotion={node:reader,target:next,tween};
      return true;
    };
    const advance=(sign:number)=>{
      const {top,step,bottom}=dimensions();
      // Re-enter the story at its nearest chapter rather than crossing all of it.
      if(scrollY>top+step*(chapters.length-1)+2&&sign<0){
        contentMode=false;exploredContent=false;stopContent();setReturnHint(false);
        const reader=readerFor('signal');
        if(reader)reader.scrollTop=reader.scrollHeight-reader.clientHeight;
        select('signal');edgeUntil=performance.now()+800;
        scrollPage(top+step*(chapters.length-1));
        return;
      }
      const index=chapters.indexOf(current.current),next=index+sign;
      if(next>=0&&next<chapters.length){navigate(chapters[next],sign<0?'end':'start');return}
      if(next>=chapters.length){
        edgeUntil=performance.now()+800;
        scrollPage(bottom-(innerWidth<=760?56:64));
      }else if(top>0){
        edgeUntil=performance.now()+800;
        window.scrollTo({top:Math.max(0,top-dimensions().height),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      }
    };
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.deltaY===0){stopDocument();return}
      if((event.target as Element)?.closest?.('.site-header nav.open'))return;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
      if(!canHandle(delta)&&scrollY<contentEdge()-1)return;
      event.preventDefault();
      const now=performance.now(),sign=Math.sign(delta),magnitude=Math.abs(delta),previousDelta=lastDelta,lastInputBeforeWheel=lastInput;
      if(now-lastInput>GESTURE_PAUSE||sign!==direction){consumed=false;accumulated=0;direction=sign;gestureRead=false;edgeIntent=0;edgePulses=0}
      lastInput=now;lastDelta=magnitude;
      // The main document eases in both directions with the same controller
      // as the other pages. Keep the story-exit gesture consumed at its edge.
      const edge=contentEdge();
      const leavingGesture=edgeUntil>0&&(now<edgeUntil||now-lastInputBeforeWheel<GESTURE_PAUSE);
      if(!leavingGesture&&scrollY>=edge-1)edgeUntil=0;
      if(!pageMotion&&!leavingGesture&&scrollY>=edge-1&&(delta>0||scrollY>edge+1||documentScroller.moving)){
        contentMode=true;
        if(scrollY>edge+32)exploredContent=true;
        if(delta<0&&documentScroller.target+delta<=edge+1){consumed=true;lastInput=now}
        contentMotion?.tween.kill();contentMotion=null;
        documentScroller.add(delta,!matchMedia('(prefers-reduced-motion: reduce)').matches&&!matchMedia('(pointer: coarse)').matches);
        return;
      }
      if(delta>0)stopContent();
      if(!pageMotion&&scrollContent(delta))return;
      if(consumed||blocked()){
        consumed=true;return;
      }
      if(scrollReading(delta)){
        gestureRead=true;edgeIntent=0;edgePulses=0;
        return;
      }
      // Continued deliberate input can leave a fully read chapter without a
      // pause. A diminishing momentum tail must not make that decision.
      if(gestureRead){
        if(!atReadingEdge(sign))return;
        // Only additional input at the visible boundary counts. A single
        // large wheel event or a fading swipe tail cannot leave the chapter.
        const deliberate=magnitude>=Math.max(18,previousDelta*.98);
        edgeIntent=deliberate?edgeIntent+magnitude:0;
        edgePulses=deliberate?edgePulses+1:0;
        if(edgeIntent<80||edgePulses<2)return;
      }
      if(sign!==direction){direction=sign;accumulated=0}
      accumulated+=Math.abs(delta);
      if(accumulated<8)return;
      consumed=true;advance(sign);
    };
    const keydown=(event:KeyboardEvent)=>{
      if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))stopDocument();
      if(event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target as Element;
      if(target?.closest?.('input,textarea,select,[contenteditable=true],.site-header nav.open'))return;
      if(event.key===' '&&target?.closest?.('button,a'))return;
      const sign=event.key==='ArrowDown'||event.key==='PageDown'||(event.key===' '&&!event.shiftKey)?1:event.key==='ArrowUp'||event.key==='PageUp'||(event.key===' '&&event.shiftKey)?-1:0;
      const pageDelta=sign*(event.key.startsWith('Arrow')?48:innerHeight*.8);
      if(pageDelta>0)stopContent();
      if(!sign||!canHandle(pageDelta))return;
      event.preventDefault();
      if(!pageMotion&&scrollContent(pageDelta))return;
      if(blocked())return;
      const reader=readerFor(current.current);
      const delta=sign*(event.key.startsWith('Arrow')?48:(reader?.clientHeight??innerHeight)*.8);
      if(scrollReading(delta)){keyRead=true;return}
      if(keyRead||event.repeat||performance.now()-lastInput<GESTURE_PAUSE)return;
      consumed=true;lastInput=performance.now();advance(sign);
    };
    const keyup=()=>{keyRead=false};
    const touchstart=(event:TouchEvent)=>{
      stopDocument();
      if(event.touches.length!==1||(event.target as Element)?.closest?.('.site-header')){touch=null;return}
      touch={x:event.touches[0].clientX,y:event.touches[0].clientY,lastY:event.touches[0].clientY,captured:false,blocked:blocked(),read:false,edgeIntent:0};
    };
    const touchmove=(event:TouchEvent)=>{
      if(!touch||event.touches.length!==1)return;
      const dx=touch.x-event.touches[0].clientX,dy=touch.y-event.touches[0].clientY;
      const delta=touch.lastY-event.touches[0].clientY;
      touch.lastY=event.touches[0].clientY;
      if(delta>0)stopContent();
      if(Math.abs(dy)<=Math.abs(dx)||!canHandle(delta))return;
      event.preventDefault();touch.captured=true;
      if(!pageMotion&&scrollContent(delta)){
        if((contentMotion?.target??scrollY)<=contentEdge()+1)touch.blocked=true;
        return;
      }
      if(touch.blocked||blocked())return;
      if(scrollReading(delta)){touch.read=true;touch.edgeIntent=0;return}
      if(touch.read){
        if(!atReadingEdge(Math.sign(dy)))return;
        touch.edgeIntent+=Math.sign(dy)*delta;
        if(touch.edgeIntent<60)return;
      }
      // Consume the complete swipe, including any moves during the camera tween.
      if(Math.abs(dy)<30||touch.blocked)return;
      touch.blocked=true;consumed=true;lastInput=performance.now();
      if(!blocked())advance(Math.sign(dy));
    };
    const touchend=()=>{if(touch?.captured)lastInput=performance.now();touch=null};
    window.addEventListener('wheel',wheel,{passive:false});
    window.addEventListener('pointerdown',stopDocument);
    window.addEventListener('click',stopDocument);
    window.addEventListener('scroll',pageScroll,{passive:true});
    window.addEventListener(STORY_HOME_EVENT,home);
    window.addEventListener('resize',resize);
    window.addEventListener('keydown',keydown);
    window.addEventListener('keyup',keyup);
    window.addEventListener('touchstart',touchstart,{passive:true});
    window.addEventListener('touchmove',touchmove,{passive:false});
    window.addEventListener('touchend',touchend);
    window.addEventListener('touchcancel',touchend);
    return()=>{
      trigger.kill();controls.current=null;stopReading();stopContent();pageMotion?.kill();
      window.clearTimeout(resumeTimer);resumeReading.current=()=>{};
      window.removeEventListener(STORY_HOME_EVENT,home);
      window.removeEventListener('scroll',pageScroll);
      window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',keydown);
      window.removeEventListener('pointerdown',stopDocument);window.removeEventListener('click',stopDocument);
      window.removeEventListener('keyup',keyup);
      window.removeEventListener('resize',resize);
      window.removeEventListener('touchstart',touchstart);window.removeEventListener('touchmove',touchmove);
      window.removeEventListener('touchend',touchend);window.removeEventListener('touchcancel',touchend);
    };
  },[story,select]);
  const navigate=useCallback((next:SceneShot)=>controls.current?.navigate(next),[]);
  const skip=useCallback(()=>controls.current?.skip(),[]);
  const returnToStory=useCallback(()=>controls.current?.returnToStory(),[]);
  return {shot,settledShot,onShotSettled,navigate,skip,returnHint,returnToStory};
}
