import SectionLabel from '../../components/ui/SectionLabel';
import Heading from '../../components/ui/Heading';
import AnimatedHeight from '../../components/ui/AnimatedHeight';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {t} from '../../features/i18n/i18n';

type BoardPath={title:string;component:string;label:string;copy:string;detail:string};

/** A functional diagram: connections explain the design without suggesting PCB placement. */
export default function CircuitExplorer({paths,active,onChange}:{paths:BoardPath[];active:number;onChange:(index:number)=>void}){
  const selected=paths[active];
  return <section className="tech-section tech-paths dark circuit-explorer" aria-labelledby="tech-paths-title">
    <div className="tech-section-top"><SectionLabel icon="connections">{t('03 / INSIDE THE DESIGN')}</SectionLabel><span>{t('SELECT A PATH TO FOLLOW IT.')}</span></div>
    <div className="circuit-heading"><Heading as="h2" id="tech-paths-title">{t('Connections with a purpose.')}</Heading><p className="circuit-desktop-intro">{t('Tap a module to trace its role, from the probes to the controller and power supply.')}</p><p className="circuit-mobile-intro">{t('Four connected modules. Follow their roles below, from the controller to the external connections.')}</p></div>
    <div className="circuit-workbench">
      <div className="circuit-diagram">
        <div className="circuit-diagram-meta"><span>AQUANODE / R0.3</span><span>80 × 60 mm</span></div>
        <div className="circuit-network" role="group" aria-label={t('Explore the board functions')} data-active={active}>
          <svg className="circuit-traces" viewBox="0 0 600 400" preserveAspectRatio="none" fill="none" aria-hidden="true">
            <g className={active===3||active===1?'is-active':''}><path d="M300 75V118Q300 132 286 132H152Q138 132 138 148V200"/><path className="circuit-trace-pulse" pathLength="100" d="M300 75V118Q300 132 286 132H152Q138 132 138 148V200"/></g>
            <g className={active===3||active===0?'is-active':''}><path d="M300 75V104Q300 116 314 116H448Q462 116 462 132V200"/><path className="circuit-trace-pulse" pathLength="100" d="M300 75V104Q300 116 314 116H448Q462 116 462 132V200"/></g>
            <g className={active===0||active===1?'is-active':''}><path d="M138 200H462"/><path className="circuit-trace-pulse" pathLength="100" d="M138 200H462"/></g>
            <g className={active===2||active===0?'is-active':''}><path d="M300 325V279Q300 266 314 266H448Q462 266 462 252V200"/><path className="circuit-trace-pulse" pathLength="100" d="M300 325V279Q300 266 314 266H448Q462 266 462 252V200"/></g>
          </svg>
          <span className="circuit-bus-label">I²C</span>
          {paths.map((path,index)=><button type="button" className={`circuit-node circuit-node--${index}`} key={path.title} aria-label={`0${index+1} ${path.title}`} aria-pressed={active===index} aria-controls="tech-path-detail" onClick={()=>onChange(index)}><span className="circuit-node-title"><span>0{index+1}</span>{path.title}<i aria-hidden="true"/></span><strong>{['XIAO ESP32S3','ADS1115','BOOST + LDO','pH · °C · USB'][index]}</strong></button>)}
        </div>
        <span className="tech-path-caption">{t('FUNCTIONAL OVERVIEW / NOT COMPONENT PLACEMENT')}</span>
      </div>
      <div className="circuit-inspector" id="tech-path-detail" aria-live="polite" aria-atomic="true">
        <div className="circuit-inspector-meta"><span>{selected.label}</span><span>0{active+1} / 04</span></div>
        <AnimatedHeight><div className="tech-path-copy" key={active}><Heading as="h3">{selected.component}</Heading><p>{selected.copy}</p><div className="circuit-check"><span>{t('WHAT TO CHECK')}</span><p>{selected.detail}</p></div></div></AnimatedHeight>
        <div className="circuit-pagination"><button type="button" aria-label={t('Previous board function')} onClick={()=>onChange((active+3)%4)}><FlexibleArrow direction="left"/>{t('Previous')}</button><button type="button" aria-label={t('Next board function')} onClick={()=>onChange((active+1)%4)}>{t('Next')}<FlexibleArrow/></button></div>
      </div>
    </div>
    <ol className="circuit-mobile-sequence">{paths.map((path,index)=><li key={path.title}>
      <div className="circuit-mobile-label"><span>0{index+1}</span><span>{path.title}</span></div>
      <Heading as="h3">{path.component}</Heading><p>{path.copy}</p>
      <div className="circuit-check"><span>{t('WHAT TO CHECK')}</span><p>{path.detail}</p></div>
    </li>)}</ol>
  </section>;
}
