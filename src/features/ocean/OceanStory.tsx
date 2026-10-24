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
  const [sensor,setSensor]=useState<SensorKind>('ph');
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
        <span className="ocean-corner ocean-corner-right">{t("A SMALL NODE.")}<br/>{t("A WORLD TO UNDERSTAND.")}</span>
      </section>
      <section className="buoy-introduction" aria-labelledby="buoy-intro-title" aria-hidden={!detail} inert={!detail}>
        <StoryPanel chapter="detail" className="buoy-copy" label={t("About the buoy")}>
          <p className="kicker">{t("02 / MEET AQUANODE")}</p>
          <Heading as="h2" id="buoy-intro-title">{t("A small buoy.")} {t("A closer look at our water.")}</Heading>
          <p>{t("AquaNode is a water-monitoring prototype that brings regular observation and hands-on engineering together.")}</p>
          <dl className="buoy-reading-types"><div><dt>pH</dt><dd>{t("Water acidity")}</dd></div><div><dt>°C</dt><dd>{t("Water temperature")}</dd></div></dl>
          <p className="buoy-interval">{t("Measurements transmitted once an hour.")}<br/>{t("One working prototype. More possibilities ahead.")}</p>
          <div className="story-details">
            <article><span>{t("01 / STAY AT THE SURFACE")}</span><Heading as="h3">{t("A platform for observation.")}</Heading><p>{t("The floating body brings the two parts of the instrument together: electronics above the surface and probes in the water. In this conceptual model, the central mast connects them into one compact device.")}</p></article>
            <article><span>{t("02 / KEEP THE SYSTEM TOGETHER")}</span><Heading as="h3">{t("Every part has a purpose.")}</Heading><p>{t("The upper enclosure houses the measurement and transmission electronics. The antenna provides the communication link, while the submerged probes measure pH and temperature. Explore the following chapters to see each part more closely.")}</p></article>
            <article><span>{t("03 / LEARN BY BUILDING")}</span><Heading as="h3">{t("One working prototype.")}</Heading><p>{t("AquaNode combines regular water observation with hands-on engineering. The team reports one operating buoy; a separate R0.3 carrier-board design and assembly resources make the engineering work available to inspect.")}</p></article>
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
        <span className="sensor-model-note">{t("CONCEPTUAL PROBE VIEW")} <span>{t("pH + TEMPERATURE")}</span></span>
      </section>
      <section className="inside-introduction" aria-labelledby="inside-story-title" aria-hidden={!inside} inert={!inside}>
        <StoryPanel chapter="inside" className="inside-copy" label={t("Inside the buoy")}>
          <p className="kicker">{t("04 / INSIDE THE NODE")}</p>
          <Heading as="h2" id="inside-story-title">{t("A small system")} {t("with a clear job.")}</Heading>
          <p>{t("Inside the weatherproof enclosure, a compact board connects the controller, radio, power and sensor interfaces.")}</p>
          <dl className="inside-parts">
            <div><dt>01</dt><dd><b>{t("Controller")}</b><span>{t("Coordinates each measurement.")}</span></dd></div>
            <div><dt>02</dt><dd><b>{t("Radio")}</b><span>{t("Sends a small update on schedule.")}</span></dd></div>
            <div><dt>03</dt><dd><b>{t("Power + ports")}</b><span>{t("Feeds the board and connects the probes.")}</span></dd></div>
          </dl>
          <p className="inside-note">{t("Conceptual layout based on AquaNode R0.3 design work.")}</p>
          <div className="story-details">
            <article><span>{t("01 / THE CARRIER BOARD")}</span><Heading as="h3">{t("A place for every connection.")}</Heading><p>{t("The R0.3 design uses an 80 × 60 mm, two-layer carrier board. It brings the controller, measurement inputs and power connections together in a layout that can be inspected in the assembly drawing.")}</p></article>
            <article><span>{t("02 / THE MEASUREMENT PATH")}</span><Heading as="h3">{t("From input to a reading.")}</Heading><p>{t("The design specifies a XIAO ESP32S3 controller, ADS1115 conversion and a DS18B20 temperature input. The pH front end has its own power and analogue input connections. These are documented design choices for R0.3.")}</p></article>
            <article><span>{t("03 / FROM DRAWING TO DEVICE")}</span><Heading as="h3">{t("Designed, then validated.")}</Heading><p>{t("Module fit, calibration, power transitions and water sealing are physical checks that follow the digital design. R0.3 still needs assembly and testing; the cutaway illustrates the arrangement rather than an exact inventory of the working buoy.")}</p></article>
          </div>
          <ArrowLink to="/build">{t("Inspect the engineering")}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#buoy-signal" onClick={event=>goToShot(event,'signal')}><span>{t("FOLLOW THE SIGNAL")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("04 / THE NODE")}</span>
      </section>
      <section className="signal-introduction" aria-labelledby="signal-story-title" aria-hidden={!signal} inert={!signal}>
        <StoryPanel chapter="signal" className="signal-copy" label={t("How the buoy transmits measurements")}>
          <p className="kicker">{t("05 / BEYOND THE BUOY")}</p>
          <Heading as="h2" id="signal-story-title">{t("A small signal.")} {t("A closer connection.")}</Heading>
          <p>{t("One buoy observes the water today. A future network could connect observations from several locations, with each node sending a regular update.")}</p>
          <div className="signal-route" aria-label={t("Illustration: measurements travel from the buoy to a receiver")}>
            <div><span className="signal-node">≈</span><span>{t("OBSERVATION NODES")}</span></div>
            <div className="signal-path" aria-hidden="true"><i/><i/><i/></div>
            <div><span className="signal-receiver"><i/><i/><i/></span><span>{t("RECEIVER")}</span></div>
          </div>
          <div className="signal-facts"><div><strong>01<span> {t("h")}</span></strong><span>{t("BETWEEN UPDATES")}</span></div><div><strong>pH <span>+ </span>°C</strong><span>{t("TWO WATER PARAMETERS")}</span></div></div>
          <p className="signal-note">{t("Future network concept. One working prototype today; additional buoys and links are illustrated.")}</p>
          <div className="story-details">
            <article><span>{t("01 / OBSERVE")}</span><Heading as="h3">{t("Start with the water.")}</Heading><p>{t("The probes provide pH and temperature measurements. A useful record begins with calibrated sensors and a clear account of where and how each observation was made.")}</p></article>
            <article><span>{t("02 / TRANSMIT")}</span><Heading as="h3">{t("A regular update.")}</Heading><p>{t("The working buoy transmits measurements once an hour using the team’s own protocol. The moving pulses illustrate that link; they do not represent live traffic. Protocol details and measured range have not been published.")}</p></article>
            <article><span>{t("03 / UNDERSTAND")}</span><Heading as="h3">{t("Follow change over time.")}</Heading><p>{t("Repeated observations can help frame the next question about the water. A public dataset and a deployed network are future work. Today, AquaNode starts with one prototype and engineering that you can explore.")}</p></article>
          </div>
          <ArrowLink to="/technology">{t("Follow the technology")}</ArrowLink>
        </StoryPanel>
        <a className="story-dive" href="#progress" onClick={event=>{event.preventDefault();skip()}}><span>{t("THE STORY CONTINUES")}</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">{t("05 / THE SIGNAL")}</span>
        <span className="network-scene-note">{t("A FUTURE NETWORK")} <span>{t("CONCEPT VIEW · ONE PROTOTYPE TODAY")}</span></span>
      </section>
      <nav className="ocean-chapters" aria-label={t("Buoy story")} inert={!presented}>
        {chapters.map((chapter,i)=><a key={chapter} href={['#ocean-title','#buoy-intro','#buoy-sensors','#buoy-inside','#buoy-signal'][i]} onClick={event=>goToShot(event,chapter)} aria-label={[t("View the surface"),t("Meet the buoy"),t("Explore below the surface"),t("See inside the buoy"),t("Follow the signal")][i]} data-label={[t("The surface"),t("Meet AquaNode"),t("Water probes"),t("Inside the node"),t("Buoy network")][i]} aria-current={shot===chapter?'step':undefined}><span>0{i+1}</span><i/></a>)}
        <OceanSkip onSkip={skip}/>
      </nav>
    </div>
  </div>;
}
