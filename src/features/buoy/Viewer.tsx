import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import {t} from '../i18n/i18n';
import {parts} from '../../data/content';
import BuoyDrawing from './BuoyDrawing';
import AnimatedHeight from '../../components/ui/AnimatedHeight';
import NetworkDrawing from '../ocean/scene/NetworkDrawing';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import type {BuoyAnchorHandler} from './buoyAnchors';
import type {SceneShot,SensorKind} from '../ocean/sceneTypes';

let sceneModule:Promise<typeof import('../ocean/scene/Scene')>|undefined;
const loadScene=()=>sceneModule??=import('../ocean/scene/Scene');
const Scene=lazy(loadScene);
export type SceneState='loading'|'ready'|'static';
class SceneBoundary extends React.Component<{children:React.ReactNode;onUnavailable:()=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){this.props.onUnavailable()}
  render(){return this.state.failed?null:this.props.children}
}
export function LoadingIndicator({ocean=false,progress}:{ocean?:boolean;progress?:number}){
  return <div className="loading-indicator" role="status">
    <div className="loading-caption"><span>{ocean?t("LOADING THE OCEAN"):t("LOADING THE MODEL")}</span>{progress!==undefined&&<span className="loading-percentage">{progress}%</span>}</div>
    <div className={'loading-bar'+(progress===undefined?' is-indeterminate':'')} role="progressbar" aria-label={ocean?t("Loading the ocean"):t("Loading the model")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={progress!==undefined?{transform:`scaleX(${progress/100})`}:undefined}/></div>
  </div>;
}
export default function Viewer({hero=false,onStateChange,onProgress,shot='surface',onShotSettled,sensor='ph',onSensorChange,onBuoyAnchor,onImmersionChange,insideVisible=false,showcase=false,activePart,onPartChange}:{hero?:boolean;onStateChange?:(state:SceneState)=>void;onProgress?:(progress:number)=>void;shot?:SceneShot;onShotSettled?:(shot:SceneShot)=>void;sensor?:SensorKind;onSensorChange?:(sensor:SensorKind)=>void;onBuoyAnchor?:BuoyAnchorHandler;onImmersionChange?:(value:number)=>void;insideVisible?:boolean;showcase?:boolean;activePart?:number;onPartChange?:(part:number)=>void}){
  const [localActive,setLocalActive]=useState(0),[angle,setAngle]=useState(0),[expanded,setExpanded]=useState(false);
  const active=activePart??localActive;
  const setActive=(value:number)=>{setLocalActive(value);onPartChange?.(value)};
  const [mode,setMode]=useState<'checking'|'webgl'|'static'>('checking');
  const [visible,setVisible]=useState(hero),[ready,setReady]=useState(false);
  const enabled=mode==='webgl';
  const state:SceneState=mode==='static'?'static':ready?'ready':'loading';
  const viewerRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{onStateChange?.(state)},[state,onStateChange]);
  useEffect(()=>{
    if(!onProgress)return;
    if(mode==='static'){onProgress(100);return}
    if(!enabled||!visible)return;
    let cancelled=false;
    onProgress(20);
    loadScene().then(()=>{if(!cancelled)onProgress(65)},()=>{});
    return()=>{cancelled=true};
  },[mode,enabled,visible,onProgress]);
  useEffect(()=>{
    if(hero)return;
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect()}},{rootMargin:'200px'});
    if(viewerRef.current)observer.observe(viewerRef.current);
    return()=>observer.disconnect();
  },[hero]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const check=()=>{
      const low=navigator as Navigator & {deviceMemory?:number;connection?:{saveData:boolean}};
      setReady(false);
      if(media.matches||(low.deviceMemory&&low.deviceMemory<=2)||low.connection?.saveData){setMode('static');return}
      try{
        const canvas=document.createElement('canvas');
        const gl=canvas.getContext('webgl2');
        setMode(gl?'webgl':'static');
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      }catch{setMode('static')}
    };
    check();media.addEventListener('change',check);
    return()=>media.removeEventListener('change',check);
  },[]);
  const unavailable=()=>{setReady(false);setMode('static')};
  useEffect(()=>{
    if(!enabled||!visible||ready)return;
    const timeout=window.setTimeout(()=>setMode('static'),15000);
    return()=>window.clearTimeout(timeout);
  },[enabled,visible,ready]);
  return <div ref={viewerRef} className={'viewer '+(hero?'hero-viewer':'')+(showcase?' node-viewer':'')} data-scene-state={state}>
    <div className="scene" aria-label={t("Conceptual buoy model")} aria-busy={state==='loading'}>
{mode==='static'?(hero&&shot==='signal'?<NetworkDrawing/>:<BuoyDrawing/>):enabled&&visible?<div className="scene-live" data-ready={ready} aria-hidden={!ready}><SceneBoundary onUnavailable={unavailable}><Suspense fallback={null}><Scene hero={hero} enableZoom={!showcase} onBuoyAnchor={onBuoyAnchor} onImmersionChange={onImmersionChange} shot={shot} showInside={insideVisible} sensor={sensor} onSensorChange={onSensorChange} onShotSettled={onShotSettled} onProgress={onProgress} active={active} angle={angle} expanded={expanded} onReady={()=>{setReady(true);onProgress?.(100)}} onUnavailable={unavailable}/></Suspense></SceneBoundary></div>:null}
      {!hero&&state==='loading'&&<div className="model-loading"><LoadingIndicator/></div>}
    </div>
    <div className="scene-caption"><span className="tiny-dot"/> {t("CONCEPT MODEL")} <span>{t("Illustrative design")}</span></div>
    {!hero&&<><div className="viewer-controls"><button onClick={()=>setAngle(v=>v-.4)} disabled={!enabled} aria-label={t("Rotate buoy left")}><FlexibleArrow direction="left"/></button><button onClick={()=>setAngle(v=>v+.4)} disabled={!enabled} aria-label={t("Rotate buoy right")}><FlexibleArrow/></button><button aria-pressed={expanded} onClick={()=>setExpanded(!expanded)} disabled={!enabled}>{expanded?t("Close structure"):t("Separate parts")}</button><button className="viewer-reset" aria-label={t("Reset")} onClick={()=>{setAngle(0);setExpanded(false);setActive(0)}} disabled={!enabled}><svg className="viewer-reset-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg><span className="viewer-reset-label">{t("Reset")}</span></button></div>{!showcase&&<><div className="part-tabs" aria-label={t("Buoy parts")}>{parts.map((p,i)=><button key={p.name} onClick={()=>setActive(i)} aria-pressed={i===active}>{String(i+1).padStart(2,'0')} {p.name}</button>)}</div><AnimatedHeight className="part-description" aria-live="polite"><p>{parts[active].text}</p></AnimatedHeight></>}<p className="helper">{enabled?(showcase?t("Drag to orbit · Scroll to continue · Use buttons for keyboard control"):t("Drag to orbit · Pinch to zoom · Use buttons for keyboard control")):showcase?t("Select a part to explore the buoy."):t("Explore each part using the controls below.")}</p></>}
  </div>;
}
