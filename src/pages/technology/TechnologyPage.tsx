import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import {useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import AnimatedHeight from '../../components/ui/AnimatedHeight';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {DownloadLink} from '../../components/ui/ActionLinks';
import CircuitExplorer from './CircuitExplorer';
import DrawingSequence from './DrawingSequence';

const getPaths=()=>[
  {title:t("Coordinate"),component:'XIAO ESP32S3',label:t("THE CONTROLLER"),copy:t("The controller exchanges readings with the analog converter over I2C and connects to the temperature input."),detail:t("The carrier brings these interfaces together around a removable controller module.")},
  {title:t("Convert"),component:'ADS1115',label:t("THE ANALOG INPUTS"),copy:t("ADS1115 input AIN0 is assigned to the pH front end; AIN1 monitors the battery channel. Input scaling must match the selected front end."),detail:t("The converter digitises the conditioned signal. Calibration and analog loading still need to be checked on the assembled board.")},
  {title:t("Supply"),component:t("BOOST + REGULATOR"),label:t("THE POWER PATH"),copy:t("A switched boost converter and a separate regulator provide the pH supply. Startup behaviour and ripple are physical test items."),detail:t("Switching the pH supply is a design provision; measured consumption and battery life are not established by the CAD files.")},
  {title:t("Connect"),component:t("PROBES + POWER"),label:t("THE EXTERNAL INTERFACES"),copy:t("Labelled connectors bring the probes, battery and external switch to the carrier. The switch disconnects battery power; USB can still power the device."),detail:t("The DS18B20 interface uses three wires with external power. Connector polarity and module fit must be checked before assembly.")},
];

export default function TechnologyPage({renderViewer}:{renderViewer:()=>ReactNode}){
  const paths=getPaths();
  const [drawing,setDrawing]=useState<'assembly'|'copper'>('assembly');
  const [active,setActive]=useState(0);
  return <div className="technology-page">
    <header className="page-intro tech-hero">
      <div className="tech-section-top"><SectionLabel icon="buoy">{t("THE BUOY / TECHNOLOGY")}</SectionLabel><span className="tech-hero-status"><i aria-hidden="true"/>{t("CONCEPT MODEL")}</span></div>
      <div className="tech-hero-layout"><Heading as="h1">{t("Inside the buoy.")}</Heading><div className="tech-hero-copy"><p>{t("Explore the device, then follow the measurement and power paths in the R0.3 carrier design.")}</p><a className="arrow-link" href="#tech-carrier">{t("Follow the connections")}<FlexibleArrow direction="down"/></a></div>
      <dl className="tech-hero-specs"><div><dt>{t("IN THE WATER")}</dt><dd>pH <span>+</span> °C</dd></div><div><dt>{t("THE CARRIER")}</dt><dd>R0.3</dd></div><div><dt>{t("BOARD SIZE")}</dt><dd>80 × 60 <span>mm</span></dd></div></dl>
      <div className="tech-model"><div className="tech-model-top"><SectionLabel as="span" icon="compass">{t("01 / EXPLORE THE DEVICE")}</SectionLabel><span>{t("CONCEPT MODEL")}</span></div>{renderViewer()}</div></div>
      <div className="tech-hero-foot"><span>{t("FLOAT · PROTECT · OBSERVE")}</span><p>{t("The model illustrates the arrangement. The engineering drawings below document the R0.3 board.")}</p></div>
    </header>

    <section className="tech-section tech-carrier" id="tech-carrier" aria-labelledby="tech-carrier-title">
      <div className="tech-section-top"><SectionLabel icon="layers">{t("01 / THE CARRIER")}</SectionLabel><span>{t("DESIGN REFERENCE / R0.3")}</span></div>
      <div className="tech-carrier-layout"><div><Heading as="h2" id="tech-carrier-title">{t("The connections")}<br/>{t("have a")} <em>{t("home.")}</em></Heading><p>{t("The carrier holds the measurement interfaces, power circuitry and connections around the controller.")}</p><p className="tech-scope">{t("These specifications describe the R0.3 CAD revision, which is awaiting physical validation. It is separate from the team-reported working prototype.")}</p></div><dl className="specs">{[[t("Board"),t("80 × 60 mm · two copper layers")],[t("Construction"),t("FR4 · 1.6 mm · 1 oz copper")],[t("Controller"),'XIAO ESP32S3'],[t("Analog conversion"),'ADS1115 · I2C'],[t("Temperature interface"),t("DS18B20 · externally powered, three-wire")],[t("Mounting"),t("Four 3.2 mm holes")]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
    </section>

    <section className="tech-section tech-drawings" aria-labelledby="tech-drawings-title">
      <div className="tech-section-top"><SectionLabel icon="blueprint">{t("02 / ON THE DRAWING BOARD")}</SectionLabel><span>{t("ORIGINAL ENGINEERING / R0.3")}</span></div>
      <DrawingSequence/>
      <div className="tech-drawing-layout"><figure className="tech-drawing-sheet"><div className="tech-drawing-meta"><span>{drawing==='assembly'?t("COMPONENT PLACEMENT"):t("FRONT COPPER + SILKSCREEN")}</span><span>{t("80 × 60 mm")}</span></div><img src={drawing==='assembly'?'/assets/Assembly.png':'/assets/PCB_F.png'} alt={drawing==='assembly'?t("Original R0.3 component placement drawing"):t("Original R0.3 front copper and silkscreen drawing")} loading="lazy"/><figcaption>{t("R0.3 CAD export ·")} {drawing==='assembly'?t("assembly layout"):t("front layer")} {t("· not a photograph")}</figcaption></figure>
      <div className="tech-drawing-copy"><Heading as="h2" id="tech-drawings-title">{t("Space for")}<br/><em>{t("every connection.")}</em></Heading><div className="tech-drawing-switch" role="group" aria-label={t("Choose an engineering drawing")}><button type="button" aria-pressed={drawing==='assembly'} onClick={()=>setDrawing('assembly')} aria-controls="tech-drawing-notes">{t("Assembly")}</button><button type="button" aria-pressed={drawing==='copper'} onClick={()=>setDrawing('copper')} aria-controls="tech-drawing-notes">{t("Copper layout")}</button></div>
      <AnimatedHeight id="tech-drawing-notes" aria-live="polite"><Heading as="h3">{drawing==='assembly'?t("Room to fit, room to service."):t("A considered path for power.")}</Heading><p>{drawing==='assembly'?t("The carrier reserves the module footprint and an extra 4 mm below it for access to the battery connections. R0.3 moves C17 and C18 beside the module area to keep that space clear."):t("The power components are grouped around a short switching path. Ground stitching joins the copper areas on both layers; the release notes record 71 ground vias.")}</p><p>{drawing==='assembly'?t("The drawing marks connector polarity and the USB end. Actual module height, cable clearance and enclosure fit still need a physical check."):t("Layout checks document the design. They do not replace measurements of supply ripple, startup behaviour or the analog input on a physical board.")}</p></AnimatedHeight>
      <DownloadLink href="/resources/Assembly.svg" label={t("Assembly drawing")} format="SVG" detail={t("R0.3 · Original engineering drawing")}/></div></div>
    </section>

    <CircuitExplorer paths={paths} active={active} onChange={setActive}/>
    <section className="tech-section tech-next"><div><SectionLabel icon="assembly">{t("FROM DRAWING TO WORKBENCH")}</SectionLabel><Heading as="h2">{t("Follow the design.")}<br/><em>{t("Check the real thing.")}</em></Heading></div><div><p>{t("Continue with assembly order, calibration checks and the original resource files.")}</p><Link className="arrow-link" to="/build">{t("Build & resources")}<FlexibleArrow direction="up-right"/></Link></div></section>
  </div>;
}
