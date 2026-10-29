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
        <Heading as="h1" id="ocean-title" className="sr-only">{t("AquaNode — a closer look at our water")}</Heading>
        <BuoyAnnotation ref={annotation} visible={labelVisible} active={shot==='surface'} staticScene={sceneState==='static'} onClick={event=>goToShot(event,'detail')}/>
        <span className="ocean-corner ocean-corner-left">{t("01 / THE SURFACE")}</span>
        <a className="ocean-scroll story-dive" href="#buoy-intro" onClick={event=>goToShot(event,'detail')} tabIndex={presented?0:-1} aria-label={t("Scroll to explore AquaNode")}><span>{t("SCROLL TO EXPLORE")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-right">{t("FRESHWATER DESIGN.")}<br/>{t("VALIDATION PENDING.")}</span>
      </section>
      <section className="buoy-introduction" aria-labelledby="buoy-intro-title" aria-hidden={!detail} inert={!detail}>
        <StoryPanel chapter="detail" className="buoy-copy" label={t("About the buoy")}>
          <SectionLabel icon="buoy">{t("02 / MEET AQUANODE")}</SectionLabel>
          <Heading as="h2" id="buoy-intro-title">{t("A small buoy.")} {t("A closer look at our water.")}</Heading>
          <p>{t("AquaNode is developing an educational freshwater buoy. The current engineering revision prepares an EC estimate and temperature sensing for bench evaluation.")}</p>
          <dl className="buoy-reading-types"><div><dt>EC</dt><dd>{t("Experimental EC")}</dd></div><div><dt>°C</dt><dd>{t("Water temperature")}</dd></div></dl>
          <p className="buoy-interval">{t("Bench acquisition source: USB logging.")}<br/>{t("R0.3-EC-revB · Hardware validation pending.")}</p>
          <div className="story-details">
            <article><SectionLabel as="span" icon="waves">{t("01 / STAY AT THE SURFACE")}</SectionLabel><Heading as="h3">{t("A platform for observation.")}</Heading><p>{t("The floating body brings the two parts of the instrument together: electronics above the surface and probes in the water. In this conceptual model, the central mast connects them into one compact device.")}</p></article>
            <article><SectionLabel as="span" icon="shield">{t("02 / KEEP THE SYSTEM TOGETHER")}</SectionLabel><Heading as="h3">{t("Every part has a purpose.")}</Heading><p>{t("The model illustrates an enclosure, antenna and probes. revB studies SEN0244 and DS18B20 on a USB bench; radio operation, enclosure performance and water exposure still need validation.")}</p></article>
            <article><SectionLabel as="span" icon="learning">{t("03 / LEARN BY BUILDING")}</SectionLabel><Heading as="h3">{t("An educational design.")}</Heading><p>{t("The learning aim is for students to understand the electronics they assemble and learn to check readings. A classroom activity and field pilot will need validated hardware and documented guidance.")}</p></article>
          </div>
          <ArrowLink to="/technology">{t("Explore the technology")}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#buoy-sensors" onClick={event=>goToShot(event,'sensing')}><span>{t("THERE’S MORE BELOW")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("02 / THE BUOY")}</span>
      </section>
      <section className="sensor-introduction" aria-labelledby="sensor-story-title" aria-hidden={!sensing} inert={!sensing}>
        <SensorPanel sensor={sensor} onChange={setSensor} onExplore={()=>navigate('inside')}/>
        <a className="story-dive" href="#buoy-inside" onClick={event=>goToShot(event,'inside')}><span>{t("SCROLL TO SEE INSIDE")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("03 / THE WATER")}</span>
        <span className="sensor-model-note">{t("CONCEPTUAL PROBE VIEW")} <span>{t("EXPERIMENTAL EC + TEMPERATURE")}</span></span>
      </section>
      <section className="inside-introduction" aria-labelledby="inside-story-title" aria-hidden={!inside} inert={!inside}>
        <StoryPanel chapter="inside" className="inside-copy" label={t("Inside the buoy")}>
          <SectionLabel icon="layers">{t("04 / INSIDE THE NODE")}</SectionLabel>
          <Heading as="h2" id="inside-story-title">{t("A small system")} {t("with a clear job.")}</Heading>
          <p>{t("The model illustrates a compact enclosure and its interfaces. Enclosure performance and the physical arrangement still require validation.")}</p>
          <dl className="inside-parts">
            <div><dt>01</dt><dd><b>{t("Controller")}</b><span>{t("Coordinates each measurement.")}</span></dd></div>
            <div><dt>02</dt><dd><b>{t("Bench interface")}</b><span>{t("Prepares USB acquisition.")}</span></dd></div>
            <div><dt>03</dt><dd><b>{t("Power + ports")}</b><span>{t("Feeds the board and connects the probes.")}</span></dd></div>
          </dl>
          <p className="inside-note">{t("Conceptual layout; revB hardware validation is pending.")}</p>
          <div className="story-details">
            <article><SectionLabel as="span" icon="circuit">{t("01 / THE CARRIER BOARD")}</SectionLabel><Heading as="h3">{t("A place for every connection.")}</Heading><p>{t("The revB package prepares editable design files and a component list. Its web architecture diagram explains the planned functions, not a fabricated or validated board.")}</p></article>
            <article><SectionLabel as="span" icon="probe">{t("02 / THE MEASUREMENT PATH")}</SectionLabel><Heading as="h3">{t("From input to a reading.")}</Heading><p>{t("The current bench design pairs SEN0244 for an experimental EC estimate with DS18B20 for temperature. SEN0244 is a TDS module under evaluation for freshwater, not a salinity instrument.")}</p></article>
            <article><SectionLabel as="span" icon="check">{t("03 / FROM DRAWING TO DEVICE")}</SectionLabel><Heading as="h3">{t("Designed, then validated.")}</Heading><p>{t("The documented checks cover synthetic software inputs and cross-file agreement. ESP32 compilation, native ERC/DRC, power, calibration and physical validation are still ahead.")}</p></article>
          </div>
          <ArrowLink to="/build">{t("Inspect the engineering")}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#buoy-signal" onClick={event=>goToShot(event,'signal')}><span>{t("FOLLOW THE SIGNAL")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("04 / THE NODE")}</span>
      </section>
      <section className="signal-introduction" aria-labelledby="signal-story-title" aria-hidden={!signal} inert={!signal}>
        <StoryPanel chapter="signal" className="signal-copy" label={t("How the buoy transmits measurements")}>
          <SectionLabel icon="network">{t("05 / BEYOND THE BUOY")}</SectionLabel>
          <Heading as="h2" id="signal-story-title">{t("A small signal.")} {t("A closer connection.")}</Heading>
          <p>{t("One classroom could become one monitoring point. Many classrooms could connect local observations into a shared picture of the water.")}</p>
            <dl className="signal-mobile-summary"><div><dt>{t('IN THE WATER')}</dt><dd>EC · °C</dd></div><div><dt>{t('BENCH OUTPUT')}</dt><dd>USB</dd></div></dl>
          <div className="signal-route" aria-label={t("Illustration: measurements travel from the buoy to a receiver")}>
            <div><span className="signal-node">≈</span><span>{t("OBSERVATION NODES")}</span></div>
            <div className="signal-path" aria-hidden="true"><i/><i/><i/></div>
            <div><span className="signal-receiver"><i/><i/><i/></span><span>{t("RECEIVER")}</span></div>
          </div>
          <div className="signal-facts"><div><strong>USB</strong><span>{t("BENCH SOURCE")}</span></div><div><strong>EC <span>+ </span>°C</strong><span>{t("TWO WATER PARAMETERS")}</span></div></div>
          <p className="signal-note">{t("Future school-network illustration. revB does not demonstrate deployed buoys, radio operation or a working mesh.")}</p>
          <div className="story-details">
            <article><SectionLabel as="span" icon="water">{t("01 / OBSERVE")}</SectionLabel><Heading as="h3">{t("Start with the water.")}</Heading><p>{t("The design prepares an experimental EC estimate and temperature input for freshwater. A useful result needs independent references, calibration context and a recorded test setup.")}</p></article>
            <article><SectionLabel as="span" icon="signal">{t("02 / TRANSMIT")}</SectionLabel><Heading as="h3">{t("A regular update.")}</Heading><p>{t("The EC bench source prepares USB logging. ESP32 compilation and hardware execution are still pending. The animated links illustrate a future direction; radio and mesh operation are not verified.")}</p></article>
            <article><SectionLabel as="span" icon="search">{t("03 / UNDERSTAND")}</SectionLabel><Heading as="h3">{t("Follow change over time.")}</Heading><p>{t("Students could compare observations, investigate unusual readings and discuss findings with their community. Where appropriate, a documented anomaly could be shared with an environmental organisation.")}</p></article>
          </div>
          <ArrowLink to="/technology">{t("Follow the technology")}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#progress" onClick={event=>{event.preventDefault();skip()}}><span>{t("THE STORY CONTINUES")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("05 / THE SIGNAL")}</span>
        <span className="network-scene-note">{t("A FUTURE NETWORK")} <span>{t("CONCEPT VIEW · NOT A VERIFIED NETWORK")}</span></span>
      </section>
      <nav className="ocean-chapters" aria-label={t("Buoy story")} inert={!presented}>
        {chapters.map((chapter,i)=><a key={chapter} href={['#ocean-title','#buoy-intro','#buoy-sensors','#buoy-inside','#buoy-signal'][i]} onClick={event=>goToShot(event,chapter)} aria-label={[t("View the surface"),t("Meet the buoy"),t("Explore below the surface"),t("See inside the buoy"),t("Follow the signal")][i]} data-label={[t("The surface"),t("Meet AquaNode"),t("Water probes"),t("Inside the node"),t("Buoy network")][i]} aria-current={shot===chapter?'step':undefined}><span>0{i+1}</span><i/></a>)}
        <OceanSkip onSkip={skip}/>
      </nav>
    </div>
  </div>;
}
