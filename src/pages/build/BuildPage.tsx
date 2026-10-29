import ArchitectureImage from '../../components/ui/ArchitectureImage';
import SectionLabel, {type SectionTheme} from '../../components/ui/SectionLabel';
import {t,useLocale} from '../../features/i18n/i18n';
import {architectureUrl,revision} from '../../data/project';
import RevisionNotice from '../../components/ui/RevisionNotice';
import {useLayoutEffect,useRef,useState,type MouseEvent} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {DownloadLink} from '../../components/ui/ActionLinks';
import {resources,steps} from '../../data/content';
const getGuide=()=>[{label:t("Design review"),phase:t("REVISION SCOPE"),check:t("Read the current status before planning a build.")},{label:t("Native CAD checks"),phase:t("BEFORE FABRICATION"),check:t("Native ERC/DRC and a current schematic export are pending.")},{label:t("Firmware build"),phase:t("ESP32 / USB"),check:t("Compile and run the source on the intended device.")},{label:t("Power and ADC"),phase:t("BENCH VALIDATION"),check:t("Record supply behaviour and ADC response with known inputs.")},{label:t("Sensor interaction"),phase:t("SEPARATE TESTS"),check:t("EC source does not establish pH or radio operation.")},{label:t("Calibration"),phase:t("INDEPENDENT STANDARDS"),check:t("Keep reference values, temperature conditions and raw records together.")},{label:t("Physical validation"),phase:t("AFTER THE BENCH"),check:t("Enclosure, water exposure, radio and energy use need tests.")}];
const getEquipment=()=>[{name:t("Controller"),parts:t("XIAO ESP32S3"),note:t("ESP32 compilation and hardware execution are pending.")},{name:t("Planned sensor inputs"),parts:t("SEN0244 · DS18B20"),note:t("A TDS module for an experimental EC estimate, alongside temperature.")},{name:t("Bench acquisition"),parts:t("USB · JSONL · reference standards"),note:t("Prepare independent standards and a reference thermometer.")},{name:t("Physical system"),parts:t("Enclosure · power · radio"),note:t("Mechanical performance, energy use and radio operation are not verified.")}];
const getDrawings=()=>[{label:t('System architecture'),src:architectureUrl,alt:t('EC-revB system architecture, not an electrical schematic or a prototype photo'),caption:t('Design illustration · AquaNode · CC BY 4.0')}];

function stepFromHash(hash:string){
 const match=/^#step-(\d+)$/.exec(hash);
 const index=match?Number(match[1]):-1;
 return index>=0&&index<steps.length?index:null;
}

export default function BuildPage(){
 const locale=useLocale();
 const guide=getGuide(),equipment=getEquipment(),drawings=getDrawings();
 const {hash}=useLocation(),navigate=useNavigate();
 const [drawing]=useState(0),[openStep,setOpenStep]=useState<number|null>(()=>stepFromHash(hash)??0);
 const [anchorTarget,setAnchorTarget]=useState<{id:string}|null>(null);
 const guideSteps=useRef<HTMLDivElement>(null);
 const openedByHand=useRef<HTMLElement|null>(null);
 useLayoutEffect(()=>{
  const target=openedByHand.current;openedByHand.current=null;
  if(!target||openStep===null)return;
  let cancelled=false,frame=0;
  const cancel=()=>{cancelled=true;cancelAnimationFrame(frame)};
  const align=()=>{
   if(cancelled)return;
   const top=target.getBoundingClientRect().top;
   const boundary=(document.querySelector('.site-header')?.getBoundingClientRect().bottom??0)+24;
   if(top<boundary-2)window.scrollTo({top:scrollY+top-boundary,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  };
  frame=requestAnimationFrame(()=>{
   const transitions=guideSteps.current?.getAnimations({subtree:true}).filter(animation=>'transitionProperty' in animation&&animation.transitionProperty==='grid-template-rows')??[];
   Promise.allSettled(transitions.map(animation=>animation.finished)).then(()=>{frame=requestAnimationFrame(align)});
  });
  window.addEventListener('wheel',cancel,{passive:true});window.addEventListener('touchstart',cancel,{passive:true});
  return()=>{cancel();window.removeEventListener('wheel',cancel);window.removeEventListener('touchstart',cancel)};
 },[openStep]);
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
  openedByHand.current=openStep===index?null:document.getElementById(`step-${index}`);
  setOpenStep(current=>current===index?null:index);
 };
 const activeDrawing=drawings[drawing];
 return <div className="build-page">
  <header className="build-hero page-intro">
   <div className="build-section-top"><SectionLabel icon="tools">{t("BUILD / RESOURCES")}</SectionLabel><span>{t("THE ENGINEERING WORKBENCH / EC-revB")}</span></div>
   <div className="build-hero-layout">
    <div className="build-hero-copy"><span className="build-release"><i/> {t("OPEN ENGINEERING · EC-revB")}</span>
     <Heading as="h1">{t("Learn by")}<br/>{' '}{t("putting it")}<br/>{' '}<em>{t("together.")}</em></Heading>
     <p>{t("Use this workbench to review the modules, follow the validation stages and keep a clear test record. Start with the architecture, then choose a stage below.")}</p>
     <div className="build-hero-actions"><a className="arrow-link" href="#assembly-guide" onClick={event=>navigateToAnchor(event,'assembly-guide')}>{t("Explore the validation plan")} <FlexibleArrow direction="down"/></a><a className="build-files-link arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Get the public materials")} <FlexibleArrow direction="down"/></a></div>
    </div>
    <div className="build-drawing-panel">
     <div className="build-drawing-top"><SectionLabel as="span" icon="drawing">{t("01 / ON THE DRAWING BOARD")}</SectionLabel><span>{revision}</span></div>
     <RevisionNotice/>
     <figure id="build-drawing" aria-live="polite"><ArchitectureImage alt={activeDrawing.alt} width="1100" height="620"/><figcaption>{activeDrawing.caption}<span>{t("DESIGN OVERVIEW / NOT A SCHEMATIC")}</span></figcaption></figure>
    </div>
   </div>
   <dl className="build-hero-facts"><div><dt>{t('REVISION')}</dt><dd className="revision-value">{revision}</dd></div><div><dt>{t('Bench acquisition')}</dt><dd>USB <span>/ JSONL</span></dd></div><div><dt>{t('Release stage')}</dt><dd>{t('Engineering review')}<span>{t('Not fabrication ready')}</span></dd></div></dl>
  </header>

  <section className="build-status" aria-labelledby="build-workbench-title"><span className="build-status-mark" aria-hidden="true"><FlexibleArrow direction="up-right"/></span><div><Heading as="h2" id="build-workbench-title">{t("How to use the workbench.")}</Heading><p>{t("The diagram explains the system. The seven-stage plan organises the work ahead. Download the public overview and source register to keep the revision context with your notes.")}</p></div><Link className="arrow-link" to="/journal">{t("Current progress")} <FlexibleArrow direction="up-right"/></Link></section>

  <section className="build-equipment build-section" aria-labelledby="build-equipment-title">
   <div className="build-section-top"><SectionLabel icon="assembly">{t("01 / PREPARE THE BENCH")}</SectionLabel><span>{t("PARTS. TOOLS. A PLACE TO START.")}</span></div>
   <div className="build-equipment-layout"><div className="build-equipment-intro"><Heading as="h2" id="build-equipment-title">{t("A clear setup. A better start.")}</Heading><p>{t("Prepare the modules and reference instruments listed below. Check part identity and compatibility against the full engineering package before any wiring or bench work.")}</p><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Read the public overview")} <FlexibleArrow direction="down"/></a></div>
    <ol className="build-equipment-list">{equipment.map((item,index)=><li key={item.name}><SectionLabel as="span" icon={(["circuit","probe","notebook","buoy"] as SectionTheme[])[index]}>{item.name}</SectionLabel><Heading as="h3" className="build-equipment-parts">{item.parts}</Heading><p>{item.note}</p></li>)}</ol>
   </div>
  </section>

  <section className="build-guide build-section" id="assembly-guide" aria-labelledby="build-guide-title">
   <div className="build-section-top"><SectionLabel icon="check">{t("02 / FROM DESIGN TO TEST")}</SectionLabel><span>{t("SEVEN STEPS. ONE CAREFUL SEQUENCE.")}</span></div>
   <div className="build-guide-heading"><Heading as="h2" id="build-guide-title">{t("From source files")}<br/>{t("to a test record.")}</Heading><p>{t("Start with the release blockers, then follow firmware, power, calibration and physical validation. These are planned checks, not completed experiments.")}</p></div>
   <div className="build-guide-layout">
    <aside className="build-guide-nav"><span className="build-nav-label">{t("VALIDATION PLAN")}</span><nav aria-label={t("Validation stages")}>{guide.map((item,index)=><a key={item.label} href={`#step-${index}`} aria-current={openStep===index?'step':undefined} onClick={event=>navigateToAnchor(event,`step-${index}`)}><span>0{index+1}</span><span className="build-nav-copy">{item.label}</span><FlexibleArrow direction="up-right"/></a>)}</nav><p>{t("Based on the current revB web handoff. This overview does not replace the full engineering instructions or qualify the design for fabrication.")}</p><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Source materials")} <FlexibleArrow direction="down"/></a></aside>
    <div className="build-guide-steps" ref={guideSteps}>{steps.map(([title,text],index)=><article className="build-step" id={`step-${index}`} key={title} data-open={openStep===index}><h3 className="build-step-heading"><button type="button" id={`build-step-toggle-${index}`} aria-expanded={openStep===index} aria-controls={`build-step-content-${index}`} onClick={()=>toggleStep(index)}><span className="build-step-number">0{index+1}</span><Heading as="span" className="build-step-title">{title}</Heading><FlexibleArrow direction="up-right"/></button></h3><div className="build-step-reveal" aria-hidden={openStep!==index} inert={openStep!==index}><div className="build-step-clip"><div className="build-step-content" id={`build-step-content-${index}`} role="region" aria-labelledby={`build-step-toggle-${index}`}><span className="build-step-phase">{guide[index].phase}</span><p>{text}</p><div className="build-checkpoint"><span>{t("BEFORE MOVING ON")}</span><p>{guide[index].check}</p></div></div></div></div></article>)}</div>
   </div>
  </section>

  <section className="build-downloads build-section" id="downloads" aria-labelledby="build-downloads-title">
   <div className="build-section-top"><SectionLabel icon="resources">{t("03 / PUBLIC DOCUMENTATION")}</SectionLabel><span>{t("DOCUMENTATION / EC-revB")}</span></div>
   <div className="build-download-layout"><div><Heading as="h2" id="build-downloads-title">{t("Off the page.")}<br/><em>{t("Onto the bench.")}</em></Heading><p>{t("Download the current overview, machine-readable status, evidence register and architecture illustration. The original package keeps its engineering and firmware sources separate from these public web files.")}</p><span className="build-download-count">{resources.length} {t("PUBLIC FILES / EC-revB")}</span></div><div className="build-download-list">{resources.map(resource=><DownloadLink key={resource.url} href={locale==='ru'&&resource.urlRu?resource.urlRu:locale==='zh-TW'&&resource.urlZh?resource.urlZh:resource.url} label={resource.name} format={resource.url.split('.').pop()!.toUpperCase()} detail={resource.detail} className="resource-download"/>)}<p className="build-download-note">{t("Bench firmware source exists in the engineering package but has not been compiled for ESP32. Firmware and protocol implementation are not included in these web downloads.")}</p></div></div>
  </section>

  <section className="build-next build-section"><div><SectionLabel icon="notebook">{t("THE NEXT CHAPTER")}</SectionLabel><Heading as="h2">{t("The drawing is a start.")}<br/>{t("The evidence comes next.")}</Heading></div><div><p>{t("Follow the checks, revisions and open questions as the design moves towards physical validation.")}</p><Link className="arrow-link" to="/journal">{t("Follow development")} <FlexibleArrow direction="up-right"/></Link></div></section>
 </div>;
}
