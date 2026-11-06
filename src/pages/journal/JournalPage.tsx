import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {updates} from '../../data/content';

const getChapters=()=>[
  {id:'journal-now',label:t('Project results'),note:t("CURRENT ENGINEERING REVISION")},
  {id:'journal-record',label:t('revC code and project-file checks'),note:t("DECISIONS & DESIGN CHECKS")},
  {id:'journal-next',label:t('Before revC hardware testing'),note:t("QUESTIONS FOR THE BENCH")},
];
const getRecords=()=>[
 {update:updates[1],id:'revc-checks',date:"2026-11-02",dateLabel:t("02 NOV 2026"),label:t('SYNTHETIC / STATIC CHECKS'),source:t("EC+pH-revC evidence register"),metrics:[['18',t('Python model / exporter tests')],['166',t('Schematic pins compared')],['139',t('PCB pads compared')]],detail:t("The report separates 15 EC-model tests and 3 pH-exporter tests from source agreement checks of 166 schematic pins and 139 PCB pads. The 15 C++ pH assertions were prepared but not run. None validates hardware."),question:t('Compile the firmware, run native ERC/DRC and collect independent bench measurements.'),to:'/technology',link:t('Explore the current design')},
 {update:updates[2],id:'revc-blockers',date:"2026-11-02",dateLabel:t("02 NOV 2026"),label:t('REVISION LIMITS'),source:t("EC+pH-revC status · 2 November 2026"),metrics:[['—',t('ESP32 compilation')],['—',t('Native ERC / DRC')]],detail:t("The ESP32 build stopped during a dependency download, so compilation is not confirmed. Native ERC/DRC and hardware tests were not run. A simulation profile is separate from these engineering results."),question:t("Validate the pH supply and complete calibration chain, then compare EC and pH in the same water. Battery-powered pH, enclosure performance and radio need their own test records."),to:'/build#assembly-guide',link:t('Follow the validation plan')},
 {update:updates[3],id:'historical-r03',date:'2026-10-20',dateLabel:t('20 OCT 2026'),label:t("HISTORICAL BASELINE / NOT revC"),source:t('R0.3 baseline verification · archived'),metrics:[['0',t('Earlier ERC findings')],['0',t('Earlier DRC findings')],['130',t('Earlier named-pad comparison')]],detail:t("These results belong to the historical R0.3 baseline. They are retained as project history and must not be applied to EC+pH-revC."),question:t('The current revision still needs its own native checks and physical evidence.'),to:'/build#downloads',link:t('Read the current status')},
];
const getNextChecks=()=>[
  {title:t("Does it fit?"),label:t("MECHANICAL"),copy:t("Check the real module stack, cable access and enclosure sealing. Record the parts and assembly that were tested.")},
  {title:t("Does it behave?"),label:t("ELECTRICAL"),copy:t("Record startup, power transitions and sleep current under known conditions. Keep failures alongside successful checks.")},
  {title:t("Can we trust the reading?"),label:t("MEASUREMENT"),copy:t("Keep raw readings, calibration references and uncertainty together. Make the next result traceable to its setup.")},
  {title:t('Can a classroom repeat it?'),label:t('LEARNING PILOT'),copy:t('Document the guidance, assembly task and observation record so another group of students can repeat the activity and discuss its findings.')},
];

function RecordEntry({record,index}:{record:ReturnType<typeof getRecords>[number];index:number}){
  const [open,setOpen]=useState(index===0);
  const contentId=`journal-entry-${record.id}`;
  return <article id={record.id} className="journal-entry" data-open={open}>
    <div className="journal-entry-meta"><time dateTime={record.date}>{record.dateLabel}</time><span>{record.label}</span><span className="journal-record-number">{t("ENTRY / 0")}{index+1}</span></div>
    <Heading as="h3">{record.update.title}</Heading>
    <p className="journal-entry-summary">{record.update.body}</p>
    <button className="journal-entry-toggle" type="button" aria-expanded={open} aria-controls={contentId} aria-label={t(open?'Close entry: {title}':'Read entry: {title}',{title:record.update.title})} onClick={()=>setOpen(value=>!value)}><span>{open?t("Close the entry"):t("Read the entry")}</span><FlexibleArrow direction="up-right"/></button>
    <div className="journal-entry-reveal" id={contentId} aria-hidden={!open} inert={!open}><div className="journal-entry-clip"><div className="journal-entry-detail">
      <dl className="journal-entry-metrics">{record.metrics.map(([value,label])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="journal-entry-context"><div><span>{t('RESULT')}</span><p>{record.detail}</p></div><div><span>{t('REMAINING WORK')}</span><p>{record.question}</p></div></div>
      <div className="journal-entry-source"><span>{t("SOURCE RECORD")}<br/><b>{record.source}</b></span><Link className="arrow-link" to={record.to}>{record.link}<FlexibleArrow direction="up-right"/></Link></div>
    </div></div></div>
  </article>;
}

export default function JournalPage(){
  const chapters=getChapters(),records=getRecords(),nextChecks=getNextChecks();
  const page=useRef<HTMLDivElement>(null);
  const [active,setActive]=useState(chapters[0].id);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);
    },{rootMargin:'-18% 0px -62% 0px',threshold:0});
    page.current?.querySelectorAll<HTMLElement>('[data-journal-chapter]').forEach(section=>observer.observe(section));
    return()=>observer.disconnect();
  },[]);
  return <div className="journal-page" ref={page}>
    <header className="page-intro journal-hero dark">
      <div className="journal-section-top"><SectionLabel icon="journal">{t("PROJECT JOURNAL")}</SectionLabel><span>{t("A RECORD OF THE WORK / AQUANODE")}</span></div>
      <div className="journal-hero-layout"><div className="journal-hero-copy"><Heading as="h1">{t('Development & results')}</Heading><p>{t('Measurements, cooperation and device revisions.')}</p><a className="arrow-link" href="#journal-now">{t("Follow the work")}<FlexibleArrow direction="down"/></a></div>
      <aside className="journal-latest" aria-label={t('Latest engineering records')}><SectionLabel icon="notebook">{t('Latest engineering records')}</SectionLabel><a href="#journal-record"><time dateTime="2026-11-02">02.11.2026</time><span><strong>EC+pH-revC</strong><small>{t('revC checks')}</small></span><FlexibleArrow direction="up-right"/></a><a href="#historical-r03"><time dateTime="2026-10-20">20.10.2026</time><span><strong>R0.3</strong><small>{t('R0.3 archive')}</small></span><FlexibleArrow direction="up-right"/></a><div className="journal-latest-stats"><span><b>18</b> Python</span><span><b>166</b> {t('Schematic pins compared')}</span><span><b>139</b> {t('PCB pads compared')}</span></div></aside></div>
    </header>
    <div className="journal-body journal"><aside className="journal-index"><span>{t("IN THIS JOURNAL")}</span><nav aria-label={t("Journal sections")}>{chapters.map((chapter,index)=><a key={chapter.id} href={`#${chapter.id}`} aria-current={active===chapter.id?'location':undefined}><span>0{index+1}</span>{chapter.label}<i aria-hidden="true"/></a>)}</nav></aside>
    <div className="journal-content">
      <section className="journal-stage journal-now" id="journal-now" data-journal-chapter aria-labelledby="journal-now-title"><SectionLabel icon="probe">{t('Project update · date not supplied')}</SectionLabel><Heading as="h2" id="journal-now-title">{t('Existing measurements and partner shipments')}</Heading><p>{t('The team reports measurements from checked sensors and buoys sent to partners. Source measurement files, device identifiers and shipment dates have not yet been supplied for publication.')}</p><Link className="arrow-link" to="/map">{t('Open the buoy map')}<FlexibleArrow direction="up-right"/></Link></section>
      <section className="journal-stage journal-record" id="journal-record" data-journal-chapter aria-labelledby="journal-record-title"><div className="journal-section-top"><SectionLabel icon="notebook">{t("02 / THE RECORD")}</SectionLabel><span>{t("ENGINEERING / EC+pH-revC + HISTORY")}</span></div><div className="journal-stage-heading"><Heading as="h2" id="journal-record-title">{t('Developing revision R0.3-EC-pH-revC')}</Heading><p>{t('revC package · 2 November 2026')}</p></div>{records.map((record,index)=><RecordEntry key={record.id} record={record} index={index}/>)}</section>

      <section className="journal-stage journal-next" id="journal-next" data-journal-chapter aria-labelledby="journal-next-title"><div className="journal-section-top"><SectionLabel icon="future">{t("03 / WHAT COMES NEXT")}</SectionLabel><span>{t("TEST RECORDS PENDING")}</span></div><div className="journal-stage-heading"><Heading as="h2" id="journal-next-title">{t('Before revC hardware testing')}</Heading><p>{t('Complete the ESP32 build and native ERC/DRC, then check power, both ADC paths, calibration and joint EC+pH operation.')}</p></div><div className="journal-next-checks">{nextChecks.map((check,index)=><div key={check.label}><SectionLabel as="span" icon={(['assembly','battery','calibration','learning'] as const)[index]}>{check.label}</SectionLabel><Heading as="h3">{check.title}</Heading><p>{check.copy}</p></div>)}</div><div className="journal-stage-footer"><span>{t("CHECK. RECORD. SHARE. REPEAT.")}</span><Link className="arrow-link" to="/build#assembly-guide">{t("Take it to the workbench")}<FlexibleArrow direction="up-right"/></Link></div></section>
    </div></div>
  </div>;
}
