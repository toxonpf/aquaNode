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
 {title:t('Coordinate'),component:'XIAO ESP32S3',label:t('THE CONTROLLER'),copy:t("XIAO ESP32S3 coordinates EC, temperature and ADS1115 pH acquisition in the bench source. USB logging is implemented in source; the ESP32 build attempt did not complete."),detail:t("Build for the intended ESP32 target, then check USB output and ADC behaviour on the actual board.")},
 {title:t('Estimate EC'),component:'SEN0244',label:t('EXPERIMENTAL CONDUCTIVITY'),copy:t('SEN0244 is a TDS module being investigated for a budget EC estimate in freshwater. It is not a salinity meter or a seawater sensor.'),detail:t('Validate the estimate against independent standards. No measured AquaNode accuracy is available.')},
 {title:t('Read temperature'),component:'DS18B20',label:t('TEMPERATURE INPUT'),copy:t("DS18B20 supplies the temperature input for pH and EC. Check against a reference thermometer; numerical pH currently stays within the calibration temperature ±0.5 °C."),detail:t('Compare with a reference thermometer across the actual test conditions; software model checks do not validate the sensor.')},
 {title:t('Isolated pH'),component:'SEN0169-V2',label:t('ISOLATED pH CHANNEL'),copy:t('SEN0169-V2 uses DFR0504 isolation for both power and signal before ADS1115 acquisition. The pH path needs separate regulated bench power; a battery supply and energy budget are not yet complete.'),detail:t('Calibrate the whole pH chain, then compare pH and EC in the same water. No real coefficients or measured AquaNode accuracy are supplied.')},
];
export default function TechnologyPage({renderViewer}:{renderViewer:()=>ReactNode}){
 const [active,setActive]=useState(0),paths=getPaths();
 return <div className="technology-page">
  <header className="page-intro tech-hero">
   <div className="tech-section-top"><SectionLabel icon="buoy">{t('THE BUOY / TECHNOLOGY')}</SectionLabel><span className="tech-hero-status"><i aria-hidden="true"/>{t("CONCEPT MODEL")}</span></div>
   <div className="tech-hero-layout"><Heading as="h1">{t('Inside the buoy.')}</Heading><div className="tech-hero-copy"><p>{t("Explore the revC freshwater bench: SEN0244 EC, DS18B20 temperature and SEN0169-V2 pH through DFR0504 isolation and ADS1115. pH uses separate bench power; hardware performance is not yet validated.")}</p><RevisionNotice/><a className="arrow-link" href="#tech-carrier">{t('Follow the connections')}<FlexibleArrow direction="down"/></a></div>
   <dl className="tech-hero-specs"><div><dt>{t('PLANNED INPUTS')}</dt><dd>EC <span>+</span> pH <span>+</span> °C</dd></div><div><dt>{t('REVISION')}</dt><dd className="revision-value">{revision}</dd></div><div><dt>{t('BENCH OUTPUT')}</dt><dd>USB <span>/ JSONL</span></dd></div></dl>
   <div className="tech-model"><div className="tech-model-top"><SectionLabel as="span" icon="compass">{t('01 / EXPLORE THE DEVICE')}</SectionLabel><span>{t('CONCEPT MODEL')}</span></div>{renderViewer()}</div></div>
   <div className="tech-hero-foot"><span>{t('FLOAT · PROTECT · OBSERVE')}</span><p>{t('The 3D model is illustrative. The current architecture below describes a design, not a tested physical assembly.')}</p></div>
  </header>
  <section className="tech-section tech-carrier" id="tech-carrier" aria-labelledby="tech-carrier-title">
   <div className="tech-section-top"><SectionLabel icon="layers">{t('01 / THE CURRENT DESIGN')}</SectionLabel><span>{revision}</span></div>
   <div className="tech-carrier-layout"><div><Heading as="h2" id="tech-carrier-title">{t('Prepared for the bench.')}</Heading><p>{t("Three inputs share the bench workflow: experimental EC, temperature and isolated pH. The table identifies the selected modules and source-level checks; battery-powered pH is not complete.")}</p><p>{t('According to the AquaNode team, the second version of the buoy was developed jointly with specialists from the Ocean Conservation Administration (OCA). The revC specifications and validation status are listed separately below.')}</p><p className="tech-scope">{t("The planned EC estimate is for freshwater. It cannot identify individual salts or establish drinking-water safety. AquaNode accuracy and battery life still require measurements.")}</p></div>
   <dl className="specs">{[[t('Controller'),'XIAO ESP32S3'],[t('Experimental EC channel'),'DFRobot SEN0244'],[t('Temperature input'),'DS18B20'],[t('Isolated pH'),'SEN0169-V2 · DFR0504'],[t('pH acquisition'),'ADS1115'],[t('Separate pH bench power'),'5 V'],[t('Bench acquisition'),'USB / JSONL'],[t('Software checks'),t("18 Python tests passed; hardware untested")],[t('Hardware status'),t('Validation pending')]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
  </section>
  <section className="tech-section tech-drawings" aria-labelledby="tech-drawings-title"><div className="tech-section-top"><SectionLabel icon="blueprint">{t('02 / ON THE DRAWING BOARD')}</SectionLabel><span>{t('DESIGN OVERVIEW / NOT AN ELECTRICAL SCHEMATIC')}</span></div><DrawingSequence/></section>
  <CircuitExplorer paths={paths} active={active} onChange={setActive}/>
  <section className="tech-section tech-next"><div><SectionLabel icon="assembly">{t('FROM DRAWING TO WORKBENCH')}</SectionLabel><Heading as="h2">{t('Follow the design.')}<br/><em>{t('Check the real thing.')}</em></Heading></div><div><p>{t('Follow the planned checks, the revision status and the permitted public materials.')}</p><Link className="arrow-link" to="/build">{t('Build & resources')}<FlexibleArrow direction="up-right"/></Link></div></section>
 </div>;
}
