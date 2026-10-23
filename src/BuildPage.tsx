import {useLayoutEffect,useRef,useState,type MouseEvent} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import Heading from './Heading';
import FlexibleArrow from './FlexibleArrow';
import {DownloadLink} from './ActionLinks';
import {resources,steps} from './content';
import './build.css';

const guide=[
 {label:'Design review',phase:'BEFORE YOU ORDER',check:'Match the drawing, bill of materials and purchased module revision.'},
 {label:'Mechanical fit',phase:'ASSEMBLY',check:'Confirm module clearance, battery leads and USB access with the actual parts.'},
 {label:'Visual inspection',phase:'BEFORE POWER',check:'Check polarity, connector orientation and shorts with power disconnected.'},
 {label:'Measurement paths',phase:'FIRST POWER-UP',check:'Verify the controller, ADC and temperature sensor separately before adding pH.'},
 {label:'Power checks',phase:'BENCH TEST',check:'Record supply behaviour during USB, battery and switch transitions.'},
 {label:'Calibration',phase:'MEASUREMENT QUALITY',check:'Keep raw readings, reference values, test conditions and uncertainty together.'},
 {label:'Enclosure test',phase:'SYSTEM TEST',check:'Confirm the empty enclosure is watertight before testing the complete system.'},
];
const equipment=[
 {name:'Controller & radio',parts:'XIAO ESP32S3 + Wio SX1262',note:'Check the purchased revision and its intended board-to-board connection.'},
 {name:'Measurement hardware',parts:'ADS1115 · DS18B20 · pH front end',note:'Confirm the pH module’s documented supply, pinout and output range.'},
 {name:'Power & connections',parts:'Protected 1S battery · USB · connectors',note:'Use the bill of materials to check the carrier’s components and assembly variant.'},
 {name:'Enclosure & test equipment',parts:'Housing · cable glands · reference instruments',note:'Plan for mechanical fit, calibration and a separate enclosure leak test.'},
];
const drawings=[
 {label:'Assembly',src:'/assets/Assembly.png',alt:'Original AquaNode R0.3 assembly drawing with component positions and connector orientation',caption:'Component placement & connector orientation'},
 {label:'Copper layout',src:'/assets/PCB_F.png',alt:'Original AquaNode R0.3 front copper and silkscreen drawing',caption:'Front copper & silkscreen'},
];

function stepFromHash(hash:string){
 const match=/^#step-(\d+)$/.exec(hash);
 const index=match?Number(match[1]):-1;
 return index>=0&&index<steps.length?index:null;
}

export default function BuildPage(){
 const {hash}=useLocation(),navigate=useNavigate();
 const [drawing,setDrawing]=useState(0),[openStep,setOpenStep]=useState<number|null>(()=>stepFromHash(hash)??0);
 const [anchorTarget,setAnchorTarget]=useState<{id:string}|null>(null);
 const guideSteps=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const index=stepFromHash(hash);
  if(index!==null)setOpenStep(index);
  if(index!==null||hash==='#downloads'||hash==='#assembly-guide')setAnchorTarget({id:hash.slice(1)});
  else setAnchorTarget(null);
 },[hash]);
 useLayoutEffect(()=>{
  if(!anchorTarget||!guideSteps.current)return;
  const guideElement=guideSteps.current;
  const target=document.getElementById(anchorTarget.id);
  if(!target)return;
  let cancelled=false;
  let frame=requestAnimationFrame(()=>{
   // Both the old and new panels must settle before measuring the anchor.
   // A native fragment jump uses the position before the accordion reflows.
   void guideElement.getBoundingClientRect();
   const transitions=guideElement.getAnimations({subtree:true}).filter(animation=>
    'transitionProperty' in animation&&animation.transitionProperty==='grid-template-rows');
   const loaded=document.readyState==='complete'?Promise.resolve():new Promise<void>(resolve=>window.addEventListener('load',()=>resolve(),{once:true}));
   Promise.allSettled([loaded,document.fonts.ready,...transitions.map(animation=>animation.finished)]).then(()=>{
    if(cancelled)return;
    frame=requestAnimationFrame(()=>{
     if(cancelled)return;
     const headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom??0;
     window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-headerBottom-24,
      behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    });
   });
  });
  return()=>{cancelled=true;cancelAnimationFrame(frame)};
 },[anchorTarget]);
 const navigateToAnchor=(event:MouseEvent<HTMLAnchorElement>,id:string)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  if(hash===`#${id}`){
   const index=stepFromHash(hash);
   if(index!==null)setOpenStep(index);
   setAnchorTarget({id});
  }else navigate(`#${id}`,{preventScrollReset:true});
 };
 const toggleStep=(index:number)=>{
  setAnchorTarget(null);
  setOpenStep(current=>current===index?null:index);
 };
 const activeDrawing=drawings[drawing];
 return <div className="build-page">
  <header className="build-hero page-intro">
   <div className="build-section-top"><p className="kicker">BUILD / RESOURCES</p><span>THE ENGINEERING WORKBENCH / R0.3</span></div>
   <div className="build-hero-layout">
    <div className="build-hero-copy"><span className="build-release"><i/> OPEN ENGINEERING · R0.3</span>
     <Heading as="h1">Learn by<br/>{' '}putting it<br/>{' '}<em>together.</em></Heading>
     <p>Follow the design from component placement to the first bench checks. Original drawings, a parts list and a clear route through the work ahead.</p>
     <div className="build-hero-actions"><a className="arrow-link" href="#assembly-guide" onClick={event=>navigateToAnchor(event,'assembly-guide')}>Explore the build <FlexibleArrow direction="down"/></a><a className="build-files-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>Get the source files <span aria-hidden="true">↗</span></a></div>
    </div>
    <div className="build-drawing-panel">
     <div className="build-drawing-top"><span>01 / ON THE DRAWING BOARD</span><span>R0.3</span></div>
     <div className="build-drawing-picker" role="group" aria-label="Engineering drawing view">{drawings.map((view,index)=><button type="button" key={view.label} aria-pressed={drawing===index} aria-controls="build-drawing" onClick={()=>setDrawing(index)}>{view.label}</button>)}</div>
     <figure id="build-drawing" aria-live="polite"><img src={activeDrawing.src} alt={activeDrawing.alt} width="1378" height="1169"/><figcaption>{activeDrawing.caption}<span>ORIGINAL CAD EXPORT</span></figcaption></figure>
    </div>
   </div>
   <dl className="build-hero-facts"><div><dt>Carrier footprint</dt><dd>80 × 60 <span>mm</span></dd></div><div><dt>Board construction</dt><dd>2 <span>copper layers</span></dd></div><div><dt>Release stage</dt><dd>CAD reviewed<span>Physical validation pending</span></dd></div></dl>
  </header>

  <section className="build-status" aria-label="Engineering release status"><span className="build-status-mark" aria-hidden="true">↗</span><div><Heading as="h2">A working prototype. A separate design revision.</Heading><p>The team has a working buoy. These resources document the R0.3 carrier board, which still needs physical assembly and testing. The guide is an orientation to that revision; firmware and a complete reproducible buoy build are not included.</p></div><Link className="arrow-link" to="/journal">Current progress <FlexibleArrow direction="up-right"/></Link></section>

  <section className="build-equipment build-section" aria-labelledby="build-equipment-title">
   <div className="build-section-top"><p className="kicker">01 / PREPARE THE BENCH</p><span>PARTS. TOOLS. A PLACE TO START.</span></div>
   <div className="build-equipment-layout"><div><Heading as="h2" id="build-equipment-title">Know what<br/>goes into it.</Heading><p>Start with the actual modules and the R0.3 bill of materials. Check fit and compatibility before ordering the carrier board.</p><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>Find the parts list <FlexibleArrow direction="down"/></a></div>
    <ol className="build-equipment-list">{equipment.map((item,index)=><li key={item.name}><span className="build-item-number">0{index+1}</span><div><Heading as="h3">{item.name}</Heading><p className="build-equipment-parts">{item.parts}</p><p>{item.note}</p></div></li>)}</ol>
   </div>
  </section>

  <section className="build-guide build-section" id="assembly-guide" aria-labelledby="build-guide-title">
   <div className="build-section-top"><p className="kicker">02 / FROM DESIGN TO TEST</p><span>SEVEN STEPS. ONE CAREFUL SEQUENCE.</span></div>
   <div className="build-guide-heading"><Heading as="h2" id="build-guide-title">One connection<br/>at a time.</Heading><p>Work from an unpowered inspection to individual measurement paths, then the complete system. Open a step for the details.</p></div>
   <div className="build-guide-layout">
    <aside className="build-guide-nav"><span className="build-nav-label">ASSEMBLY GUIDE</span><nav aria-label="Assembly steps">{guide.map((item,index)=><a key={item.label} href={`#step-${index}`} aria-current={openStep===index?'step':undefined} onClick={event=>navigateToAnchor(event,`step-${index}`)}><span>0{index+1}</span>{item.label}<span aria-hidden="true">↗</span></a>)}</nav><p>Based on the supplied Russian engineering notes. Keep the original drawing and parts list alongside the guide.</p><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>Source materials <FlexibleArrow direction="down"/></a></aside>
    <div className="build-guide-steps" ref={guideSteps}>{steps.map(([title,text],index)=><article className="build-step" id={`step-${index}`} key={title} data-open={openStep===index}><h3 className="build-step-heading"><button type="button" id={`build-step-toggle-${index}`} aria-expanded={openStep===index} aria-controls={`build-step-content-${index}`} onClick={()=>toggleStep(index)}><span className="build-step-number">0{index+1}</span><span>{title}</span><FlexibleArrow direction="up-right"/></button></h3><div className="build-step-reveal" aria-hidden={openStep!==index} inert={openStep!==index}><div className="build-step-clip"><div className="build-step-content" id={`build-step-content-${index}`} role="region" aria-labelledby={`build-step-toggle-${index}`}><span className="build-step-phase">{guide[index].phase}</span><p>{text}</p><div className="build-checkpoint"><span>BEFORE MOVING ON</span><p>{guide[index].check}</p></div></div></div></div></article>)}</div>
   </div>
  </section>

  <section className="build-downloads build-section" id="downloads" aria-labelledby="build-downloads-title">
   <div className="build-section-top"><p className="kicker">03 / SOURCE MATERIALS</p><span>ORIGINAL FILES / DIRECT DOWNLOADS</span></div>
   <div className="build-download-layout"><div><Heading as="h2" id="build-downloads-title">Off the page.<br/><em>Onto the bench.</em></Heading><p>Take the drawings and component list with you. Engineering notes are supplied in Russian; the attribution file explains sources and reuse conditions.</p><span className="build-download-count">03 FILES · REVISION R0.3</span></div><div className="build-download-list">{resources.map(resource=><DownloadLink key={resource.url} href={resource.url} label={resource.name} format={resource.url.split('.').pop()!.toUpperCase()} detail={resource.detail} className="resource-download"/>)}<p className="build-download-note">Firmware and protocol implementation are not part of this release.</p></div></div>
  </section>

  <section className="build-next build-section"><div><p className="kicker">THE NEXT CHAPTER</p><Heading as="h2">The drawing is a start.<br/>The evidence comes next.</Heading></div><div><p>Follow the checks, revisions and open questions as the design moves towards physical validation.</p><Link className="arrow-link" to="/journal">Follow development <FlexibleArrow direction="up-right"/></Link></div></section>
 </div>;
}
