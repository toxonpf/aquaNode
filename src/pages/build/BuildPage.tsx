import {t} from '../../features/i18n/i18n';
import {useLayoutEffect,useRef,useState,type MouseEvent} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {DownloadLink} from '../../components/ui/ActionLinks';
import {resources,steps} from '../../data/content';
const getGuide=()=>[
 {label:t("Design review"),phase:t("BEFORE YOU ORDER"),check:t("Match the drawing, bill of materials and purchased module revision.")},
 {label:t("Mechanical fit"),phase:t("ASSEMBLY"),check:t("Confirm module clearance, battery leads and USB access with the actual parts.")},
 {label:t("Visual inspection"),phase:t("BEFORE POWER"),check:t("Check polarity, connector orientation and shorts with power disconnected.")},
 {label:t("Measurement paths"),phase:t("FIRST POWER-UP"),check:t("Verify the controller, ADC and temperature sensor separately before adding pH.")},
 {label:t("Power checks"),phase:t("BENCH TEST"),check:t("Record supply behaviour during USB, battery and switch transitions.")},
 {label:t("Calibration"),phase:t("MEASUREMENT QUALITY"),check:t("Keep raw readings, reference values, test conditions and uncertainty together.")},
 {label:t("Enclosure test"),phase:t("SYSTEM TEST"),check:t("Confirm the empty enclosure is watertight before testing the complete system.")},
];
const getEquipment=()=>[
 {name:t("Controller & radio"),parts:'XIAO ESP32S3 + Wio SX1262',note:t("Check the purchased revision and its intended board-to-board connection.")},
 {name:t("Measurement hardware"),parts:t("ADS1115 · DS18B20 · pH front end"),note:t("Confirm the pH module’s documented supply, pinout and output range.")},
 {name:t("Power & connections"),parts:t("Protected 1S battery · USB · connectors"),note:t("Use the bill of materials to check the carrier’s components and assembly variant.")},
 {name:t("Enclosure & test equipment"),parts:t("Housing · cable glands · reference instruments"),note:t("Plan for mechanical fit, calibration and a separate enclosure leak test.")},
];
const getDrawings=()=>[
 {label:t("Assembly"),src:'/assets/Assembly.png',alt:t("Original AquaNode R0.3 assembly drawing with component positions and connector orientation"),caption:t("Component placement & connector orientation")},
 {label:t("Copper layout"),src:'/assets/PCB_F.png',alt:t("Original AquaNode R0.3 front copper and silkscreen drawing"),caption:t("Front copper & silkscreen")},
];

function stepFromHash(hash:string){
 const match=/^#step-(\d+)$/.exec(hash);
 const index=match?Number(match[1]):-1;
 return index>=0&&index<steps.length?index:null;
}

export default function BuildPage(){
 const guide=getGuide(),equipment=getEquipment(),drawings=getDrawings();
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
  let cancelled=false,ready=false,alignedTop=NaN;
  const schedule=()=>{
   if(cancelled||!ready)return;
   cancelAnimationFrame(frame);
   let previous=NaN,stableFrames=0;
   const alignWhenStable=()=>{
    if(cancelled)return;
    const top=window.scrollY+target.getBoundingClientRect().top;
    stableFrames=Math.abs(top-previous)<.5?stableFrames+1:0;previous=top;
    if(stableFrames<3){frame=requestAnimationFrame(alignWhenStable);return}
    if(Math.abs(top-alignedTop)<.5)return;
    alignedTop=top;
    const headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom??0;
    window.scrollTo({top:top-headerBottom-24,
     behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   };
   frame=requestAnimationFrame(alignWhenStable);
  };
  // Scrolling can expose another font weight and start a second font load.
  // Follow that reflow while the anchor owns scrolling, then yield to input.
  const resize=new ResizeObserver(schedule);
  const page=target.closest('.build-page');
  if(page)resize.observe(page);
  resize.observe(guideElement);
  const interrupt=()=>{cancelled=true;cancelAnimationFrame(frame);resize.disconnect()};
  const scrollKey=(event:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))interrupt()};
  document.fonts.addEventListener('loadingdone',schedule);
  window.addEventListener('wheel',interrupt,{passive:true});
  window.addEventListener('touchstart',interrupt,{passive:true});
  window.addEventListener('pointerdown',interrupt,{passive:true});
  window.addEventListener('keydown',scrollKey);
  let frame=requestAnimationFrame(()=>{
   // Both the old and new panels must settle before measuring the anchor.
   // A native fragment jump uses the position before the accordion reflows.
   void guideElement.getBoundingClientRect();
   const transitions=guideElement.getAnimations({subtree:true}).filter(animation=>
    'transitionProperty' in animation&&animation.transitionProperty==='grid-template-rows');
   const loaded=document.readyState==='complete'?Promise.resolve():new Promise<void>(resolve=>window.addEventListener('load',()=>resolve(),{once:true}));
   Promise.allSettled([loaded,document.fonts.ready,...transitions.map(animation=>animation.finished)]).then(()=>{
    if(cancelled)return;
    ready=true;schedule();
   });
  });
  return()=>{
   interrupt();document.fonts.removeEventListener('loadingdone',schedule);
   window.removeEventListener('wheel',interrupt);window.removeEventListener('touchstart',interrupt);
   window.removeEventListener('pointerdown',interrupt);window.removeEventListener('keydown',scrollKey);
  };
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
   <div className="build-section-top"><p className="kicker">{t("BUILD / RESOURCES")}</p><span>{t("THE ENGINEERING WORKBENCH / R0.3")}</span></div>
   <div className="build-hero-layout">
    <div className="build-hero-copy"><span className="build-release"><i/> {t("OPEN ENGINEERING · R0.3")}</span>
     <Heading as="h1">{t("Learn by")}<br/>{' '}{t("putting it")}<br/>{' '}<em>{t("together.")}</em></Heading>
     <p>{t("Follow the design from component placement to the first bench checks. Original drawings, a parts list and a clear route through the work ahead.")}</p>
     <div className="build-hero-actions"><a className="arrow-link" href="#assembly-guide" onClick={event=>navigateToAnchor(event,'assembly-guide')}>{t("Explore the build")} <FlexibleArrow direction="down"/></a><a className="build-files-link arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Get the source files")} <FlexibleArrow direction="down"/></a></div>
    </div>
    <div className="build-drawing-panel">
     <div className="build-drawing-top"><span>{t("01 / ON THE DRAWING BOARD")}</span><span>R0.3</span></div>
     <div className="build-drawing-picker" role="group" aria-label={t("Engineering drawing view")}>{drawings.map((view,index)=><button type="button" key={view.label} aria-pressed={drawing===index} aria-controls="build-drawing" onClick={()=>setDrawing(index)}>{view.label}</button>)}</div>
     <figure id="build-drawing" aria-live="polite"><img src={activeDrawing.src} alt={activeDrawing.alt} width="1378" height="1169"/><figcaption>{activeDrawing.caption}<span>{t("ORIGINAL CAD EXPORT")}</span></figcaption></figure>
    </div>
   </div>
   <dl className="build-hero-facts"><div><dt>{t("Carrier footprint")}</dt><dd>80 × 60 <span>{t("mm")}</span></dd></div><div><dt>{t("Board construction")}</dt><dd>2 <span>{t("copper layers")}</span></dd></div><div><dt>{t("Release stage")}</dt><dd>{t("CAD reviewed")}<span>{t("Physical validation pending")}</span></dd></div></dl>
  </header>

  <section className="build-status" aria-label={t("Engineering release status")}><span className="build-status-mark" aria-hidden="true"><FlexibleArrow direction="up-right"/></span><div><Heading as="h2">{t("A working prototype. A separate design revision.")}</Heading><p>{t("The team has a working buoy. These resources document the R0.3 carrier board, which still needs physical assembly and testing. The guide is an orientation to that revision; firmware and a complete reproducible buoy build are not included.")}</p></div><Link className="arrow-link" to="/journal">{t("Current progress")} <FlexibleArrow direction="up-right"/></Link></section>

  <section className="build-equipment build-section" aria-labelledby="build-equipment-title">
   <div className="build-section-top"><p className="kicker">{t("01 / PREPARE THE BENCH")}</p><span>{t("PARTS. TOOLS. A PLACE TO START.")}</span></div>
   <div className="build-equipment-layout"><div><Heading as="h2" id="build-equipment-title">{t("Know what")}<br/>{t("goes into it.")}</Heading><p>{t("Start with the actual modules and the R0.3 bill of materials. Check fit and compatibility before ordering the carrier board.")}</p><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Find the parts list")} <FlexibleArrow direction="down"/></a></div>
    <ol className="build-equipment-list">{equipment.map((item,index)=><li key={item.name}><span className="build-item-number">0{index+1}</span><div><Heading as="h3">{item.name}</Heading><p className="build-equipment-parts">{item.parts}</p><p>{item.note}</p></div></li>)}</ol>
   </div>
  </section>

  <section className="build-guide build-section" id="assembly-guide" aria-labelledby="build-guide-title">
   <div className="build-section-top"><p className="kicker">{t("02 / FROM DESIGN TO TEST")}</p><span>{t("SEVEN STEPS. ONE CAREFUL SEQUENCE.")}</span></div>
   <div className="build-guide-heading"><Heading as="h2" id="build-guide-title">{t("One connection")}<br/>{t("at a time.")}</Heading><p>{t("Work from an unpowered inspection to individual measurement paths, then the complete system. Open a step for the details.")}</p></div>
   <div className="build-guide-layout">
    <aside className="build-guide-nav"><span className="build-nav-label">{t("ASSEMBLY GUIDE")}</span><nav aria-label={t("Assembly steps")}>{guide.map((item,index)=><a key={item.label} href={`#step-${index}`} aria-current={openStep===index?'step':undefined} onClick={event=>navigateToAnchor(event,`step-${index}`)}><span>0{index+1}</span><span className="build-nav-copy">{item.label}</span><FlexibleArrow direction="up-right"/></a>)}</nav><p>{t("Based on the supplied Russian engineering notes. Keep the original drawing and parts list alongside the guide.")}</p><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Source materials")} <FlexibleArrow direction="down"/></a></aside>
    <div className="build-guide-steps" ref={guideSteps}>{steps.map(([title,text],index)=><article className="build-step" id={`step-${index}`} key={title} data-open={openStep===index}><h3 className="build-step-heading"><button type="button" id={`build-step-toggle-${index}`} aria-expanded={openStep===index} aria-controls={`build-step-content-${index}`} onClick={()=>toggleStep(index)}><span className="build-step-number">0{index+1}</span><Heading as="span" className="build-step-title">{title}</Heading><FlexibleArrow direction="up-right"/></button></h3><div className="build-step-reveal" aria-hidden={openStep!==index} inert={openStep!==index}><div className="build-step-clip"><div className="build-step-content" id={`build-step-content-${index}`} role="region" aria-labelledby={`build-step-toggle-${index}`}><span className="build-step-phase">{guide[index].phase}</span><p>{text}</p><div className="build-checkpoint"><span>{t("BEFORE MOVING ON")}</span><p>{guide[index].check}</p></div></div></div></div></article>)}</div>
   </div>
  </section>

  <section className="build-downloads build-section" id="downloads" aria-labelledby="build-downloads-title">
   <div className="build-section-top"><p className="kicker">{t("03 / SOURCE MATERIALS")}</p><span>{t("ORIGINAL FILES / DIRECT DOWNLOADS")}</span></div>
   <div className="build-download-layout"><div><Heading as="h2" id="build-downloads-title">{t("Off the page.")}<br/><em>{t("Onto the bench.")}</em></Heading><p>{t("Take the drawings and component list with you. Engineering notes are supplied in Russian; the attribution file explains sources and reuse conditions.")}</p><span className="build-download-count">{t("03 FILES · REVISION R0.3")}</span></div><div className="build-download-list">{resources.map(resource=><DownloadLink key={resource.url} href={resource.url} label={resource.name} format={resource.url.split('.').pop()!.toUpperCase()} detail={resource.detail} className="resource-download"/>)}<p className="build-download-note">{t("Firmware and protocol implementation are not part of this release.")}</p></div></div>
  </section>

  <section className="build-next build-section"><div><p className="kicker">{t("THE NEXT CHAPTER")}</p><Heading as="h2">{t("The drawing is a start.")}<br/>{t("The evidence comes next.")}</Heading></div><div><p>{t("Follow the checks, revisions and open questions as the design moves towards physical validation.")}</p><Link className="arrow-link" to="/journal">{t("Follow development")} <FlexibleArrow direction="up-right"/></Link></div></section>
 </div>;
}
