import SectionLabel from '../../components/ui/SectionLabel';
import {useCallback,useEffect,useRef,useState} from 'react';
import {t} from '../i18n/i18n';
import Heading from '../../components/ui/Heading';
import ArrowLink from '../../components/ui/ArrowLink';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import Viewer,{LoadingIndicator,type SceneState} from '../buoy/Viewer';
import BuoyAnnotation,{type BuoyAnnotationHandle} from './story/BuoyAnnotation';
import type {BuoyAnchorHandler} from '../buoy/buoyAnchors';
import type {SceneShot,SensorKind} from './sceneTypes';
import SensorPanel from './story/SensorPanel';
import StoryPanel from './story/StoryPanel';
import OceanSkip from './story/OceanSkip';
import {chapters,useStoryNavigation} from './story/useStoryNavigation';
import {useOceanAudio} from './audio/OceanAudio';
import './scene/oceanStyle';

export default function OceanStory(){
  const {setImmersion}=useOceanAudio();
  const story=useRef<HTMLDivElement>(null);
  const annotation=useRef<BuoyAnnotationHandle>(null);
  const updateBuoyAnchor=useCallback<BuoyAnchorHandler>((x,y,delta,outwardX,outwardY)=>annotation.current?.updateAnchor(x,y,delta,outwardX,outwardY),[]);
  const [sceneState,setSceneState]=useState<SceneState>('loading');
  const [progress,setProgress]=useState(0);
  const reportProgress=useCallback((value:number)=>setProgress(current=>Math.max(current,value)),[]);
  const [sensor,setSensor]=useState<SensorKind>('ec');
  const [presented,setPresented]=useState(false),[labelVisible,setLabelVisible]=useState(false);
  const loaded=sceneState!=='loading';
  const {shot,settledShot,onShotSettled,navigate,skip,returnHint,returnToStory}=useStoryNavigation(story,presented,sceneState==='static');
  useEffect(()=>{if(sceneState==='static')setImmersion(shot==='sensing'?1:0)},[sceneState,shot,setImmersion]);
  useEffect(()=>()=>setImmersion(0),[setImmersion]);
  useEffect(()=>{
    setPresented(false);
    if(!loaded)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){setPresented(true);return}
    const timer=window.setTimeout(()=>setPresented(true),900);
    return()=>window.clearTimeout(timer);
  },[loaded]);
  useEffect(()=>{
    setLabelVisible(false);
    if(!loaded)return;
    const timer=window.setTimeout(()=>setLabelVisible(true),1000);
    return()=>window.clearTimeout(timer);
  },[loaded]);
  const detail=shot==='detail',sensing=shot==='sensing',inside=shot==='inside',signal=shot==='signal';
  const goToShot=(event:React.MouseEvent<HTMLAnchorElement>,destination:SceneShot)=>{
    event.preventDefault();
    navigate(destination);
  };
  return <div ref={story} className="ocean-story">
    <button type="button" className="story-return-hint" data-visible={returnHint} aria-hidden={!returnHint} disabled={!returnHint} aria-label={t("Return to the ocean")} onClick={returnToStory}><span className="story-return-icon" aria-hidden="true"><FlexibleArrow direction="down"/></span><span>{t("Back to the ocean")}<small>{t("Scroll up or click to return")}</small></span></button>
    <span id="buoy-intro" className="buoy-scroll-target" aria-hidden="true"/>
    <span id="buoy-sensors" className="sensor-scroll-target" aria-hidden="true"/><span id="buoy-inside" className="inside-scroll-target" aria-hidden="true"/><span id="buoy-signal" className="signal-scroll-target" aria-hidden="true"/>
    <div className={'hero ocean-hero ocean-stage'+(loaded?' is-loaded':'')+(presented?' is-presented':'')+(detail&&settledShot==='detail'?' is-detail-ready':'')+(sensing&&settledShot==='sensing'?' is-sensing-ready':'')+(inside&&settledShot==='inside'?' is-inside-ready':'')+(signal&&settledShot==='signal'?' is-signal-ready':'')} data-scene-state={sceneState} data-shot={shot} data-sensor={sensor} data-camera-state={shot===settledShot?'settled':'moving'}>
      <Viewer hero onBuoyAnchor={updateBuoyAnchor} onImmersionChange={setImmersion} sensor={sensor} onSensorChange={setSensor} insideVisible={inside&&settledShot==='inside'} onStateChange={setSceneState} onProgress={reportProgress} shot={shot} onShotSettled={onShotSettled}/>
      <div className="ocean-loading-screen" aria-hidden={loaded}><LoadingIndicator ocean progress={progress}/></div>
      <div className="ocean-vignette" aria-hidden="true"/>
      <div className="underwater-rays" aria-hidden="true"/>
      <section className="ocean-introduction" aria-labelledby="ocean-title" aria-hidden={shot!=='surface'} inert={shot!=='surface'}>
        <div className="surface-project-copy"><Heading as="h1" id="ocean-title">{t('Buoys and real water measurements.')}</Heading><p>{t('AquaNode combines hands-on buoy building with environmental education for school students. We have collected data with checked sensors and sent buoys to partners for collaborative work.')}</p><ArrowLink to="/map">{t('Open the buoy map')}</ArrowLink><ArrowLink to="/technology">{t('How the buoy works')}</ArrowLink></div>
        <BuoyAnnotation ref={annotation} visible={labelVisible} active={shot==='surface'} staticScene={sceneState==='static'} onClick={event=>goToShot(event,'detail')}/>
        <span className="ocean-corner ocean-corner-left">{t("01 / THE SURFACE")}</span>
        <a className="ocean-scroll story-dive" href="#buoy-intro" onClick={event=>goToShot(event,'detail')} tabIndex={presented?0:-1} aria-label={t("Scroll to explore AquaNode")}><span>{t("SCROLL TO EXPLORE")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-right">AQUANODE</span>
      </section>
      <section className="buoy-introduction" aria-labelledby="buoy-intro-title" aria-hidden={!detail} inert={!detail}>
        <StoryPanel chapter="detail" className="buoy-copy" label={t("About the buoy")}>
          <SectionLabel icon="buoy">{t("02 / MEET AQUANODE")}</SectionLabel>
          <Heading as="h2" id="buoy-intro-title">{t('What is AquaNode')}</Heading>
          <div className="story-details"><p>{t('Electronics sit above the water; sensors sit below the surface.')}</p><p>{t('Students study the buoy, collect measurements and learn to explain changes in water.')}</p></div>
          <ArrowLink to="/map">{t('Open the buoy map')}</ArrowLink>
          <ArrowLink to="/technology">{t('How the buoy works')}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#buoy-sensors" onClick={event=>goToShot(event,'sensing')}><span>{t('Explore the parameters')}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("02 / THE BUOY")}</span>
      </section>
      <section className="sensor-introduction" aria-labelledby="sensor-story-title" aria-hidden={!sensing} inert={!sensing}>
        <SensorPanel sensor={sensor} onChange={setSensor} onExplore={()=>navigate('inside')}/>
        <a className="story-dive" href="#buoy-inside" onClick={event=>goToShot(event,'inside')}><span>{t('See the electronics')}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("03 / THE WATER")}</span>

      </section>
      <section className="inside-introduction" aria-labelledby="inside-story-title" aria-hidden={!inside} inert={!inside}>
        <StoryPanel chapter="inside" className="inside-copy" label={t("Inside the buoy")}>
          <SectionLabel icon="layers">{t("04 / INSIDE THE NODE")}</SectionLabel>
          <Heading as="h2" id="inside-story-title">{t('Controller, power and sensor connections')}</Heading>
          <dl className="inside-parts">
           <div><dt>01</dt><dd><b>{t('Controller')}</b><span>{t('Coordinates the measurement cycle.')}</span></dd></div>
           <div><dt>02</dt><dd><b>{t('Records')}</b><span>{t('Keeps readings available for comparison.')}</span></dd></div>
           <div><dt>03</dt><dd><b>{t('Power + ports')}</b><span>{t('Feeds the board and connects the probes.')}</span></dd></div>
          </dl>
          <p className="inside-note">{t('The 3D model shows the main parts of a buoy. The layout depends on the device revision.')}</p>
          <ArrowLink to="/technology">{t('Device versions')}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#buoy-signal" onClick={event=>goToShot(event,'signal')}><span>{t('View cooperation regions')}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("04 / THE NODE")}</span>
      </section>
      <section className="signal-introduction" aria-labelledby="signal-story-title" aria-hidden={!signal} inert={!signal}>
        <StoryPanel chapter="signal" className="signal-copy" label={t('Cooperation regions')}>
          <SectionLabel icon="network">{t("05 / BEYOND THE BUOY")}</SectionLabel>
          <Heading as="h2" id="signal-story-title">{t('Buoys with our partners')}</Heading>
          <p>{t('We have sent buoys to partners for collaborative work.')}</p>
          <p>{t('The map shows the regions associated with buoys sent for collaborative work. Select a region for its status and available sources.')}</p>
          <ArrowLink to="/map">{t('Open the buoy map')}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#progress" onClick={event=>{event.preventDefault();skip()}}><span>{t('Project results')}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("05 / THE SIGNAL")}</span>
        <span className="network-scene-note">{t('Map overview · not radio links')}</span>
      </section>
      <nav className="ocean-chapters" aria-label={t("Buoy story")} inert={!presented}>
        {chapters.map((chapter,i)=><a key={chapter} href={['#ocean-title','#buoy-intro','#buoy-sensors','#buoy-inside','#buoy-signal'][i]} onClick={event=>goToShot(event,chapter)} aria-label={[t("View the surface"),t("Meet the buoy"),t("Explore below the surface"),t("See inside the buoy"),t('View cooperation regions')][i]} data-label={[t("The surface"),t("Meet AquaNode"),t("Water probes"),t("Inside the node"),t('Cooperation regions')][i]} aria-current={shot===chapter?'step':undefined}><span>0{i+1}</span><i/></a>)}
        <OceanSkip onSkip={skip}/>
      </nav>
    </div>
  </div>;
}
