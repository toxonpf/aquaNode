import {t} from '../../features/i18n/i18n';
import Heading from '../../components/ui/Heading';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {parts} from '../../data/content';
import {networkNodes,networkConnections,networkPlanPoint} from '../../features/ocean/scene/networkLayout';
export function MeetNode({renderViewer}:{renderViewer:(active:number,onChange:(part:number)=>void)=>ReactNode}){
  const [active,setActive]=useState(0);
  return <section className="section dark node-showcase" aria-labelledby="meet-node-title">
    <div className="feature-section-top"><p className="kicker">{t("03 / MEET THE NODE")}</p><span>{t("ONE INSTRUMENT. THREE CONNECTED PARTS.")}</span></div>
    <div className="node-showcase-layout"><div className="node-intro">
      <Heading as="h2" id="meet-node-title">{t("Purpose in")}<br/><em>{t("every part.")}</em></Heading>
      <p>{t("A small presence on the water. A considered system above and below it.")}</p>
      <div className="node-parts" role="group" aria-label={t("Explore the parts of AquaNode")}>{parts.map((part,index)=><button key={part.name} type="button" aria-pressed={active===index} aria-controls="node-model-viewer" onClick={()=>setActive(index)}>
        <span className="node-part-heading"><span>{String(index+1).padStart(2,'0')}</span><b>{[t("Stay afloat"),t("Protect the electronics"),t("Read the water")][index]}</b><FlexibleArrow direction="up-right"/></span>
        <span className="node-part-detail"><span>{part.text}</span></span>
      </button>)}</div>
      <Link className="arrow-link node-showcase-link" to="/technology">{t("Inside the technology")} <FlexibleArrow direction="up-right"/></Link>
    </div><div className="node-display" id="node-model-viewer">
      <div className="node-display-top"><span>{t("AQUANODE / CONCEPT STUDY")}</span><span>{String(active+1).padStart(2,'0')} / 03</span></div>
      {renderViewer(active,setActive)}
      <div className="node-display-bottom"><span><b>pH</b> {t("ACIDITY")}</span><span><b>°C</b> {t("TEMPERATURE")}</span><span><b>{t("1h")}</b> {t("TRANSMISSION")}</span></div>
    </div></div>
  </section>;
}

export function FutureNetwork(){
  const [expanded,setExpanded]=useState(false),[inView,setInView]=useState(false);
  const section=useRef<HTMLElement>(null),id=useId();
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setInView(true);observer.disconnect()}},{threshold:.12});
    if(section.current)observer.observe(section.current);
    return()=>observer.disconnect();
  },[]);
  return <section ref={section} className={'section future-section'+(expanded?' is-network':'')+(inView?' is-in-view':'')} aria-labelledby="future-title">
    <div className="feature-section-top"><p className="kicker">{t("05 / LOOKING AHEAD")}</p><span>{t("THE NEXT CHAPTER IS OPEN")}</span></div>
    <div className="future-heading"><Heading as="h2" id="future-title">{t("One node.")}<br/><em>{t("A wider perspective.")}</em></Heading><p>{t("The first buoy is a starting point. More observation points could help us see how conditions differ across the water — and follow the questions that emerge.")}</p></div>
    <div className="future-workbench"><div className="future-map">
      <div className="future-map-top"><span>{expanded?t("02 / A POSSIBLE NEXT CHAPTER"):t("01 / WHERE WE START")}</span><span>{t("CONCEPTUAL LAYOUT")}</span></div>
      <svg viewBox="0 0 720 580" role="img" aria-label={expanded?t("Concept of a future buoy network, not deployed"):t("One working buoy, with possible future locations shown faintly")}>
        <defs><g id={id}><rect x="-16" y="-12" width="32" height="26" rx="5"/><path d="M-7-9H7v16H-7zM4-9v-10M-5 14v6m10-6v6"/></g></defs>
        <g className="future-map-contours" fill="none">{[0,1,2,3,4].map(i=><path key={i} d={`M-80 ${120+i*68}C110 ${-20+i*68} 175 ${410+i*35} 370 ${280+i*45}S600 ${50+i*75} 820 ${180+i*65}`}/>)}</g>
        <g className="future-map-links" fill="none">{networkConnections.map(([from,to])=>{const a=networkPlanPoint(from),b=networkPlanPoint(to);return <path key={from+'-'+to} pathLength="1" d={`M${a.x} ${a.y}Q${(a.x+b.x)/2-20} ${(a.y+b.y)/2-35} ${b.x} ${b.y}`}/>})}</g>
        {networkNodes.map((_,index)=>{const point=networkPlanPoint(index);return <g key={index} className={'future-point'+(index?' is-proposed':' is-working')} transform={`translate(${point.x} ${point.y})`}>
          <circle className="future-node-ring" r={index?32:43}/><circle className="future-node-disc" r={index?23:30}/><use href={'#'+id} className="future-node-icon"/>
          <text y="58" textAnchor="middle">{index?String(index+1).padStart(2,'0'):t("01 / WORKING TODAY")}</text>
        </g>})}
      </svg>
      <div className="future-map-foot"><span><i/> {t("WORKING PROTOTYPE")}</span><span><i/> {t("FUTURE POSSIBILITY")}</span></div>
    </div><div className="future-notes">
      <div className="future-switch" role="group" aria-label={t("Explore today and the future network")}><button type="button" aria-pressed={!expanded} onClick={()=>setExpanded(false)}>{t("One buoy today")}</button><button type="button" aria-pressed={expanded} onClick={()=>setExpanded(true)}>{t("A future network")}</button></div>
      <div className="future-description" aria-live="polite"><span>{expanded?t("NEXT / A SHARED VIEW"):t("NOW / A PLACE TO START")}</span><Heading as="h3">{expanded?<>{t("More points.")}<br/>{t("Better questions.")}</>:<>{t("Begin with one")}<br/>{t("good observation.")}</>}</Heading><p>{expanded?t("Several buoys could add context to each reading: different places, observed over time. A deployed network and a public dataset are future work."):t("One working prototype measures pH and temperature and transmits an update every hour. What we learn from it will shape what comes next.")}</p></div>
      <dl className="future-evidence"><div><dt>{t("Working today")}</dt><dd>{t("01 prototype")}</dd></div><div><dt>{t("Next to explore")}</dt><dd>{t("More observation points")}</dd></div></dl>
      <Link className="arrow-link" to="/journal">{t("Follow the next chapter")} <FlexibleArrow direction="up-right"/></Link>
    </div></div>
    <div className="future-bottom"><span>{t("INDIVIDUAL NODES. SHARED PERSPECTIVE.")}</span><p>{t("Illustrative concept · no deployed network.")}</p></div>
  </section>;
}
