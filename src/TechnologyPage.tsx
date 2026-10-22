import {useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import Heading from './Heading';
import FlexibleArrow from './FlexibleArrow';
import './technology.css';
import {DownloadLink} from './ActionLinks';

const paths=[
  {title:'Coordinate',component:'XIAO ESP32S3',label:'THE CONTROLLER',copy:'The controller exchanges readings with the analog converter over I2C and connects to the temperature input.',detail:'The carrier brings these interfaces together around a removable controller module.'},
  {title:'Convert',component:'ADS1115',label:'THE ANALOG INPUTS',copy:'ADS1115 input AIN0 is assigned to the pH front end; AIN1 monitors the battery channel. Input scaling must match the selected front end.',detail:'The converter digitises the conditioned signal. Calibration and analog loading still need to be checked on the assembled board.'},
  {title:'Supply',component:'BOOST + REGULATOR',label:'THE POWER PATH',copy:'A switched boost converter and a separate regulator provide the pH supply. Startup behaviour and ripple are physical test items.',detail:'Switching the pH supply is a design provision; measured consumption and battery life are not established by the CAD files.'},
  {title:'Connect',component:'PROBES + POWER',label:'THE EXTERNAL INTERFACES',copy:'Labelled connectors bring the probes, battery and external switch to the carrier. The switch disconnects battery power; USB can still power the device.',detail:'The DS18B20 interface uses three wires with external power. Connector polarity and module fit must be checked before assembly.'},
];

export default function TechnologyPage({renderViewer}:{renderViewer:()=>ReactNode}){
  const [drawing,setDrawing]=useState<'assembly'|'copper'>('assembly');
  const [active,setActive]=useState(0);
  const path=paths[active];
  return <div className="technology-page">
    <header className="page-intro tech-hero">
      <div className="tech-section-top"><p className="kicker">THE BUOY / TECHNOLOGY</p><span>A SMALL SYSTEM. A CLEAR JOB.</span></div>
      <div className="tech-hero-layout"><div className="tech-hero-copy"><Heading as="h1">An instrument for asking better questions.</Heading><p>Explore the device, then follow the measurement and power paths in the R0.3 carrier design.</p><a className="arrow-link" href="#tech-carrier">Follow the connections<FlexibleArrow direction="down"/></a></div>
      <div className="tech-model"><div className="tech-model-top"><span>01 / EXPLORE THE DEVICE</span><span>CONCEPT MODEL</span></div>{renderViewer()}</div></div>
      <div className="tech-hero-foot"><span>FLOAT · PROTECT · OBSERVE</span><p>The model illustrates the arrangement. The engineering drawings below document the R0.3 board.</p></div>
    </header>

    <section className="tech-section tech-carrier" id="tech-carrier" aria-labelledby="tech-carrier-title">
      <div className="tech-section-top"><p className="kicker">01 / THE CARRIER</p><span>DESIGN REFERENCE / R0.3</span></div>
      <div className="tech-carrier-layout"><div><Heading as="h2" id="tech-carrier-title">The connections<br/>have a <em>home.</em></Heading><p>The carrier holds the measurement interfaces, power circuitry and connections around the controller.</p><p className="tech-scope">These specifications describe the R0.3 CAD revision, which is awaiting physical validation. It is separate from the team-reported working prototype.</p></div><dl className="specs">{[['Board','80 × 60 mm · two copper layers'],['Construction','FR4 · 1.6 mm · 1 oz copper'],['Controller','XIAO ESP32S3'],['Analog conversion','ADS1115 · I2C'],['Temperature interface','DS18B20 · externally powered, three-wire'],['Mounting','Four 3.2 mm holes']].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
    </section>

    <section className="tech-section tech-drawings" aria-labelledby="tech-drawings-title">
      <div className="tech-section-top"><p className="kicker">02 / ON THE DRAWING BOARD</p><span>ORIGINAL ENGINEERING / R0.3</span></div>
      <div className="tech-drawing-layout"><figure className="tech-drawing-sheet"><div className="tech-drawing-meta"><span>{drawing==='assembly'?'COMPONENT PLACEMENT':'FRONT COPPER + SILKSCREEN'}</span><span>80 × 60 mm</span></div><img src={drawing==='assembly'?'/assets/Assembly.png':'/assets/PCB_F.png'} alt={drawing==='assembly'?'Original R0.3 component placement drawing':'Original R0.3 front copper and silkscreen drawing'} loading="lazy"/><figcaption>R0.3 CAD export · {drawing==='assembly'?'assembly layout':'front layer'} · not a photograph</figcaption></figure>
      <div className="tech-drawing-copy"><Heading as="h2" id="tech-drawings-title">Space for<br/><em>every connection.</em></Heading><div className="tech-drawing-switch" role="group" aria-label="Choose an engineering drawing"><button type="button" aria-pressed={drawing==='assembly'} onClick={()=>setDrawing('assembly')} aria-controls="tech-drawing-notes">Assembly</button><button type="button" aria-pressed={drawing==='copper'} onClick={()=>setDrawing('copper')} aria-controls="tech-drawing-notes">Copper layout</button></div>
      <div id="tech-drawing-notes" aria-live="polite"><Heading as="h3">{drawing==='assembly'?'Room to fit, room to service.':'A considered path for power.'}</Heading><p>{drawing==='assembly'?'The carrier reserves the module footprint and an extra 4 mm below it for access to the battery connections. R0.3 moves C17 and C18 beside the module area to keep that space clear.':'The power components are grouped around a short switching path. Ground stitching joins the copper areas on both layers; the release notes record 71 ground vias.'}</p><p>{drawing==='assembly'?'The drawing marks connector polarity and the USB end. Actual module height, cable clearance and enclosure fit still need a physical check.':'Layout checks document the design. They do not replace measurements of supply ripple, startup behaviour or the analog input on a physical board.'}</p></div>
      <DownloadLink href="/resources/Assembly.svg" label="Assembly drawing" format="SVG" detail="R0.3 · Original engineering drawing"/></div></div>
    </section>

    <section className="tech-section tech-paths dark" aria-labelledby="tech-paths-title">
      <div className="tech-section-top"><p className="kicker">03 / INSIDE THE DESIGN</p><span>SELECT A PATH TO FOLLOW IT.</span></div>
      <Heading as="h2" id="tech-paths-title">Four paths through the board.</Heading>
      <div className="tech-path-layout"><div className="tech-path-picker" role="group" aria-label="Explore the board functions">{paths.map((item,index)=><button key={item.title} type="button" aria-pressed={active===index} aria-controls="tech-path-detail" onClick={()=>setActive(index)}><span>0{index+1}</span><b>{item.title}</b><FlexibleArrow direction="up-right"/></button>)}</div>
      <div className="tech-path-detail" id="tech-path-detail" aria-live="polite"><div className="tech-path-map" aria-hidden="true">{paths.map((item,index)=><div key={item.title} className={active===index?'is-active':''}><span>0{index+1}</span><strong>{item.component}</strong><i/></div>)}</div><span className="tech-path-caption">FUNCTIONAL OVERVIEW / NOT COMPONENT PLACEMENT</span><div className="tech-path-text" key={active}><p className="kicker">{path.label}</p><Heading as="h3">{path.component}</Heading><p>{path.copy}</p><p className="tech-path-note">{path.detail}</p></div></div></div>
    </section>
    <section className="tech-section tech-next"><div><p className="kicker">FROM DRAWING TO WORKBENCH</p><Heading as="h2">Follow the design.<br/><em>Check the real thing.</em></Heading></div><div><p>Continue with assembly order, calibration checks and the original resource files.</p><Link className="arrow-link" to="/build">Build & resources<FlexibleArrow direction="up-right"/></Link></div></section>
  </div>;
}
