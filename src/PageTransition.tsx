import {useLayoutEffect,useRef,useState} from 'react';
import {useLocation} from 'react-router-dom';
import gsap from 'gsap';
import './transitions.css';
import BrandLogo from './BrandLogo';

// Mount the new route under an opaque cover. Only reveal scenes after their first frame.
function waitForPage(onReady:()=>void){
  let timer=0,cancelled=false;
  const check=()=>{
    clearTimeout(timer);
    const pending=Array.from(document.querySelectorAll<HTMLElement>('main .viewer')).some(viewer=>{
      const rect=viewer.getBoundingClientRect();
      return rect.top<innerHeight+200&&rect.bottom>0&&viewer.dataset.sceneState==='loading';
    });
    const ocean=document.querySelector('.ocean-stage');
    if(pending||(ocean&&!ocean.classList.contains('is-presented')))return;
    timer=window.setTimeout(()=>{if(!cancelled){observer.disconnect();onReady()}},120);
  };
  const observer=new MutationObserver(check);
  observer.observe(document.querySelector('main')!,{subtree:true,childList:true,attributes:true,attributeFilter:['data-scene-state','class']});
  const frame=requestAnimationFrame(check);
  return()=>{cancelled=true;cancelAnimationFrame(frame);clearTimeout(timer);observer.disconnect()};
}

export function usePageTransition(){
  const location=useLocation();
  const [displayed,setDisplayed]=useState(location);
  const curtain=useRef<HTMLDivElement>(null);
  const motion=useRef<gsap.core.Timeline|null>(null);
  const cancelReady=useRef<(()=>void)|null>(null),initial=useRef(true);
  const origin=useRef({x:0,y:0,time:-Infinity});
  const samePage=location.pathname===displayed.pathname&&location.search===displayed.search;
  const finish=()=>{
    const element=curtain.current;if(!element)return;
    delete element.dataset.active;delete element.dataset.phase;
    gsap.set(element,{'--cover-radius':'0px','--opening-radius':'0px'});
  };
  const reveal=()=>{
    const element=curtain.current;if(!element)return;
    element.dataset.phase='revealing';
    motion.current=gsap.timeline({onComplete:finish})
      .to(element,{'--opening-radius':element.style.getPropertyValue('--full-radius'),'--ripple-radius':`${parseFloat(element.style.getPropertyValue('--full-radius'))*1.2}px`,duration:.76,ease:'power2.inOut'},0)
      .to(element.querySelector('.page-curtain-wordmark'),{opacity:0,duration:.22,ease:'sine.in'},0);
  };
  const wait=()=>{
    cancelReady.current?.();
    cancelReady.current=waitForPage(reveal);
  };
  const prepare=(direct=false)=>{
    const element=curtain.current!;
    gsap.set(element,{clearProps:'transform'});
    const recent=!direct&&performance.now()-origin.current.time<1000;
    const x=recent?origin.current.x:innerWidth*.5,y=recent?origin.current.y:innerHeight*.45;
    const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+12;
    gsap.set(element,{'--wave-x':`${x}px`,'--wave-y':`${y}px`,'--full-radius':`${radius}px`,'--cover-radius':direct?`${radius}px`:'0px','--opening-radius':'0px','--ripple-radius':'0px'});
  };

  useLayoutEffect(()=>{
    const remember=(event:MouseEvent)=>{
      const anchor=event.target instanceof Element?event.target.closest('a[href]'):null;
      if(!anchor||anchor.hasAttribute('download')||anchor.getAttribute('target')==='_blank')return;
      const url=new URL(anchor.getAttribute('href')!,window.location.href);
      if(url.origin!==window.location.origin)return;
      const rect=anchor.getBoundingClientRect();
      origin.current={x:event.detail?event.clientX:rect.left+rect.width/2,y:event.detail?event.clientY:rect.top+rect.height/2,time:performance.now()};
    };
    document.addEventListener('click',remember,true);
    return()=>document.removeEventListener('click',remember,true);
  },[]);

  useLayoutEffect(()=>{
    const element=curtain.current;if(!element)return;
    motion.current?.kill();cancelReady.current?.();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(initial.current){
      initial.current=false;
      if(!reduced&&(location.pathname==='/'||location.pathname==='/technology')){
        element.dataset.active='true';element.dataset.phase='loading';
        prepare(true);gsap.set(element.querySelector('.page-curtain-wordmark'),{opacity:1});
      }
      return;
    }
    if(reduced){finish();setDisplayed(location);return}
    if(samePage){
      setDisplayed(location);
      if(element.dataset.phase==='covering'){
        element.dataset.phase='revealing';
        motion.current=gsap.timeline({onComplete:finish})
          .to(element,{'--cover-radius':'0px',duration:.32,ease:'power2.out'},0)
          .to(element.querySelector('.page-curtain-wordmark'),{opacity:0,duration:.2},0);
      }else if(element.dataset.active){element.dataset.phase='loading';wait()}
      return;
    }
    if(!element.dataset.active)prepare();
    element.dataset.active='true';element.dataset.phase='covering';
    gsap.set(element.querySelector('.page-curtain-wordmark'),{opacity:0});
    motion.current=gsap.timeline({onComplete:()=>{element.dataset.phase='loading';setDisplayed(location)}})
      .to(element,{'--cover-radius':element.style.getPropertyValue('--full-radius'),'--opening-radius':'0px','--ripple-radius':`${parseFloat(element.style.getPropertyValue('--full-radius'))*.65}px`,duration:.56,ease:'power3.inOut'},0)
      .to(element.querySelector('.page-curtain-wordmark'),{opacity:1,duration:.24,ease:'sine.out'},.26);
  },[location]);

  useLayoutEffect(()=>{
    if(curtain.current?.dataset.phase==='loading')wait();
    return()=>{cancelReady.current?.()};
  },[displayed.pathname,displayed.search]);
  useLayoutEffect(()=>()=>{motion.current?.kill();cancelReady.current?.()},[]);
  return {displayed,curtain};
}

export function PageCurtain({curtain}:{curtain:React.RefObject<HTMLDivElement|null>}){
  return <div ref={curtain} className="page-curtain" aria-hidden="true"><div className="page-curtain-ripples"><i/><i/><i/></div><span className="page-curtain-wordmark"><BrandLogo loading/><span>OBSERVE. UNDERSTAND.</span><span className="page-curtain-loading"><i/></span></span></div>;
}
