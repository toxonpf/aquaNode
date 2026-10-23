import Heading from './Heading';
import React,{Suspense,lazy,useCallback,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link,NavLink} from 'react-router-dom';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {nav,awardUrl,updates,parts} from './content';
import './styles.css';
import './ocean.css';
import './sensors.css';
import BuoyDrawing from './BuoyDrawing';
import BuoyAnnotation,{type BuoyAnnotationHandle} from './BuoyAnnotation';
import type {BuoyAnchorHandler} from './buoyAnchors';
import SensorPanel from './SensorPanel';
import type {SceneShot,SensorKind} from './sceneTypes';
import {chapters,useStoryNavigation} from './useStoryNavigation';
import {PageCurtain,usePageTransition} from './PageTransition';
import './signal.css';
import StoryPanel from './StoryPanel';
import './story-reading.css';
import FlexibleArrow from './FlexibleArrow';
import {useHeaderMode} from './useHeaderMode';
import './header.css';
import './chapters.css';
import NetworkDrawing from './NetworkDrawing';
import TeamRoster from './TeamRoster';
import {MeetNode,FutureNetwork} from './HomeFeatures';
import {OceanAudioProvider,AudioToggle,useOceanAudio} from './OceanAudio';
import './oceanStyle';
import BrandLogo from './BrandLogo';
import {scrollToPageStart} from './pageScroll';
import {useTextReveal} from './useTextReveal';
import './text-reveal.css';
import AboutPage from './AboutPage';
import TechnologyPage from './TechnologyPage';
import {ExternalLink} from './ActionLinks';
import BuildPage from './BuildPage';
import './readability.css';
gsap.registerPlugin(ScrollTrigger);
let sceneModule:Promise<typeof import('./Scene')>|undefined;
const loadScene=()=>sceneModule??=import('./Scene');
const Scene=lazy(loadScene);
type SceneState='loading'|'ready'|'static';
class SceneBoundary extends React.Component<{children:React.ReactNode;onUnavailable:()=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){this.props.onUnavailable()}
  render(){return this.state.failed?null:this.props.children}
}
function LoadingIndicator({ocean=false,progress}:{ocean?:boolean;progress?:number}){
  return <div className="loading-indicator" role="status">
    <div className="loading-caption"><span>{ocean?'LOADING THE OCEAN':'LOADING THE MODEL'}</span>{progress!==undefined&&<span className="loading-percentage">{progress}%</span>}</div>
    <div className={'loading-bar'+(progress===undefined?' is-indeterminate':'')} role="progressbar" aria-label={ocean?'Loading the ocean':'Loading the model'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={progress!==undefined?{transform:`scaleX(${progress/100})`}:undefined}/></div>
  </div>;
}
function Viewer({hero=false,onStateChange,onProgress,shot='surface',onShotSettled,sensor='ph',onSensorChange,onBuoyAnchor,onImmersionChange,insideVisible=false,showcase=false,activePart,onPartChange}:{hero?:boolean;onStateChange?:(state:SceneState)=>void;onProgress?:(progress:number)=>void;shot?:SceneShot;onShotSettled?:(shot:SceneShot)=>void;sensor?:SensorKind;onSensorChange?:(sensor:SensorKind)=>void;onBuoyAnchor?:BuoyAnchorHandler;onImmersionChange?:(value:number)=>void;insideVisible?:boolean;showcase?:boolean;activePart?:number;onPartChange?:(part:number)=>void}){
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
    <div className="scene" aria-label="Conceptual buoy model" aria-busy={state==='loading'}>
      {mode==='static'?(hero&&shot==='signal'?<NetworkDrawing/>:<BuoyDrawing/>):enabled&&visible?<div className="scene-live" data-ready={ready} aria-hidden={!ready}><SceneBoundary onUnavailable={unavailable}><Suspense fallback={null}><Scene hero={hero} onBuoyAnchor={onBuoyAnchor} onImmersionChange={onImmersionChange} shot={shot} showInside={insideVisible} sensor={sensor} onSensorChange={onSensorChange} onShotSettled={onShotSettled} onProgress={onProgress} active={active} angle={angle} expanded={expanded} onReady={()=>{setReady(true);onProgress?.(100)}} onUnavailable={unavailable}/></Suspense></SceneBoundary></div>:null}
      {!hero&&state==='loading'&&<div className="model-loading"><LoadingIndicator/></div>}
    </div>
    <div className="scene-caption"><span className="tiny-dot"/> CONCEPT MODEL <span>Illustrative design</span></div>
    {!hero&&<><div className="viewer-controls"><button onClick={()=>setAngle(v=>v-.4)} disabled={!enabled} aria-label="Rotate buoy left">↶</button><button onClick={()=>setAngle(v=>v+.4)} disabled={!enabled} aria-label="Rotate buoy right">↷</button><button aria-pressed={expanded} onClick={()=>setExpanded(!expanded)} disabled={!enabled}>{expanded?'Close structure':'Separate parts'}</button><button onClick={()=>{setAngle(0);setExpanded(false);setActive(0)}} disabled={!enabled}>Reset</button></div>{!showcase&&<><div className="part-tabs" aria-label="Buoy parts">{parts.map((p,i)=><button key={p.name} onClick={()=>setActive(i)} aria-pressed={i===active}>{String(i+1).padStart(2,'0')} {p.name}</button>)}</div><p className="part-description" aria-live="polite">{parts[active].text}</p></>}<p className="helper">{enabled?'Drag to orbit · Pinch to zoom · Use buttons for keyboard control':showcase?'Select a part to explore the buoy.':'Static view for reduced motion, limited hardware or unavailable WebGL. All part descriptions remain available.'}</p></>}
  </div>;
}
function Kicker({children}:{children:React.ReactNode}){return <p className="kicker">{children}</p>}
function ArrowLink({to,children}:{to:string;children:React.ReactNode}){return <Link className="arrow-link" to={to}>{children}<span className="arrow-link-icon"><FlexibleArrow direction="up-right"/></span></Link>}
function Flow(){return <div className="flow">{[['01','Sense','A calibrated probe meets the water at a known place and time.'],['02','Measure','pH and temperature turn that contact into a comparable reading.'],['03','Transmit','One compact update leaves the buoy every hour using the team’s own protocol.'],['04','Learn','A sequence of observations gives the next question more context.']].map(([n,t,d])=><div key={n}><span>{n} —</span><Heading as="h3">{t}</Heading><p>{d}</p></div>)}</div>}
function Status(){return <div className="status-grid"><article className="status-current"><div className="status-top"><span className="badge"><span className="tiny-dot"/> Working now</span><span className="status-number">01</span></div><Heading as="h3">The first node is working.</Heading><p>One prototype measures pH and temperature, transmitting data every hour. Current status reported by the team.</p><span className="status-foot">PROTOTYPE / MEASURE / TRANSMIT</span></article><article><div className="status-top"><span className="badge muted">In development</span><span className="status-number">02</span></div><Heading as="h3">Refine. Assemble. Test.</Heading><p>The R0.3 carrier-board design is reviewed. Its physical assembly and testing are the next engineering steps.</p><span className="status-foot">DESIGN / ASSEMBLY / VALIDATION</span></article><article><div className="status-top"><span className="badge muted">Looking ahead</span><span className="status-number">03</span></div><Heading as="h3">More points of view.</Heading><p>Additional parameters and observation points, shaped by real needs. A wider network is a future direction.</p><span className="status-foot">LEARN / EXTEND / CONNECT</span></article></div>}
function OceanStory(){
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
    <button type="button" className="story-return-hint" data-visible={returnHint} aria-hidden={!returnHint} disabled={!returnHint} aria-label="Return to the ocean" onClick={returnToStory}><span className="story-return-icon" aria-hidden="true"><FlexibleArrow direction="down"/></span><span>Back to the ocean<small>Scroll up or click to return</small></span></button>
    <span id="buoy-intro" className="buoy-scroll-target" aria-hidden="true"/>
    <span id="buoy-sensors" className="sensor-scroll-target" aria-hidden="true"/><span id="buoy-inside" className="inside-scroll-target" aria-hidden="true"/><span id="buoy-signal" className="signal-scroll-target" aria-hidden="true"/>
    <div className={'hero ocean-hero ocean-stage'+(loaded?' is-loaded':'')+(presented?' is-presented':'')+(detail&&settledShot==='detail'?' is-detail-ready':'')+(sensing&&settledShot==='sensing'?' is-sensing-ready':'')+(inside&&settledShot==='inside'?' is-inside-ready':'')+(signal&&settledShot==='signal'?' is-signal-ready':'')} data-scene-state={sceneState} data-shot={shot} data-sensor={sensor} data-camera-state={shot===settledShot?'settled':'moving'}>
      <Viewer hero onBuoyAnchor={updateBuoyAnchor} onImmersionChange={setImmersion} sensor={sensor} onSensorChange={setSensor} insideVisible={inside&&settledShot==='inside'} onStateChange={setSceneState} onProgress={reportProgress} shot={shot} onShotSettled={onShotSettled}/>
      <div className="ocean-loading-screen" aria-hidden={loaded}><LoadingIndicator ocean progress={progress}/></div>
      <div className="ocean-vignette" aria-hidden="true"/>
      <div className="underwater-rays" aria-hidden="true"/>
      <section className="ocean-introduction" aria-labelledby="ocean-title" aria-hidden={shot!=='surface'} inert={shot!=='surface'}>
        <Heading as="h1" id="ocean-title" className="sr-only">AquaNode — a closer look at our water</Heading>
        <BuoyAnnotation ref={annotation} visible={labelVisible} active={shot==='surface'} staticScene={sceneState==='static'} onClick={event=>goToShot(event,'detail')}/>
        <span className="ocean-corner ocean-corner-left">01 / THE SURFACE</span>
        <a className="ocean-scroll" href="#buoy-intro" onClick={event=>goToShot(event,'detail')} tabIndex={presented?0:-1} aria-label="Scroll to explore AquaNode"><span>SCROLL TO EXPLORE</span><span className="scroll-track" aria-hidden="true"><FlexibleArrow direction="down" active showHead={false} trail/></span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2v14m-5-5 5 5 5-5"/></svg></a>
        <span className="ocean-corner ocean-corner-right">A SMALL NODE.<br/>A WORLD TO UNDERSTAND.</span>
      </section>
      <section className="buoy-introduction" aria-labelledby="buoy-intro-title" aria-hidden={!detail} inert={!detail}>
        <StoryPanel chapter="detail" className="buoy-copy" label="About the buoy">
          <Kicker>02 / MEET AQUANODE</Kicker>
          <Heading as="h2" id="buoy-intro-title">A small buoy.<br/>A closer look at our water.</Heading>
          <p>AquaNode is a water-monitoring prototype that brings regular observation and hands-on engineering together.</p>
          <dl className="buoy-reading-types"><div><dt>pH</dt><dd>Water acidity</dd></div><div><dt>°C</dt><dd>Water temperature</dd></div></dl>
          <p className="buoy-interval">Measurements transmitted once an hour.<br/>One working prototype. More possibilities ahead.</p>
          <div className="story-details">
            <article><span>01 / STAY AT THE SURFACE</span><Heading as="h3">A platform for observation.</Heading><p>The floating body brings the two parts of the instrument together: electronics above the surface and probes in the water. In this conceptual model, the central mast connects them into one compact device.</p></article>
            <article><span>02 / KEEP THE SYSTEM TOGETHER</span><Heading as="h3">Every part has a purpose.</Heading><p>The upper enclosure houses the measurement and transmission electronics. The antenna provides the communication link, while the submerged probes measure pH and temperature. Explore the following chapters to see each part more closely.</p></article>
            <article><span>03 / LEARN BY BUILDING</span><Heading as="h3">One working prototype.</Heading><p>AquaNode combines regular water observation with hands-on engineering. The team reports one operating buoy; a separate R0.3 carrier-board design and assembly resources make the engineering work available to inspect.</p></article>
          </div>
          <ArrowLink to="/technology">Explore the technology</ArrowLink>
        </StoryPanel>
        <a className="back-to-surface" href="#ocean-title" onClick={event=>goToShot(event,'surface')}>↑ Back to the surface</a>
        <a className="story-dive" href="#buoy-sensors" onClick={event=>goToShot(event,'sensing')}><span>THERE’S MORE BELOW</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">02 / THE BUOY</span>
      </section>
      <section className="sensor-introduction" aria-labelledby="sensor-story-title" aria-hidden={!sensing} inert={!sensing}>
        <SensorPanel sensor={sensor} onChange={setSensor} onExplore={()=>navigate('inside')}/>
        <a className="story-dive" href="#buoy-inside" onClick={event=>goToShot(event,'inside')}><span>SCROLL TO SEE INSIDE</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">03 / THE WATER</span>
        <span className="sensor-model-note">CONCEPTUAL PROBE VIEW <span>pH + TEMPERATURE</span></span>
      </section>
      <section className="inside-introduction" aria-labelledby="inside-story-title" aria-hidden={!inside} inert={!inside}>
        <StoryPanel chapter="inside" className="inside-copy" label="Inside the buoy">
          <p className="kicker">04 / INSIDE THE NODE</p>
          <Heading as="h2" id="inside-story-title">A small system<br/>with a clear job.</Heading>
          <p>Inside the weatherproof enclosure, a compact board connects the controller, radio, power and sensor interfaces.</p>
          <dl className="inside-parts">
            <div><dt>01</dt><dd><b>Controller</b><span>Coordinates each measurement.</span></dd></div>
            <div><dt>02</dt><dd><b>Radio</b><span>Sends a small update on schedule.</span></dd></div>
            <div><dt>03</dt><dd><b>Power + ports</b><span>Feeds the board and connects the probes.</span></dd></div>
          </dl>
          <p className="inside-note">Conceptual layout based on AquaNode R0.3 design work.</p>
          <div className="story-details">
            <article><span>01 / THE CARRIER BOARD</span><Heading as="h3">A place for every connection.</Heading><p>The R0.3 design uses an 80 × 60 mm, two-layer carrier board. It brings the controller, measurement inputs and power connections together in a layout that can be inspected in the assembly drawing.</p></article>
            <article><span>02 / THE MEASUREMENT PATH</span><Heading as="h3">From input to a reading.</Heading><p>The design specifies a XIAO ESP32S3 controller, ADS1115 conversion and a DS18B20 temperature input. The pH front end has its own power and analogue input connections. These are documented design choices for R0.3.</p></article>
            <article><span>03 / FROM DRAWING TO DEVICE</span><Heading as="h3">Designed, then validated.</Heading><p>Module fit, calibration, power transitions and water sealing are physical checks that follow the digital design. R0.3 still needs assembly and testing; the cutaway illustrates the arrangement rather than an exact inventory of the working buoy.</p></article>
          </div>
          <ArrowLink to="/build">Inspect the engineering</ArrowLink>
        </StoryPanel>
        <a className="back-to-sensors" href="#buoy-sensors" onClick={event=>goToShot(event,'sensing')}>↑ Back to the probes</a>
        <a className="story-dive" href="#buoy-signal" onClick={event=>goToShot(event,'signal')}><span>FOLLOW THE SIGNAL</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">04 / THE NODE</span>
      </section>
      <section className="signal-introduction" aria-labelledby="signal-story-title" aria-hidden={!signal} inert={!signal}>
        <StoryPanel chapter="signal" className="signal-copy" label="How the buoy transmits measurements">
          <Kicker>05 / BEYOND THE BUOY</Kicker>
          <Heading as="h2" id="signal-story-title">A small signal.<br/>A closer connection.</Heading>
          <p>One buoy observes the water today. A future network could connect observations from several locations, with each node sending a regular update.</p>
          <div className="signal-route" aria-label="Illustration: measurements travel from the buoy to a receiver">
            <div><span className="signal-node">≈</span><span>OBSERVATION NODES</span></div>
            <div className="signal-path" aria-hidden="true"><i/><i/><i/></div>
            <div><span className="signal-receiver"><i/><i/><i/></span><span>RECEIVER</span></div>
          </div>
          <div className="signal-facts"><div><strong>01<span> h</span></strong><span>BETWEEN UPDATES</span></div><div><strong>pH <span>+ </span>°C</strong><span>TWO WATER PARAMETERS</span></div></div>
          <p className="signal-note">Future network concept. One working prototype today; additional buoys and links are illustrated.</p>
          <div className="story-details">
            <article><span>01 / OBSERVE</span><Heading as="h3">Start with the water.</Heading><p>The probes provide pH and temperature measurements. A useful record begins with calibrated sensors and a clear account of where and how each observation was made.</p></article>
            <article><span>02 / TRANSMIT</span><Heading as="h3">A regular update.</Heading><p>The working buoy transmits measurements once an hour using the team’s own protocol. The moving pulses illustrate that link; they do not represent live traffic. Protocol details and measured range have not been published.</p></article>
            <article><span>03 / UNDERSTAND</span><Heading as="h3">Follow change over time.</Heading><p>Repeated observations can help frame the next question about the water. A public dataset and a deployed network are future work. Today, AquaNode starts with one prototype and engineering that you can explore.</p></article>
          </div>
          <ArrowLink to="/technology">Follow the technology</ArrowLink>
        </StoryPanel>
        <a className="signal-back" href="#buoy-inside" onClick={event=>goToShot(event,'inside')}>↑ Back inside the node</a>
        <a className="story-dive" href="#progress" onClick={event=>{event.preventDefault();skip()}}><span>THE STORY CONTINUES</span><FlexibleArrow direction="down" active/></a>
        <span className="ocean-corner ocean-corner-left">05 / THE SIGNAL</span>
        <span className="network-scene-note">A FUTURE NETWORK <span>CONCEPT VIEW · ONE PROTOTYPE TODAY</span></span>
      </section>
      <nav className="ocean-chapters" aria-label="Buoy story" inert={!presented}>
        {chapters.map((chapter,i)=><a key={chapter} href={['#ocean-title','#buoy-intro','#buoy-sensors','#buoy-inside','#buoy-signal'][i]} onClick={event=>goToShot(event,chapter)} aria-label={['View the surface','Meet the buoy','Explore below the surface','See inside the buoy','Follow the signal'][i]} data-label={['The surface','Meet AquaNode','Water probes','Inside the node','Buoy network'][i]} aria-current={shot===chapter?'step':undefined}><span>0{i+1}</span><i/></a>)}
        <a className="ocean-chapters-skip" href="#progress" onClick={event=>{event.preventDefault();skip()}} aria-label="Skip buoy story"><span className="ocean-chapters-skip-label">SKIP</span><svg className="ocean-chapters-skip-icon" viewBox="0 0 64 48" fill="none" aria-hidden="true" focusable="false"><path className="ocean-chapters-skip-line" d="M6 14C18 8 10 32 28 28C46 24 48 18 48 42"/><path className="ocean-chapters-skip-line ocean-chapters-skip-current ocean-chapters-skip-trail" pathLength="100" d="M6 14C18 8 10 32 28 28C46 24 48 18 48 42"/><path className="ocean-chapters-skip-line ocean-chapters-skip-current" pathLength="100" d="M6 14C18 8 10 32 28 28C46 24 48 18 48 42"/><path className="ocean-chapters-skip-head" d="M44 37L48 42L52 37"/></svg></a>
      </nav>
    </div>
  </div>;
}
function Home(){return <>
  <OceanStory/>
  <div className="award"><span className="award-mark" aria-hidden="true">✳</span><p>Youth Innovation Challenge 2026 <b>Winner</b></p><ExternalLink href={awardUrl} inline>A small team. A recognised idea.</ExternalLink></div>
  <section id="progress" className="section progress-section"><div className="section-heading"><div><Kicker>01 / THE PROJECT TODAY</Kicker><Heading as="h2">A working prototype.<br/>An open path forward.</Heading></div><div className="heading-aside"><p>Follow the steps from a first device to a wider understanding of water.</p><ArrowLink to="/journal">Follow our development</ArrowLink></div></div><Status/></section>
  <section id="why" className="section reason-section"><div className="reason-visual" aria-hidden="true"><div className="water-line water-line-1"/><div className="water-line water-line-2"/><div className="water-line water-line-3"/><span className="reason-plus">+</span><span className="reason-word">Look closer.</span><span className="reason-caption">A CHANGE BEGINS WITH A QUESTION.</span></div><div><Kicker>02 / WHY WATER?</Kicker><Heading as="h2">We can only care for<br/>what we understand.</Heading><p className="lead">Water changes every day. Understanding it starts with paying attention.</p><p>AquaNode brings regular measurement and hands-on learning together. From a sensor in the water to a reading worth investigating, we make the process of observation tangible.</p><ArrowLink to="/about">The idea behind AquaNode</ArrowLink></div></section>
  <MeetNode renderViewer={(active,onChange)=><Viewer showcase activePart={active} onPartChange={onChange}/>}/>
  <section className="section cycle-section"><div className="section-heading"><div><Kicker>04 / THE OBSERVATION CYCLE</Kicker><Heading as="h2">From water to understanding.</Heading></div><div className="cycle-aside"><span className="cycle-mark" aria-hidden="true">↻</span><p>Useful observations connect a reading with its place, time and the question that led to it.</p></div></div><Flow/><div className="cycle-footer"><p className="note">Public measurement data is not yet available. The site presents our development progress.</p><p>Start small: conditions, location and time matter as much as the number on the screen.</p></div></section>
  <FutureNetwork/>
  <section className="section evidence-section"><div className="section-heading"><div><Kicker>06 / OPEN ENGINEERING</Kicker><Heading as="h2">The work behind the water.</Heading></div><ArrowLink to="/build">Build & resources</ArrowLink></div><div className="evidence"><figure><span className="figure-label">ENGINEERING ARCHIVE / R0.3</span><img src="/assets/PCB_F.png" alt="R0.3 PCB front copper and silkscreen drawing" loading="lazy"/><figcaption>Original PCB drawing · R0.3 · Awaiting physical validation</figcaption></figure><div><span className="badge muted">On the workbench</span><Heading as="h3">Made to be explored.<br/>Documented as we go.</Heading><p>Inspect the board layout, assembly drawing and bill of materials. Follow the decisions and questions that take us from a design to its next test.</p><ArrowLink to="/build">Open the engineering resources</ArrowLink><ArrowLink to="/journal">Read the project journal</ArrowLink></div></div></section>
  <section className="team-invitation"><Kicker>CURIOUS MINDS. A SHARED DIRECTION.</Kicker><Heading as="h2">It starts with people.</Heading><ArrowLink to="/team">Meet the AquaNode team</ArrowLink></section>
</>}
function PageIntro({label,title,text}:{label:string;title:string;text:string}){return <header className="page-intro"><Kicker>{label}</Kicker><Heading as="h1">{title}</Heading><p>{text}</p></header>}
function About(){return <AboutPage/>}
function Technology(){return <TechnologyPage renderViewer={()=><Viewer/>}/>}
function Build(){return <BuildPage/>}
function Journal(){return <><PageIntro label="PROJECT JOURNAL" title="The work, as it stands." text="Confirmed milestones, engineering evidence and open questions. Dates are shown only where the source provides them."/><section className="section journal">{updates.map(u=><article key={u.title}><div><Kicker>{u.date}</Kicker><span className="badge muted">{u.status}</span></div><div><Heading as="h2">{u.title}</Heading><p>{u.body}</p></div></article>)}</section></>}
function Team(){return <TeamRoster/>}
function headerReturn(event:React.MouseEvent<HTMLElement>,pathname:string,closeMenu:()=>void){
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
  if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
  const destination=new URL(anchor.href);
  if(destination.origin!==location.origin||destination.pathname!==pathname||location.pathname!==pathname||destination.search!==location.search)return;
  event.preventDefault();closeMenu();scrollToPageStart();
}
function App(){const {displayed,curtain}=usePageTransition(),{pathname}=displayed,[menu,setMenu]=useState(false),solidHeader=useHeaderMode(pathname);useTextReveal(pathname);useEffect(()=>{setMenu(false);window.scrollTo({top:0,behavior:'instant'});const title=nav.find(([p])=>p===pathname)?.[1]||'Page not found';document.title=`${title} — AquaNode`;const description=pathname==='/'?'One working buoy. pH and temperature. Explore AquaNode and its open engineering resources.':`${title}: AquaNode water observation, current progress and engineering materials.`;document.querySelector('meta[name="description"]')?.setAttribute('content',description);document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);},[pathname]);return <><a className="skip-link" href="#main">Skip to content</a><header onClickCapture={event=>headerReturn(event,pathname,()=>setMenu(false))} className={'site-header'+(pathname==='/'?' ocean-header':'')+(solidHeader?' is-solid':'')}><Link className="logo" to="/" aria-label="AquaNode home"><BrandLogo/></Link><button className="menu-button" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-controls="navigation">{menu?'Close':'Menu'} {menu?'−':'+'}</button><nav id="navigation" className={menu?'open':''} aria-label="Main navigation">{nav.map(([p,l])=><NavLink key={p} to={p} end>{l}</NavLink>)}</nav><Link className="header-cta" to="/journal">Project progress <FlexibleArrow direction="up-right"/></Link></header><main id="main" className={pathname!=='/'?'has-compact-header':undefined} tabIndex={-1}><Routes location={displayed}><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/technology" element={<Technology/>}/><Route path="/build" element={<Build/>}/><Route path="/journal" element={<Journal/>}/><Route path="/team" element={<Team/>}/><Route path="*" element={<section className="section"><Heading as="h1">This page is uncharted.</Heading><ArrowLink to="/">Return to the overview</ArrowLink></section>}/></Routes></main><footer><Link className="footer-logo" to="/">AquaNode</Link><div className="footer-row"><p>Observe with curiosity.<br/>Build with care.</p><Link className="footer-resource-link" to="/build">Explore the resources <FlexibleArrow direction="up-right"/></Link><span>KAZAKHSTAN · 2026</span></div><div className="footer-legal"><span>AquaNode · One prototype. An open-ended possibility.</span><span>Ocean audio: <ExternalLink href="https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg" inline>Luftrum</ExternalLink> · <ExternalLink href="https://creativecommons.org/licenses/by/3.0/" inline>CC BY 3.0</ExternalLink> · Underwater mix adapted</span></div></footer><AudioToggle/><PageCurtain curtain={curtain}/></>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><OceanAudioProvider><App/></OceanAudioProvider></BrowserRouter></React.StrictMode>);


