import RelatedLinks from '../../components/ui/RelatedLinks';
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
 {title:t('Coordinate'),component:'XIAO ESP32S3',label:t('revC controller'),copy:t('The bench source coordinates EC, temperature and ADS1115 pH acquisition and prepares USB records.'),detail:t('Compile for XIAO ESP32S3 and verify acquisition on the board.')},
 {title:t('Estimate EC'),component:'SEN0244',label:t('EXPERIMENTAL CONDUCTIVITY'),copy:t('SEN0244 is used for an experimental EC estimate in freshwater. It is a TDS module, not a seawater salinity instrument.'),detail:t('Calibrate and compare against independent conductivity standards.')},
 {title:t('Read temperature'),component:'DS18B20',label:t('TEMPERATURE INPUT'),copy:t('DS18B20 provides temperature for the EC and pH calculations. Numerical pH is restricted to calibration temperature ±0.5 °C; this is an operating condition, not an accuracy claim.'),detail:t('Check temperature against a reference thermometer.')},
 {title:t('Isolated pH'),component:'SEN0169-V2',label:t('ISOLATED pH CHANNEL'),copy:t('SEN0169-V2 connects through DFR0504 power and signal isolation to ADS1115. The isolator needs a separate regulated 5 V bench supply; battery-powered pH is still being developed.'),detail:t('Calibrate the complete pH chain and test interaction with EC in the same water.')},
];
export default function TechnologyPage({renderViewer}:{renderViewer:()=>ReactNode}){
 const [active,setActive]=useState(0),paths=getPaths();
 return <div className="technology-page">
  <header className="page-intro tech-hero">
   <div className="tech-section-top"><SectionLabel icon="buoy">{t('THE BUOY / TECHNOLOGY')}</SectionLabel><span className="tech-hero-status"><i aria-hidden="true"/>{t("CONCEPT MODEL")}</span></div>
   <div className="tech-hero-layout"><Heading as="h1">{t('How AquaNode works')}</Heading><div className="tech-hero-copy"><p>{t('The buoy combines water sensors, a controller and a power system. Here are the device functions and the differences between revisions.')}</p><a className="arrow-link" href="#tech-carrier">{t('Follow the connections')}<FlexibleArrow direction="down"/></a></div>
   <div className="tech-model"><div className="tech-model-top"><SectionLabel as="span" icon="compass">{t('01 / EXPLORE THE DEVICE')}</SectionLabel><span>{t('CONCEPT MODEL')}</span></div>{renderViewer()}</div></div>
   <div className="tech-hero-foot"><span>{t('FLOAT · PROTECT · OBSERVE')}</span><p>{t('The 3D model shows the main parts of a buoy. The layout depends on the device revision.')}</p></div>
  </header>
  <section className="tech-section existing-devices" aria-labelledby="existing-devices-title"><div className="existing-devices-copy"><SectionLabel icon="buoy">{t('Project results')}</SectionLabel><Heading as="h2" id="existing-devices-title">{t('Existing devices')}</Heading><p>{t('The team has checked sensors and collected measurements with existing devices. Their component lists and measurement files will be linked to device identifiers when published.')}</p><p>{t('According to the AquaNode team, the second version of the buoy was developed jointly with specialists from the Ocean Conservation Administration (OCA). The revC specifications and validation status are listed separately below.')}</p><Link className="arrow-link" to="/map">{t('Open the buoy map')}<FlexibleArrow direction="up-right"/></Link></div><div className="device-evidence"><div className="device-evidence-drawing"><img src="/assets/Assembly.png" loading="lazy" alt={t('Assembly drawing')}/><span>{t('R0.3 archive')}</span></div><ul>{['Sensors checked by the team','Measurements collected','Buoys sent for cooperation'].map(label=><li key={label}><span aria-hidden="true">✓</span>{t(label)}</li>)}</ul></div></section>
  <section className="tech-section tech-carrier" id="tech-carrier" aria-labelledby="tech-carrier-title">
   <div className="tech-section-top"><SectionLabel icon="layers">{t('01 / THE CURRENT DESIGN')}</SectionLabel><span>{revision}</span></div>
   <div className="tech-carrier-layout"><div><Heading as="h2" id="tech-carrier-title">{t('Developing revC')}</Heading><p>{t('revC has its own configuration and validation plan. Checks of existing devices do not establish the readiness of this revision.')}</p><RevisionNotice/><p className="tech-scope">{t('Readings do not determine drinking-water safety. EC does not identify a particular salt.')}</p></div>
   <dl className="specs">{[[t('Controller'),'XIAO ESP32S3'],[t('Experimental EC channel'),'DFRobot SEN0244'],[t('Temperature input'),'DS18B20'],[t('Isolated pH'),'SEN0169-V2 · DFR0504'],[t('pH acquisition'),'ADS1115'],[t('Separate pH bench power'),'5 V'],[t('Bench acquisition'),'USB / JSONL']].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
  </section>
  <section className="tech-section tech-drawings" aria-labelledby="tech-drawings-title"><div className="tech-section-top"><SectionLabel icon="blueprint">{t('02 / ON THE DRAWING BOARD')}</SectionLabel><span>{t('DESIGN OVERVIEW / NOT AN ELECTRICAL SCHEMATIC')}</span></div><DrawingSequence/></section>
  <CircuitExplorer paths={paths} active={active} onChange={setActive}/>
  <RelatedLinks items={[{to:'/build',label:'Build & documentation',detail:'Revision files and assembly materials'},{to:'/journal',label:'Development journal',detail:'Checks, revisions and results'}]}/>
 </div>;
}
