import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {updates} from '../../data/content';
import JournalThread from './JournalThread';

const getChapters=()=>[
  {id:'journal-now',label:t("Where we are"),note:t("THE WORKING PROTOTYPE")},
  {id:'journal-record',label:t("The record"),note:t("DECISIONS & DESIGN CHECKS")},
  {id:'journal-next',label:t("What comes next"),note:t("QUESTIONS FOR THE BENCH")},
];
function ThreadLabel(){
  const [idea,evidence]=t('IDEA → EVIDENCE').split('→');
  return <span className="journal-thread-label">{idea.trim()}<FlexibleArrow/>{evidence.trim()}</span>;
}
const getRecords=()=>[
  {update:updates[1],id:'carrier-review',label:t("DESIGN VERIFICATION"),source:t("Verification_ru.md · R0.3 engineering package"),metrics:[['0',t("ERC findings")],['0',t("DRC findings")],['130',t("Named pads compared")]],detail:t("The schematic and PCB comparison found no mismatches. The release records these checks in KiCad 8.0.9."),question:t("The next evidence needs to come from the assembled board: module fit, power behaviour and calibrated readings."),to:'/technology',link:t("Explore the carrier")},
  {update:updates[2],id:'layout-revision',label:t("REVISION NOTES"),source:t("README_ru.md · R0.3 revision notes"),metrics:[[t("4 mm"),t("Access below the module")],['71',t("Ground stitching vias")]],detail:t("The revision makes room for the battery connections and groups the power components around a shorter switching path."),question:t("Mechanical clearance and routing choices still need to be checked with the actual modules, cables and loads."),to:'/build#step-1',link:t("Follow the assembly checks")},
];
const getNextChecks=()=>[
  {title:t("Does it fit?"),label:t("MECHANICAL"),copy:t("Check the real module stack, cable access and enclosure sealing. Record the parts and assembly that were tested.")},
  {title:t("Does it behave?"),label:t("ELECTRICAL"),copy:t("Record startup, power transitions and sleep current under known conditions. Keep failures alongside successful checks.")},
  {title:t("Can we trust the reading?"),label:t("MEASUREMENT"),copy:t("Keep raw readings, calibration references and uncertainty together. Make the next result traceable to its setup.")},
];

function RecordEntry({record,index}:{record:ReturnType<typeof getRecords>[number];index:number}){
  const [open,setOpen]=useState(index===0);
  const contentId=`journal-entry-${record.id}`;
  return <article className="journal-entry" data-open={open}>
    <div className="journal-entry-meta"><time dateTime="2026-10-20">{t("20 OCT 2026")}</time><span>{record.label}</span><span className="journal-record-number">{t("ENTRY / 0")}{index+1}</span></div>
    <Heading as="h3">{record.update.title}</Heading>
    <p className="journal-entry-summary">{record.update.body}</p>
    <button className="journal-entry-toggle" type="button" aria-expanded={open} aria-controls={contentId} aria-label={t(open?'Close entry: {title}':'Read entry: {title}',{title:record.update.title})} onClick={()=>setOpen(value=>!value)}><span>{open?t("Close the entry"):t("Read the entry")}</span><FlexibleArrow direction="up-right"/></button>
    <div className="journal-entry-reveal" id={contentId} aria-hidden={!open} inert={!open}><div className="journal-entry-clip"><div className="journal-entry-detail">
      <dl className="journal-entry-metrics">{record.metrics.map(([value,label])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="journal-entry-context"><div><span>{t("WHAT THE CHECK TELLS US")}</span><p>{record.detail}</p></div><div><span>{t("THE QUESTION THAT REMAINS")}</span><p>{record.question}</p></div></div>
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
      <div className="journal-hero-layout"><div className="journal-hero-copy"><Heading as="h1">{t("The work,")}<br/>{' '}<em>{t("as it stands.")}</em></Heading><p>{t("Progress leaves a record. Follow the decisions, the checks and the questions taking AquaNode from an idea to its next test.")}</p><a className="arrow-link" href="#journal-now">{t("Follow the work")}<FlexibleArrow direction="down"/></a></div>
      <aside className="journal-cover" aria-label={t("Inside the project journal")}><JournalThread active={chapters.findIndex(chapter=>chapter.id===active)}/><div className="journal-cover-meta"><span>{t("AQUANODE / OPEN JOURNAL")}</span><span>R0.3</span></div><div className="journal-cover-heading"><Heading as="h2">{t("A story")}<br/>{t("still being written.")}</Heading><span className="journal-cover-count" aria-hidden="true">03<small>{t("CHAPTERS")}</small></span></div><div className="journal-cover-contents"><nav aria-label={t("Explore the journal")}>{chapters.map((chapter,index)=><a className="journal-cover-link" key={chapter.id} href={`#${chapter.id}`}><span className="journal-cover-number">0{index+1}</span><span className="journal-cover-chapter"><b>{chapter.label}</b><small>{chapter.note}</small></span><FlexibleArrow direction="up-right"/></a>)}</nav></div><div className="journal-cover-foot"><span>{t("FOLLOW THE THREAD")}</span><ThreadLabel/></div></aside></div>
      <div className="journal-hero-foot"><span>{t("TEAM REPORTS · ENGINEERING NOTES · OPEN QUESTIONS")}</span><span>{t("DATED WHERE THE SOURCE IS DATED")}</span></div>
    </header>

    <div className="journal-body journal"><aside className="journal-index"><span>{t("IN THIS JOURNAL")}</span><nav aria-label={t("Journal sections")}>{chapters.map((chapter,index)=><a key={chapter.id} href={`#${chapter.id}`} aria-current={active===chapter.id?'location':undefined}><span>0{index+1}</span>{chapter.label}<i aria-hidden="true"/></a>)}</nav><div className="journal-index-note"><FlexibleArrow direction="down"/><p>{t("A record to return to.")}<br/>{t("A question to carry forward.")}</p></div></aside>
    <div className="journal-content">
      <section className="journal-stage journal-now" id="journal-now" data-journal-chapter aria-labelledby="journal-now-title"><div className="journal-section-top"><SectionLabel icon="probe">{t("01 / WHERE WE ARE")}</SectionLabel><span>{t("TEAM REPORT")}</span></div><div className="journal-stage-heading"><Heading as="h2" id="journal-now-title">{t("One node.")}<br/>{' '}<em>{t("A starting point.")}</em></Heading><p>{updates[0].body}</p></div><div className="journal-scope-note"><span>{t("READING THE RECORD")}</span><p>{t("The team-reported working buoy and the R0.3 carrier package are separate records. R0.3 describes a design awaiting physical validation.")}</p></div><div className="journal-stage-footer"><span>{t("FROM A WORKING IDEA")}</span><Link className="arrow-link" to="/technology">{t("Meet the instrument")}<FlexibleArrow direction="up-right"/></Link></div></section>

      <section className="journal-stage journal-record" id="journal-record" data-journal-chapter aria-labelledby="journal-record-title"><div className="journal-section-top"><SectionLabel icon="notebook">{t("02 / THE RECORD")}</SectionLabel><span>{t("ENGINEERING / R0.3")}</span></div><div className="journal-stage-heading"><Heading as="h2" id="journal-record-title">{t("Decisions, checks,")}<br/><em>{t("and what they mean.")}</em></Heading><p>{t("Open an entry to follow the evidence behind a design decision and the question it leaves for the workbench.")}</p></div>{records.map((record,index)=><RecordEntry key={record.id} record={record} index={index}/>)}</section>

      <section className="journal-stage journal-next" id="journal-next" data-journal-chapter aria-labelledby="journal-next-title"><div className="journal-section-top"><SectionLabel icon="future">{t("03 / WHAT COMES NEXT")}</SectionLabel><span>{t("TEST RECORDS PENDING")}</span></div><div className="journal-stage-heading"><Heading as="h2" id="journal-next-title">{t("Let the next entry")}<br/>{t("come from")} <em>{t("the bench.")}</em></Heading><p>{t("The next useful milestone is a reproducible test record: a setup, a method and results someone else can inspect.")}</p></div><div className="journal-next-checks">{nextChecks.map((check,index)=><div key={check.label}><SectionLabel as="span" icon={(['assembly','battery','calibration'] as const)[index]}>{check.label}</SectionLabel><Heading as="h3">{check.title}</Heading><p>{check.copy}</p></div>)}</div><div className="journal-stage-footer"><span>{t("CHECK. RECORD. SHARE. REPEAT.")}</span><Link className="arrow-link" to="/build#assembly-guide">{t("Take it to the workbench")}<FlexibleArrow direction="up-right"/></Link></div></section>
    </div></div>
  </div>;
}
