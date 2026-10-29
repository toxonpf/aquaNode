import ArchitectureImage from '../../components/ui/ArchitectureImage';
import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import Heading from '../../components/ui/Heading';
import ArrowLink from '../../components/ui/ArrowLink';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {ExternalLink} from '../../components/ui/ActionLinks';
import {awardUrl} from '../../data/content';
import Viewer from '../../features/buoy/Viewer';
import OceanStory from '../../features/ocean/OceanStory';
import {MeetNode,FutureNetwork} from './HomeFeatures';
import RevisionNotice from '../../components/ui/RevisionNotice';
import {architectureUrl} from '../../data/project';

function Flow(){
 const steps=[
  [t('Build'),t('Assemble and calibrate the instrument with guidance. Learn what each connection does.')],
  [t('Deploy'),t('Choose an observation site, check the instrument and record how and where it is placed.')],
  [t('Measure'),t('Collect readings from real water. Keep their place, time and calibration context together.')],
  [t('Understand'),t('Compare observations and investigate unusual readings before drawing a conclusion.')],
  [t('Act'),t('Discuss findings, ask the next question and share a documented concern where appropriate.')],
 ];
 return <div className="flow">{steps.map(([title,description],index)=><div key={index}><span>0{index+1} —</span><FlexibleArrow direction="up-right"/><Heading as="h3">{title}</Heading><p>{description}</p></div>)}</div>;
}
function Status(){return <div className="status-grid">
 <article className="status-current"><div className="status-top"><span className="badge"><span className="tiny-dot"/> {t("Engineering development")}</span><span className="status-number">01</span></div><Heading as="h3">{t("A design to test.")}</Heading><p>{t("R0.3-EC-revB explores an experimental conductivity estimate with SEN0244 and temperature sensing with DS18B20. Hardware validation is pending.")}</p><span className="status-foot">{t("FRESHWATER / EC ESTIMATE / TEMPERATURE")}</span></article>
 <article><div className="status-top"><span className="badge muted">{t("Software checks")}</span><span className="status-number">02</span></div><Heading as="h3">{t("Models, not measurements.")}</Heading><p>{t("Fifteen synthetic model tests passed. Static cross-file checks compared 155 contacts. These checks do not establish sensor accuracy or hardware operation.")}</p><span className="status-foot">{t("SYNTHETIC INPUTS / STATIC REVIEW")}</span></article>
 <article><div className="status-top"><span className="badge muted">{t("Next: bench validation")}</span><span className="status-number">03</span></div><Heading as="h3">{t("Build. Check. Record.")}</Heading><p>{t("Compile the ESP32 firmware, run native ERC/DRC and test independent reference standards. School participation is a future goal, after the design is validated.")}</p><span className="status-foot">{t("COMPILE / TEST / DOCUMENT")}</span></article>
 </div>}
export default function HomePage(){return <>
  <OceanStory/>
  <div className="award"><span className="award-mark" aria-hidden="true">✳</span><p>Youth Innovation Challenge 2026 <b>{t("Winner")}</b></p><ExternalLink href={awardUrl} inline>{t("A small team. A recognised idea.")}</ExternalLink></div>
  <section id="progress" className="section progress-section"><div className="section-heading"><div><SectionLabel icon="progress">{t("01 / THE PROJECT TODAY")}</SectionLabel><Heading as="h2">{t("From design to evidence.")}<br/>{t("A new way to learn.")}</Heading></div><div className="heading-aside"><p>{t("An affordable educational buoy for freshwater: prepare the instrument, validate its readings and turn the process into a learning activity.")}</p><ArrowLink to="/journal">{t("Follow our development")}</ArrowLink></div></div><RevisionNotice/><Status/></section>
  <section id="why" className="section reason-section"><div className="reason-visual" aria-hidden="true"><div className="water-line water-line-1"/><div className="water-line water-line-2"/><div className="water-line water-line-3"/><span className="reason-plus">+</span><span className="reason-word">{t("Look closer.")}</span><span className="reason-caption">{t("A CHANGE BEGINS WITH A QUESTION.")}</span></div><div><SectionLabel icon="waves">{t("02 / WHY WATER?")}</SectionLabel><Heading as="h2">{t("Water is changing.")}<br/>{t("Let students measure it.")}</Heading><p className="lead">{t("Climate change and human activity affect local water. Important changes can happen before we notice them.")}</p><p>{t("AquaNode connects two needs: local freshwater observations and hands-on learning. The goal is for students to build hardware, understand readings and investigate the environment beyond their classroom.")}</p><ArrowLink to="/about">{t("The idea behind AquaNode")}</ArrowLink></div></section>
  <MeetNode renderViewer={(active,onChange)=><Viewer showcase activePart={active} onPartChange={onChange}/>}/>
  <section className="section cycle-section"><div className="section-heading"><div><SectionLabel icon="cycle">{t("04 / THE OBSERVATION CYCLE")}</SectionLabel><Heading as="h2">{t("Build. Measure. Act.")}</Heading></div><div className="cycle-aside"><span className="cycle-mark" aria-hidden="true">↻</span><p>{t("The environment becomes the laboratory. Each observation connects practical engineering with a question about the water.")}</p></div></div><Flow/><div className="cycle-footer"><p className="note">{t("This is the learning goal. Hardware validation comes before classroom use and a field pilot.")}</p><p>{t("Calibration, place, time and a clear record make a reading useful for the next investigation.")}</p></div></section>
  <FutureNetwork/>
  <section className="section evidence-section"><div className="section-heading"><div><SectionLabel icon="blueprint">{t("06 / OPEN ENGINEERING")}</SectionLabel><Heading as="h2">{t("The work behind the water.")}</Heading></div><ArrowLink to="/build">{t("Build & resources")}</ArrowLink></div><div className="evidence"><figure><span className="figure-label">{t("ENGINEERING OVERVIEW / EC-revB")}</span><ArchitectureImage alt={t("Current EC-revB architecture illustration, not a prototype photograph")} loading="lazy"/><figcaption>{t("Design illustration · R0.3-EC-revB · Hardware validation pending")}</figcaption></figure><div><span className="badge muted">{t("On the workbench")}</span><Heading as="h3">{t("Made to be explored.")}<br/>{t("Documented as we go.")}</Heading><p>{t("The revB package includes editable design files, a component list, bench source code and a test plan. The public overview separates prepared materials from the hardware checks still ahead.")}</p><ArrowLink to="/build">{t("Open the engineering resources")}</ArrowLink><ArrowLink to="/journal">{t("Read the project journal")}</ArrowLink></div></div></section>
  <section className="team-invitation"><SectionLabel icon="people">{t("CURIOUS MINDS. A SHARED DIRECTION.")}</SectionLabel><Heading as="h2">{t("It starts with people.")}</Heading><ArrowLink to="/team">{t("Meet the AquaNode team")}</ArrowLink></section>
</>}
