import {t} from '../../i18n/i18n';
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {useLocation} from 'react-router-dom';

class OceanSound{
  private context=new AudioContext();
  private audio=new Audio('/assets/ocean.ogg');
  private source=this.context.createMediaElementSource(this.audio);
  private filter=this.context.createBiquadFilter();
  private bass=this.context.createBiquadFilter();
  private volume=this.context.createGain();
  private active=false;
  private immersion=0;
  private revision=0;
  private pauseTimer=0;
  private disposed=false;
  constructor(){
    this.audio.loop=true;this.audio.preload='auto';
    this.filter.type='lowpass';this.filter.frequency.value=18000;this.filter.Q.value=.5;
    this.bass.type='lowshelf';this.bass.frequency.value=180;this.bass.gain.value=0;
    this.volume.gain.value=0;
    this.source.connect(this.filter).connect(this.bass).connect(this.volume).connect(this.context.destination);
  }
  setImmersion(value:number){
    this.immersion=Math.max(0,Math.min(1,value));
    if(this.disposed)return;
    const now=this.context.currentTime;
    this.filter.frequency.setTargetAtTime(18000*Math.pow(650/18000,this.immersion),now,.18);
    this.bass.gain.setTargetAtTime(this.immersion*3,now,.2);
    if(this.active)this.volume.gain.setTargetAtTime(.24+this.immersion*.06,now,.22);
  }
  async setActive(active:boolean){
    if(this.disposed||active===this.active)return;
    this.active=active;const revision=++this.revision;
    clearTimeout(this.pauseTimer);
    if(active){
      try{
        await this.context.resume();
        if(revision!==this.revision)return;
        await this.audio.play();
        if(revision!==this.revision){if(!this.active)this.audio.pause();return}
        this.setImmersion(this.immersion);
      }catch(error){if(revision===this.revision&&this.active)throw error}
    }else{
      this.volume.gain.setTargetAtTime(0,this.context.currentTime,.13);
      this.pauseTimer=window.setTimeout(()=>{
        if(this.active||this.disposed)return;
        this.audio.pause();void this.context.suspend().catch(()=>{});
      },750);
    }
  }
  dispose(){
    this.disposed=true;this.revision++;clearTimeout(this.pauseTimer);
    this.audio.pause();this.audio.removeAttribute('src');this.audio.load();
    this.source.disconnect();void this.context.close().catch(()=>{});
  }
}

type AudioControls={available:boolean;enabled:boolean;busy:boolean;error:boolean;environment:'surface'|'underwater';toggle:()=>void;setImmersion:(value:number)=>void};
const OceanAudioContext=createContext<AudioControls|null>(null);
export const useOceanAudio=()=>useContext(OceanAudioContext)!;

export function OceanAudioProvider({children}:{children:ReactNode}){
  const {pathname}=useLocation();
  const engine=useRef<OceanSound|null>(null),depth=useRef(0),enabledRef=useRef(false),availableRef=useRef(false);
  const [enabled,setEnabled]=useState(false),[available,setAvailable]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(false);
  const [environment,setEnvironment]=useState<'surface'|'underwater'>('surface');
  const environmentRef=useRef(environment);
  const failed=useCallback(()=>{enabledRef.current=false;setEnabled(false);setError(true);void engine.current?.setActive(false)},[]);
  const setImmersion=useCallback((value:number)=>{
    depth.current=value;engine.current?.setImmersion(value);
    const next=value>.5?'underwater':'surface';
    if(next!==environmentRef.current){environmentRef.current=next;setEnvironment(next)}
  },[]);
  useEffect(()=>{
    let frame=0;
    const measure=()=>{
      frame=0;
      const stage=document.querySelector<HTMLElement>('.ocean-stage');
      const rect=stage?.getBoundingClientRect();
      // The pinned scene uses svh, which can be shorter than innerHeight when
      // a phone's browser toolbar retracts. Its top marks the chapter boundary.
      const active=pathname==='/'&&!document.hidden&&!!rect&&rect.height>0&&Math.abs(rect.top)<=2&&!!stage?.classList.contains('is-presented')&&!document.querySelector('.page-curtain[data-active=true]');
      availableRef.current=active;setAvailable(active);
      void engine.current?.setActive(active&&enabledRef.current).catch(failed);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure)};
    // Hidden tabs stop animation frames, so pause audio directly on this event.
    const visibility=()=>{cancelAnimationFrame(frame);measure()};
    const observer=new MutationObserver(schedule);
    const main=document.querySelector('main'),curtain=document.querySelector('.page-curtain');
    if(main)observer.observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-scene-state']});
    if(curtain)observer.observe(curtain,{attributes:true,attributeFilter:['data-active']});
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',visibility);
    measure();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',visibility)};
  },[pathname,failed]);
  useEffect(()=>()=>{engine.current?.dispose();engine.current=null},[]);
  const toggle=useCallback(async()=>{
    if(busy)return;
    const next=!enabledRef.current;enabledRef.current=next;setEnabled(next);setError(false);
    if(!next){await engine.current?.setActive(false);return}
    setBusy(true);
    try{
      engine.current??=new OceanSound();engine.current.setImmersion(depth.current);
      await engine.current.setActive(availableRef.current);
    }catch{failed()}finally{setBusy(false)}
  },[busy,failed]);
  const value=useMemo(()=>({available,enabled,busy,error,environment,toggle,setImmersion}),[available,enabled,busy,error,environment,toggle,setImmersion]);
  return <OceanAudioContext.Provider value={value}>{children}</OceanAudioContext.Provider>;
}

export function AudioToggle(){
  const {available,enabled,busy,error,environment,toggle}=useOceanAudio();
  if(!available)return null;
  const label=enabled?t("Ⅱ Sound on"):t("≈ Sound off");
  return <div className="audio-control" data-environment={environment}><button disabled={busy} onClick={toggle} aria-pressed={enabled} aria-label={label} title={label}><svg className="audio-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>{enabled?<><path d="M16 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14"/></>:<path d="m17 9 5 6m0-6-5 6"/>}</svg><span className="audio-toggle-label">{label}</span></button>{error&&<span role="status">{t("Audio unavailable. Try again.")}</span>}</div>;
}
