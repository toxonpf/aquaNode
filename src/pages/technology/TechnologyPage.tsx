import {useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {t} from '../../features/i18n/i18n';
import {revision} from '../../data/project';
import SectionLabel from '../../components/ui/SectionLabel';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import RevisionNotice from '../../components/ui/RevisionNotice';
import CircuitExplorer from './CircuitExplorer';
import DrawingSequence from './DrawingSequence';

const getPaths=()=>[
 {title:t('Coordinate'),component:'XIAO ESP32S3',label:t('THE CONTROLLER'),copy:t("XIAO ESP32S3 is the planned controller. The bench source organises sensor acquisition, calibration handling and USB records."),detail:t("Build for the intended ESP32 target, then check USB output and ADC behaviour on the actual board.")},
 {title:t('Estimate EC'),component:'SEN0244',label:t('EXPERIMENTAL CONDUCTIVITY'),copy:t('SEN0244 is a TDS module being investigated for a budget EC estimate in freshwater. It is not a salinity meter or a seawater sensor.'),detail:t('Validate the estimate against independent standards. No measured AquaNode accuracy is available.')},
 {title:t('Read temperature'),component:'DS18B20',label:t('TEMPERATURE INPUT'),copy:t('DS18B20 supplies the planned temperature input. Its measurement and the EC compensation model must be checked together on the bench.'),detail:t('Compare with a reference thermometer across the actual test conditions; software model checks do not validate the sensor.')},
 {title:t('Record'),component:'USB / JSONL',label:t('BENCH ACQUISITION'),copy:t('Bench firmware source prepares USB logging. Radio and mesh operation are not demonstrated by this revision.'),detail:t('Keep raw readings, references and test conditions together. Publish results only after the corresponding hardware checks.')},
];
export default function TechnologyPage({renderViewer}:{renderViewer:()=>ReactNode}){
 const [active,setActive]=useState(0),paths=getPaths();
 return <div className="technology-page">
  <header className="page-intro tech-hero">
   <div className="tech-section-top"><SectionLabel icon="buoy">{t('THE BUOY / TECHNOLOGY')}</SectionLabel><span className="tech-hero-status"><i aria-hidden="true"/>{t("CONCEPT MODEL")}</span></div>
   <div className="tech-hero-layout"><Heading as="h1">{t('Inside the buoy.')}</Heading><div className="tech-hero-copy"><p>{t('Explore a freshwater design: experimental conductivity with SEN0244, temperature with DS18B20 and a USB bench workflow. Hardware performance is still to be established.')}</p><RevisionNotice/><a className="arrow-link" href="#tech-carrier">{t('Follow the connections')}<FlexibleArrow direction="down"/></a></div>
   <dl className="tech-hero-specs"><div><dt>{t('PLANNED INPUTS')}</dt><dd>EC <span>+</span> °C</dd></div><div><dt>{t('REVISION')}</dt><dd className="revision-value">{revision}</dd></div><div><dt>{t('BENCH OUTPUT')}</dt><dd>USB <span>/ JSONL</span></dd></div></dl>
   <div className="tech-model"><div className="tech-model-top"><SectionLabel as="span" icon="compass">{t('01 / EXPLORE THE DEVICE')}</SectionLabel><span>{t('CONCEPT MODEL')}</span></div>{renderViewer()}</div></div>
   <div className="tech-hero-foot"><span>{t('FLOAT · PROTECT · OBSERVE')}</span><p>{t('The 3D model is illustrative. The current architecture below describes a design, not a tested physical assembly.')}</p></div>
  </header>
  <section className="tech-section tech-carrier" id="tech-carrier" aria-labelledby="tech-carrier-title">
   <div className="tech-section-top"><SectionLabel icon="layers">{t('01 / THE CURRENT DESIGN')}</SectionLabel><span>{revision}</span></div>
   <div className="tech-carrier-layout"><div><Heading as="h2" id="tech-carrier-title">{t('Prepared for the bench.')}</Heading><p>{t("The design brings an EC estimate and temperature input to a USB bench workflow. The table identifies the planned modules and the level of checks completed so far.")}</p><p className="tech-scope">{t("The planned EC estimate is for freshwater. It cannot identify individual salts or establish drinking-water safety. AquaNode accuracy and battery life still require measurements.")}</p></div>
   <dl className="specs">{[[t('Controller'),'XIAO ESP32S3'],[t('Experimental EC channel'),'DFRobot SEN0244'],[t('Temperature input'),'DS18B20'],[t('Bench acquisition'),'USB / JSONL'],[t('Software checks'),t('15 synthetic model tests passed')],[t('Hardware status'),t('Validation pending')]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
  </section>
  <section className="tech-section tech-drawings" aria-labelledby="tech-drawings-title"><div className="tech-section-top"><SectionLabel icon="blueprint">{t('02 / ON THE DRAWING BOARD')}</SectionLabel><span>{t('DESIGN OVERVIEW / NOT AN ELECTRICAL SCHEMATIC')}</span></div><DrawingSequence/></section>
  <CircuitExplorer paths={paths} active={active} onChange={setActive}/>
  <section className="tech-section tech-next"><div><SectionLabel icon="assembly">{t('FROM DRAWING TO WORKBENCH')}</SectionLabel><Heading as="h2">{t('Follow the design.')}<br/><em>{t('Check the real thing.')}</em></Heading></div><div><p>{t('Follow the planned checks, the revision status and the permitted public materials.')}</p><Link className="arrow-link" to="/build">{t('Build & resources')}<FlexibleArrow direction="up-right"/></Link></div></section>
 </div>;
}
