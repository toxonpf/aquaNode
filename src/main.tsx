import React,{Suspense,lazy,useCallback,useEffect,useId,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link,NavLink,useLocation} from 'react-router-dom';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {nav,team,awardUrl,resources,updates,steps,parts} from './content';
import './styles.css';
import './ocean.css';
gsap.registerPlugin(ScrollTrigger);
let sceneModule:Promise<typeof import('./Scene')>|undefined;
const loadScene=()=>sceneModule??=import('./Scene');
const Scene=lazy(loadScene);
function BuoyDrawing(){const id=useId();return <svg className="buoy-drawing" viewBox="0 0 600 520" role="img" aria-label="Conceptual buoy illustration, not an engineering model"><defs><linearGradient id={id} x2="1" y2="1"><stop stopColor="#fafcf4"/><stop offset="1" stopColor="#91adb0"/></linearGradient><radialGradient id={id+'water'}><stop stopColor="#79b7bf" stopOpacity=".65"/><stop offset="1" stopColor="#8dc7cb" stopOpacity="0"/></radialGradient></defs><ellipse cx="300" cy="300" rx="290" ry="170" fill={'url(#'+id+'water)'}/><g fill="none" stroke="#73a7ad" opacity=".38"><ellipse cx="300" cy="295" rx="230" ry="108"/><ellipse cx="300" cy="295" rx="185" ry="85"/><ellipse cx="300" cy="295" rx="145" ry="64"/></g><path d="M278 305v112l17 12 5-126" fill="#bdc8cb"/><path d="M324 308v81l12 9 9-95" fill="#839fa9"/><path d="M183 242v59c0 61 234 61 234 0v-59" fill={'url(#'+id+')'}/><path d="M183 278v23c0 61 234 61 234 0v-23c0 61-234 61-234 0" fill="#214f60"/><ellipse cx="300" cy="242" rx="117" ry="49" fill="#ed8a63"/><ellipse cx="300" cy="242" rx="99" ry="38" fill="#edf1e6"/><path d="m217 235 27-13 24 11-26 14zm115 24 27-13 24 11-26 14z" fill="#214552"/><path d="M247 186v54c0 27 106 27 106 0v-54" fill={'url(#'+id+')'}/><ellipse cx="300" cy="186" rx="53" ry="22" fill="#193e4d"/><ellipse cx="300" cy="186" rx="40" ry="15" fill="#386774"/><path d="M285 173v26m19-28v30m18-27v24" stroke="#86b2b8" strokeWidth="1"/><path d="M320 183v-78" stroke="#173b49" strokeWidth="5"/><circle cx="320" cy="101" r="5" fill="#ed764f"/></svg>}
type SceneState='loading'|'ready'|'static';
class SceneBoundary extends React.Component<{children:React.ReactNode;onUnavailable:()=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){this.props.onUnavailable()}
  render(){return this.state.failed?null:this.props.children}
}
type SceneShot='surface'|'detail';
function LoadingIndicator({ocean=false,progress}:{ocean?:boolean;progress?:number}){
  return <div className="loading-indicator" role="status">
    <div className="loading-caption"><span>{ocean?'LOADING THE OCEAN':'LOADING THE MODEL'}</span>{progress!==undefined&&<span className="loading-percentage">{progress}%</span>}</div>
    <div className={'loading-bar'+(progress===undefined?' is-indeterminate':'')} role="progressbar" aria-label={ocean?'Loading the ocean':'Loading the model'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={progress!==undefined?{transform:`scaleX(${progress/100})`}:undefined}/></div>
  </div>;
}
function Viewer({hero=false,onStateChange,onProgress,shot='surface',onShotSettled}:{hero?:boolean;onStateChange?:(state:SceneState)=>void;onProgress?:(progress:number)=>void;shot?:SceneShot;onShotSettled?:(shot:SceneShot)=>void}){
  const [active,setActive]=useState(0),[angle,setAngle]=useState(0),[expanded,setExpanded]=useState(false);
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
  return <div ref={viewerRef} className={'viewer '+(hero?'hero-viewer':'')} data-scene-state={state}>
    <div className="scene" aria-label="Conceptual buoy model" aria-busy={state==='loading'}>
      {mode==='static'?<BuoyDrawing/>:enabled&&visible?<div className="scene-live" data-ready={ready} aria-hidden={!ready}><SceneBoundary onUnavailable={unavailable}><Suspense fallback={null}><Scene hero={hero} shot={shot} onShotSettled={onShotSettled} onProgress={onProgress} active={active} angle={angle} expanded={expanded} onReady={()=>{setReady(true);onProgress?.(100)}} onUnavailable={unavailable}/></Suspense></SceneBoundary></div>:null}
      {!hero&&state==='loading'&&<div className="model-loading"><LoadingIndicator/></div>}
    </div>
    <div className="scene-caption"><span className="tiny-dot"/> CONCEPT MODEL <span>Illustrative design</span></div>
    {!hero&&<><div className="viewer-controls"><button onClick={()=>setAngle(v=>v-.4)} disabled={!enabled} aria-label="Rotate buoy left">↶</button><button onClick={()=>setAngle(v=>v+.4)} disabled={!enabled} aria-label="Rotate buoy right">↷</button><button aria-pressed={expanded} onClick={()=>setExpanded(!expanded)} disabled={!enabled}>{expanded?'Close structure':'Separate parts'}</button><button onClick={()=>{setAngle(0);setExpanded(false);setActive(0)}} disabled={!enabled}>Reset</button></div><div className="part-tabs" aria-label="Buoy parts">{parts.map((p,i)=><button key={p.name} onClick={()=>setActive(i)} aria-pressed={i===active}>{String(i+1).padStart(2,'0')} {p.name}</button>)}</div><p className="part-description" aria-live="polite">{parts[active].text}</p><p className="helper">{enabled?'Drag to orbit · Pinch to zoom · Use buttons for keyboard control':'Static view for reduced motion, limited hardware or unavailable WebGL. All part descriptions remain available.'}</p></>}
  </div>;
}
function Kicker({children}:{children:React.ReactNode}){return <p className="kicker">{children}</p>}
function ArrowLink({to,children}:{to:string;children:React.ReactNode}){return <Link className="arrow-link" to={to}>{children}<span>↗</span></Link>}
function Flow(){return <div className="flow">{[['01','Sense','Probes contact the water.'],['02','Measure','pH and temperature are measured.'],['03','Transmit','Data is sent once an hour using our own protocol.'],['04','Learn','Recorded observations can inform further investigation.']].map(([n,t,d])=><div key={n}><span>{n} —</span><h3>{t}</h3><p>{d}</p></div>)}</div>}
function Status(){return <div className="status-grid"><article className="status-current"><div className="status-top"><span className="badge"><span className="tiny-dot"/> Working now</span><span className="status-number">01</span></div><h3>The first node is working.</h3><p>One prototype measures pH and temperature, transmitting data every hour. Current status reported by the team.</p><span className="status-foot">PROTOTYPE / MEASURE / TRANSMIT</span></article><article><div className="status-top"><span className="badge muted">In development</span><span className="status-number">02</span></div><h3>Refine. Assemble. Test.</h3><p>The R0.3 carrier-board design is reviewed. Its physical assembly and testing are the next engineering steps.</p><span className="status-foot">DESIGN / ASSEMBLY / VALIDATION</span></article><article><div className="status-top"><span className="badge muted">Looking ahead</span><span className="status-number">03</span></div><h3>More points of view.</h3><p>Additional parameters and observation points, shaped by real needs. A wider network is a future direction.</p><span className="status-foot">LEARN / EXTEND / CONNECT</span></article></div>}
function OceanStory(){
  const story=useRef<HTMLDivElement>(null);
  const [sceneState,setSceneState]=useState<SceneState>('loading');
  const [progress,setProgress]=useState(0);
  const reportProgress=useCallback((value:number)=>setProgress(current=>Math.max(current,value)),[]);
  const [shot,setShot]=useState<SceneShot>('surface'),[settledShot,setSettledShot]=useState<SceneShot>('surface');
  const [presented,setPresented]=useState(false),[labelVisible,setLabelVisible]=useState(false);
  const loaded=sceneState!=='loading';
  useEffect(()=>{
    const trigger=ScrollTrigger.create({trigger:story.current,start:'top -42%',end:'bottom top',onEnter:()=>setShot('detail'),onLeaveBack:()=>setShot('surface')});
    return()=>trigger.kill();
  },[]);
  useEffect(()=>{if(sceneState==='static')setSettledShot(shot)},[sceneState,shot]);
  useEffect(()=>{
    setPresented(false);
    if(!loaded)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){setPresented(true);return}
    const timer=window.setTimeout(()=>setPresented(true),900);
    return()=>window.clearTimeout(timer);
  },[loaded]);
  useEffect(()=>{
    setLabelVisible(false);
    if(!presented)return;
    const timer=window.setTimeout(()=>setLabelVisible(true),1000);
    return()=>window.clearTimeout(timer);
  },[presented]);
  const detail=shot==='detail';
  return <div ref={story} className="ocean-story">
    <span id="buoy-intro" className="buoy-scroll-target" aria-hidden="true"/>
    <div className={'hero ocean-hero ocean-stage'+(loaded?' is-loaded':'')+(presented?' is-presented':'')+(detail&&settledShot==='detail'?' is-detail-ready':'')} data-scene-state={sceneState} data-shot={shot} data-camera-state={shot===settledShot?'settled':'moving'}>
      <Viewer hero onStateChange={setSceneState} onProgress={reportProgress} shot={shot} onShotSettled={setSettledShot}/>
      <div className="ocean-loading-screen" aria-hidden={loaded}><LoadingIndicator ocean progress={progress}/></div>
      <div className="ocean-vignette" aria-hidden="true"/>
      <section className="ocean-introduction" aria-labelledby="ocean-title" aria-hidden={detail} inert={detail}>
        <h1 id="ocean-title" className="sr-only">AquaNode — a closer look at our water</h1>
        <a href="#buoy-intro" className={'buoy-annotation'+(labelVisible?' is-visible':'')} aria-label="What is this? Discover AquaNode" tabIndex={labelVisible?0:-1}>
          <span>what is this?</span>
          <svg viewBox="0 0 200 120" fill="none" aria-hidden="true"><path className="annotation-curve" d="M177 12C164 53 104 15 83 43 65 66 68 89 25 100"/><path className="annotation-head" d="m37 86-14 15 21 2"/></svg>
        </a>
        <span className="ocean-corner ocean-corner-left">01 / THE SURFACE</span>
        <a className="ocean-scroll" href="#buoy-intro" tabIndex={presented?0:-1} aria-label="Scroll to explore AquaNode"><span>SCROLL TO EXPLORE</span><span className="scroll-track" aria-hidden="true"><i/></span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2v14m-5-5 5 5 5-5"/></svg></a>
        <span className="ocean-corner ocean-corner-right">A SMALL NODE.<br/>A WORLD TO UNDERSTAND.</span>
      </section>
      <section className="buoy-introduction" aria-labelledby="buoy-intro-title" aria-hidden={!detail} inert={!detail}>
        <div className="buoy-copy">
          <Kicker>02 / MEET AQUANODE</Kicker>
          <h2 id="buoy-intro-title">A small buoy.<br/>A closer look<br/>at our water.</h2>
          <p>AquaNode is a water-monitoring prototype that brings regular observation and hands-on engineering together.</p>
          <dl className="buoy-reading-types"><div><dt>pH</dt><dd>Water acidity</dd></div><div><dt>°C</dt><dd>Water temperature</dd></div></dl>
          <p className="buoy-interval">Measurements transmitted once an hour.<br/>One working prototype. More possibilities ahead.</p>
          <ArrowLink to="/technology">Explore the technology</ArrowLink>
        </div>
        <a className="back-to-surface" href="#ocean-title" onClick={event=>{event.preventDefault();if(story.current)window.scrollTo({top:window.scrollY+story.current.getBoundingClientRect().top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}}>↑ Back to the surface</a>
        <span className="ocean-corner ocean-corner-left">02 / THE BUOY</span>
      </section>
    </div>
  </div>;
}
function Home(){return <>
  <OceanStory/>
  <div className="award"><span className="award-mark" aria-hidden="true">✳</span><p>Youth Innovation Challenge 2026 <b>Winner</b></p><a href={awardUrl} target="_blank" rel="noreferrer">A small team. A recognised idea. <span>↗</span></a></div>
  <section id="progress" className="section progress-section"><div className="section-heading"><div><Kicker>01 / THE PROJECT TODAY</Kicker><h2>A working prototype.<br/>An open path forward.</h2></div><div className="heading-aside"><p>Follow the steps from a first device to a wider understanding of water.</p><ArrowLink to="/journal">Follow our development</ArrowLink></div></div><Status/></section>
  <section id="why" className="section reason-section"><div className="reason-visual" aria-hidden="true"><div className="water-line water-line-1"/><div className="water-line water-line-2"/><div className="water-line water-line-3"/><span className="reason-plus">+</span><span className="reason-word">Look closer.</span><span className="reason-caption">A CHANGE BEGINS WITH A QUESTION.</span></div><div><Kicker>02 / WHY WATER?</Kicker><h2>We can only care for<br/>what we understand.</h2><p className="lead">Water changes every day. Understanding it starts with paying attention.</p><p>AquaNode brings regular measurement and hands-on learning together. From a sensor in the water to a reading worth investigating, we make the process of observation tangible.</p><ArrowLink to="/about">The idea behind AquaNode</ArrowLink></div></section>
  <section className="section dark device-section"><div className="device-intro"><Kicker>03 / MEET THE NODE</Kicker><h2>Purpose in<br/>every part.</h2><p>A floating body. Protected electronics. Sensors in the water. Explore how a simple concept becomes an instrument for observation.</p><div className="device-facts"><span>01 <b>Float</b></span><span>02 <b>Measure</b></span><span>03 <b>Connect</b></span></div><ArrowLink to="/technology">Inside the technology</ArrowLink></div><Viewer/></section>
  <section className="section cycle-section"><div className="section-heading"><div><Kicker>04 / THE OBSERVATION CYCLE</Kicker><h2>From water to understanding.</h2></div><span className="cycle-mark" aria-hidden="true">↻</span></div><Flow/><p className="note">Public measurement data is not yet available. The site presents our development progress.</p></section>
  <section className="future section"><div><Kicker>05 / LOOKING AHEAD</Kicker><h2>One node is a start.<br/>A network is a possibility.</h2><p>More observation points. More questions we can explore together. Our next chapter is shaped by what we learn from the first.</p><span className="badge muted">Future network concept · not deployed</span></div><div className="network-art" role="img" aria-label="Illustration of a possible future network, not actual installations"><div className="network-connection"/>{[0,1,2,3,4].map(i=><span key={i} className={'node node-'+i}><i/></span>)}<span className="network-caption">INDIVIDUAL NODES. SHARED PERSPECTIVE.</span></div></section>
  <section className="section evidence-section"><div className="section-heading"><div><Kicker>06 / OPEN ENGINEERING</Kicker><h2>The work behind the water.</h2></div><ArrowLink to="/build">Build & resources</ArrowLink></div><div className="evidence"><figure><span className="figure-label">ENGINEERING ARCHIVE / R0.3</span><img src="/assets/PCB_F.png" alt="R0.3 PCB front copper and silkscreen drawing" loading="lazy"/><figcaption>Original PCB drawing · R0.3 · Awaiting physical validation</figcaption></figure><div><span className="badge muted">On the workbench</span><h3>Made to be explored.<br/>Documented as we go.</h3><p>Inspect the board layout, assembly drawing and bill of materials. Follow the decisions and questions that take us from a design to its next test.</p><ArrowLink to="/build">Open the engineering resources</ArrowLink><ArrowLink to="/journal">Read the project journal</ArrowLink></div></div></section>
  <section className="team-invitation"><Kicker>CURIOUS MINDS. A SHARED DIRECTION.</Kicker><h2>It starts with people.</h2><ArrowLink to="/team">Meet the AquaNode team</ArrowLink></section>
</>}
function PageIntro({label,title,text}:{label:string;title:string;text:string}){return <header className="page-intro"><Kicker>{label}</Kicker><h1>{title}</h1><p>{text}</p></header>}
function About(){return <><PageIntro label="THE PROJECT" title="Understanding starts with observing." text="AquaNode connects hands-on engineering with a long-term ambition: making water observation more accessible."/><section className="section split"><h2>Build the tool.<br/>Understand the reading.</h2><div><p className="lead">Our starting point is one working buoy that measures pH and temperature.</p><p>These parameters describe aspects of water conditions. They do not, on their own, establish whether water is safe or explain the cause of a change. Useful observations need calibration, context and careful interpretation.</p><p>Self-assembly is part of the idea. Working through electronics, sensing and data helps learners understand how a measurement is made and where its limitations lie.</p></div></section><section className="section soft"><h2>A clear line between now and next.</h2><Status/></section><section className="section split"><Kicker>RECOGNITION</Kicker><div><h2>Youth Innovation<br/>Challenge 2026.</h2><p>AquaNode won the Youth Innovation Challenge 2026. The GEEP profile documents the recognition and the original project vision.</p><p className="note">That earlier description mentions turbidity, live data, a shared map and learning apps. The current scope is pH and temperature, transmitted hourly. Those broader features are not presented as implemented here.</p><a className="arrow-link" href={awardUrl} target="_blank" rel="noreferrer">Read the GEEP profile ↗</a></div></section></>}
function Technology(){return <><PageIntro label="THE BUOY / TECHNOLOGY" title="An instrument for asking better questions." text="Explore a conceptual view of the buoy, then read what is confirmed about the working prototype and the separate R0.3 design."/><section className="section dark"><Viewer/></section><section className="section split"><h2>What works now.</h2><dl className="specs">{[['Prototype count','One, reported by the team'],['Water parameters','pH and temperature'],['Transmission interval','Once an hour'],['Communication','Own protocol; details not published'],['Public measurements','Not yet available'],['Deployed network','None']].map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl></section><section className="section soft"><Kicker>ENGINEERING / R0.3</Kicker><h2>A design you can inspect.</h2><div className="evidence"><figure><img src="/assets/Assembly.png" alt="Actual supplied R0.3 component placement drawing" loading="lazy"/><figcaption>R0.3 assembly layout · CAD source, not a photograph</figcaption></figure><div><p>The provided engineering package specifies an 80 × 60 mm, two-layer carrier with XIAO ESP32S3, ADS1115 conversion and a DS18B20 temperature input. These are R0.3 design choices, not a verified inventory of the existing buoy.</p><p>Native CAD checks passed according to the release report. Module fit, analog performance, power transitions and water sealing still require physical validation.</p><ArrowLink to="/build">Inspect the assembly resources</ArrowLink></div></div></section><section className="section"><h2>The observation cycle.</h2><Flow/></section></>}
function Build(){return <><PageIntro label="BUILD / RESOURCES" title="Learn by putting it together." text="A readable orientation to the supplied R0.3 assembly and test notes. This engineering revision still needs physical validation."/><section className="section build-layout"><aside><Kicker>ASSEMBLY GUIDE</Kicker>{steps.map(([title],i)=><a key={title} href={'#step-'+i}>{String(i+1).padStart(2,'0')} {title}</a>)}<a href="#downloads">↓ Source materials</a></aside><div><p className="note">Scope: the steps below summarize the supplied Russian engineering notes. They are not a complete, tested buoy assembly manual. Firmware and physical build photographs were not included.</p>{steps.map(([title,text],i)=><article className="build-step" id={'step-'+i} key={title}><Kicker>STEP {String(i+1).padStart(2,'0')}</Kicker><h2>{title}</h2><p>{text}</p></article>)}</div></section><section className="section soft" id="downloads"><Kicker>REAL FILES / NO PLACEHOLDERS</Kicker><h2>On the workbench.</h2>{resources.map(r=><a key={r.url} className="download" href={r.url} download><div><h3>{r.name}</h3><p>{r.detail}</p></div><span>Download ↓</span></a>)}<p className="note">Source documentation is supplied in Russian. Hardware and documentation attribution is preserved in the included notice. Protocol details and unpublished firmware are not distributed here.</p></section></>}
function Journal(){return <><PageIntro label="PROJECT JOURNAL" title="The work, as it stands." text="Confirmed milestones, engineering evidence and open questions. Dates are shown only where the source provides them."/><section className="section journal">{updates.map(u=><article key={u.title}><div><Kicker>{u.date}</Kicker><span className="badge muted">{u.status}</span></div><div><h2>{u.title}</h2><p>{u.body}</p></div></article>)}</section></>}
function Team(){return <><PageIntro label="PEOPLE / AQUANODE" title="A shared curiosity about water." text="The people bringing together the engineering, learning and long-term vision of AquaNode."/><section className="section team-list">{team.map((p,i)=><article key={p.name}><span className="person-number">0{i+1}</span><h2>{p.name}</h2><p>{p.role}</p>{p.links.map(l=><a key={l.url} href={l.url}>{l.label} ↗</a>)}</article>)}</section><section className="section soft"><Kicker>FOLLOW THE PROJECT</Kicker><h2>Get to know AquaNode.</h2><p>Our public GEEP profile introduces the project and its recognition. Direct contact details will be added when the team makes them available.</p><a className="arrow-link" href={awardUrl} target="_blank" rel="noreferrer">Visit our GEEP profile ↗</a></section></>}
function AudioToggle(){const audio=useRef<HTMLAudioElement|null>(null),[playing,setPlaying]=useState(false),[error,setError]=useState(false),[busy,setBusy]=useState(false);useEffect(()=>()=>{audio.current?.pause()},[]);async function toggle(){if(playing){audio.current?.pause();setPlaying(false);return}setBusy(true);try{if(!audio.current){audio.current=new Audio('/assets/ocean.ogg');audio.current.loop=true;audio.current.volume=.28}await audio.current.play();setPlaying(true);setError(false)}catch{setError(true)}finally{setBusy(false)}}return <div className="audio-control"><button disabled={busy} onClick={toggle} aria-pressed={playing}>{playing?'Ⅱ Sound on':'≈ Sound off'}</button>{error&&<span role="status">Audio unavailable. Try again.</span>}</div>}
function App(){const {pathname}=useLocation(),[menu,setMenu]=useState(false);useEffect(()=>{setMenu(false);window.scrollTo({top:0,behavior:'instant'});const title=nav.find(([p])=>p===pathname)?.[1]||'Page not found';document.title=`${title} — AquaNode`;const description=pathname==='/'?'One working buoy. pH and temperature. Explore AquaNode and its open engineering resources.':`${title}: AquaNode water observation, current progress and engineering materials.`;document.querySelector('meta[name="description"]')?.setAttribute('content',description);document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);const ctx=gsap.context(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.utils.toArray<HTMLElement>('.section h2').forEach(el=>gsap.from(el,{y:18,duration:.7,scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
  if(document.querySelector('.network-art')){
    gsap.from('.network-art .node:not(.node-0)',{opacity:0,y:12,scale:.7,stagger:.13,duration:.7,ease:'power2.out',scrollTrigger:{trigger:'.network-art',start:'top 85%',once:true}});
    gsap.from('.network-connection',{opacity:0,duration:1.2,scrollTrigger:{trigger:'.network-art',start:'top 85%',once:true}});
  }
});return()=>ctx.revert()},[pathname]);return <><a className="skip-link" href="#main">Skip to content</a><header className={'site-header'+(pathname==='/'?' ocean-header':'')}><Link className="logo" to="/" aria-label="AquaNode home"><svg viewBox="0 0 30 32" aria-hidden="true"><path d="M2 27 15 4 28 27H20l-5-9-5 9Z" fill="currentColor"/></svg>AquaNode</Link><button className="menu-button" onClick={()=>setMenu(!menu)} aria-expanded={menu} aria-controls="navigation">{menu?'Close':'Menu'} {menu?'−':'+'}</button><nav id="navigation" className={menu?'open':''} aria-label="Main navigation">{nav.map(([p,l])=><NavLink key={p} to={p} end>{l}</NavLink>)}</nav><Link className="header-cta" to="/journal">Project progress <span>↗</span></Link></header><main id="main" tabIndex={-1}><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/technology" element={<Technology/>}/><Route path="/build" element={<Build/>}/><Route path="/journal" element={<Journal/>}/><Route path="/team" element={<Team/>}/><Route path="*" element={<section className="section"><h1>This page is uncharted.</h1><ArrowLink to="/">Return to the overview</ArrowLink></section>}/></Routes></main><footer><Link className="footer-logo" to="/">AquaNode</Link><div className="footer-row"><p>Observe with curiosity.<br/>Build with care.</p><Link to="/build">Explore the resources ↗</Link><span>KAZAKHSTAN · 2026</span></div><div className="footer-legal"><span>AquaNode · One prototype. An open-ended possibility.</span><span>Ocean audio: <a href="https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg">Luftrum</a> · <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a> · Unmodified</span></div></footer><AudioToggle/></>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);


