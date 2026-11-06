import RelatedLinks from '../../components/ui/RelatedLinks';
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
const getGuide=()=>[{label:t("Design review"),phase:t("REVISION SCOPE")},{label:t("Native CAD checks"),phase:t("BEFORE FABRICATION")},{label:t("Firmware build"),phase:t("ESP32 / USB")},{label:t("Power and ADC"),phase:t("BENCH VALIDATION")},{label:t("Sensor interaction"),phase:t("SEPARATE TESTS")},{label:t("Calibration"),phase:t("INDEPENDENT STANDARDS")},{label:t("Physical validation"),phase:t("AFTER THE BENCH")}];
const getEquipment=()=>[{name:t("Controller"),parts:t("XIAO ESP32S3"),note:t("ESP32 compilation and hardware execution are pending.")},{name:t('revC modules'),parts:t("SEN0244 · DS18B20 · SEN0169-V2"),note:t("SEN0244 EC and DS18B20 temperature, plus SEN0169-V2 pH through DFR0504 and ADS1115.")},{name:t("Bench acquisition"),parts:t("USB · JSONL · reference standards"),note:t("Prepare independent standards and a reference thermometer.")},{name:t("Separate pH bench power"),parts:t("DFR0504 · 5 V"),note:t("A regulated 5 V bench supply powers the pH isolator. Battery-powered pH requires a new converter choice, power checks and an updated energy budget.")}];
const getDrawings=()=>[{label:t('System architecture'),src:architectureUrl,alt:t("EC+pH-revC system architecture, not an electrical schematic or a prototype photo"),caption:t('Design illustration · AquaNode · CC BY 4.0')}];

function stepFromHash(hash:string){
 const match=/^#step-(\d+)$/.exec(hash);
 const index=match?Number(match[1]):-1;
 return index>=0&&index<steps.length?index:null;
}

export default function BuildPage(){
 const locale=useLocale();
 const guide=getGuide(),equipment=getEquipment(),drawings=getDrawings();
 const {hash}=useLocation(),navigate=useNavigate();
 const [documentRevision,setDocumentRevision]=useState('revc');
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
 const documents=documentRevision==='revc'?resources:[
  {name:t('Assembly drawing'),detail:'R0.3 · SVG',url:'/resources/Assembly.svg',urlRu:undefined,urlZh:undefined},
  {name:t('Bill of materials'),detail:'R0.3 · Markdown · RU',url:'/resources/BOM_ru.md',urlRu:undefined,urlZh:undefined},
  {name:t('Attribution & licences'),detail:'R0.3 · Markdown',url:'/resources/ATTRIBUTION.md',urlRu:undefined,urlZh:undefined},
 ];
 return <div className="build-page">
  <header className="build-hero page-intro">
   <div className="build-section-top"><SectionLabel icon="tools">{t("BUILD / RESOURCES")}</SectionLabel><span>{t("THE ENGINEERING WORKBENCH / EC+pH-revC")}</span></div>
   <div className="build-hero-layout">
    <div className="build-hero-copy"><span className="build-release"><i/> {t("OPEN ENGINEERING · EC+pH-revC")}</span>
     <Heading as="h1">{t('Build & documentation')}</Heading>
     <p>{t('Choose a device revision to open its available overview, component documents and instructions.')}</p>
     <div className="build-hero-actions"><a className="arrow-link" href="#assembly-guide" onClick={event=>navigateToAnchor(event,'assembly-guide')}>{t('revC development tasks')} <FlexibleArrow direction="down"/></a><a className="build-files-link arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t('Open documents')} <FlexibleArrow direction="down"/></a></div>
    </div>
    <div className="build-drawing-panel">
     <div className="build-drawing-top"><SectionLabel as="span" icon="drawing">{t("01 / ON THE DRAWING BOARD")}</SectionLabel><span>{revision}</span></div>
     <figure id="build-drawing" aria-live="polite"><ArchitectureImage alt={activeDrawing.alt} width="1100" height="620"/><figcaption>{activeDrawing.caption}<span>{t("DESIGN OVERVIEW / NOT A SCHEMATIC")}</span></figcaption></figure>
    </div>
   </div>
   <dl className="build-hero-facts"><div><dt>{t('REVISION')}</dt><dd className="revision-value">{revision}</dd></div><div><dt>{t('Bench acquisition')}</dt><dd>USB <span>/ JSONL</span></dd></div><div><dt>{t('Release stage')}</dt><dd>{t('Engineering review')}<span>{t('Not fabrication ready')}</span></dd></div></dl>
  </header>

  <section className="build-equipment build-section" aria-labelledby="build-equipment-title">
   <div className="build-section-top"><SectionLabel icon="assembly">{t('Components and instruments')}</SectionLabel><span>{t('revC modules')}</span></div>
   <div className="build-equipment-layout"><div className="build-equipment-intro"><SectionLabel icon="tools">{t('Components and instruments')}</SectionLabel><Heading as="h2" id="build-equipment-title">{t('Prepare the revC bench')}</Heading><p>{t('Choose modules, check their connections and prepare reference instruments. The four groups on the right form the revC bench setup.')}</p><div className="bench-chain" aria-label={t('Controller → sensors → acquisition → power')}><span>XIAO</span><i>→</i><span>EC / pH / °C</span><i>→</i><span>USB</span></div><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Read the public overview")} <FlexibleArrow direction="down"/></a></div>
    <ol className="build-equipment-list">{equipment.map((item,index)=><li key={item.name}><SectionLabel as="span" icon={(["circuit","probe","notebook","buoy"] as SectionTheme[])[index]}>{item.name}</SectionLabel><Heading as="h3" className="build-equipment-parts">{item.parts}</Heading><p>{item.note}</p></li>)}</ol>
   </div>
  </section>

  <section className="build-guide build-section" id="assembly-guide" aria-labelledby="build-guide-title">
   <div className="build-section-top"><SectionLabel icon="check">{t('revC development tasks')}</SectionLabel><span>{"R0.3-EC-pH-revC"}</span></div>
   <RevisionNotice/><div className="build-guide-heading"><Heading as="h2" id="build-guide-title">{t('Developing revC')}</Heading><p>{t('This is the engineering plan for revC, not a ready assembly lesson. Follow the full instructions for the chosen revision with an experienced mentor.')}</p></div>
   <div className="build-guide-layout">
    <aside className="build-guide-nav"><span className="build-nav-label">{t("VALIDATION PLAN")}</span><nav aria-label={t("Validation stages")}>{guide.map((item,index)=><a key={item.label} href={`#step-${index}`} aria-current={openStep===index?'step':undefined} onClick={event=>navigateToAnchor(event,`step-${index}`)}><span>0{index+1}</span><span className="build-nav-copy">{item.label}</span><FlexibleArrow direction="up-right"/></a>)}</nav><p>{t("Based on the revC engineering package dated 2 November 2026. This overview does not replace its complete instructions or qualify the design for fabrication.")}</p><a className="arrow-link" href="#downloads" onClick={event=>navigateToAnchor(event,'downloads')}>{t("Source materials")} <FlexibleArrow direction="down"/></a></aside>
    <div className="build-guide-steps" ref={guideSteps}>{steps.map(([title,text],index)=><article className="build-step" id={`step-${index}`} key={title} data-open={openStep===index}><h3 className="build-step-heading"><button type="button" id={`build-step-toggle-${index}`} aria-expanded={openStep===index} aria-controls={`build-step-content-${index}`} onClick={()=>toggleStep(index)}><span className="build-step-number">0{index+1}</span><Heading as="span" className="build-step-title">{title}</Heading><FlexibleArrow direction="up-right"/></button></h3><div className="build-step-reveal" aria-hidden={openStep!==index} inert={openStep!==index}><div className="build-step-clip"><div className="build-step-content" id={`build-step-content-${index}`} role="region" aria-labelledby={`build-step-toggle-${index}`}><span className="build-step-phase">{guide[index].phase}</span><p>{text}</p></div></div></div></article>)}</div>
   </div>
  </section>

  <section className="build-downloads build-section" id="downloads" aria-labelledby="build-downloads-title">
   <div className="build-section-top"><SectionLabel icon="resources">{t('Documents by revision')}</SectionLabel><span>{t('Published materials')}</span></div>
   <div className="build-download-layout"><div><Heading as="h2" id="build-downloads-title">{t('Download documents')}</Heading><p>{t(documentRevision==='revc'?'These five files describe revC: overview, status, checks, architecture and attribution. Firmware and fabrication files are not included.':'R0.3 archive: assembly drawing, bill of materials and attribution. These documents describe the earlier board.')}</p><span className="build-download-count">{documents.length} · {documentRevision==='revc'?'EC+pH-revC':'R0.3'}</span></div><div className="build-download-list"><label className="build-document-picker">{t('Documents by revision')}<select value={documentRevision} onChange={event=>setDocumentRevision(event.target.value)}><option value="revc">{t('Current revC · development')}</option><option value="r03">{t('R0.3 · earlier board')}</option></select></label>{documents.map(resource=><DownloadLink key={resource.url} href={locale==='ru'&&resource.urlRu?resource.urlRu:locale==='zh-TW'&&resource.urlZh?resource.urlZh:resource.url} label={resource.name} format={resource.url.split('.').pop()!.toUpperCase()} detail={resource.detail} className="resource-download"/>)}{documentRevision==='revc'&&<p className="build-download-note">{t('Development revision; fabrication files have not been released.')}</p>}</div></div>
  </section>

  <RelatedLinks items={[{to:'/journal',label:'Development journal',detail:'Checks, revisions and results'},{to:'/technology',label:'How the buoy works',detail:'Device versions'}]}/>
 </div>;
}
