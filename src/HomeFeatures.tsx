import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import FlexibleArrow from './FlexibleArrow';
import {parts} from './content';
import {networkNodes,networkConnections,networkPlanPoint} from './networkLayout';
import './home-features.css';

export function MeetNode({renderViewer}:{renderViewer:(active:number,onChange:(part:number)=>void)=>ReactNode}){
  const [active,setActive]=useState(0);
  return <section className="section dark node-showcase" aria-labelledby="meet-node-title">
    <div className="feature-section-top"><p className="kicker">03 / MEET THE NODE</p><span>ONE INSTRUMENT. THREE CONNECTED PARTS.</span></div>
    <div className="node-showcase-layout"><div className="node-intro">
      <h2 id="meet-node-title">Purpose in<br/><em>every part.</em></h2>
      <p>A small presence on the water. A considered system above and below it.</p>
      <div className="node-parts" role="group" aria-label="Explore the parts of AquaNode">{parts.map((part,index)=><button key={part.name} type="button" aria-pressed={active===index} aria-controls="node-model-viewer" onClick={()=>setActive(index)}>
        <span className="node-part-heading"><span>{String(index+1).padStart(2,'0')}</span><b>{['Stay afloat','Protect the electronics','Read the water'][index]}</b><FlexibleArrow direction="up-right"/></span>
        <span className="node-part-detail"><span>{part.text}</span></span>
      </button>)}</div>
      <Link className="arrow-link node-showcase-link" to="/technology">Inside the technology <FlexibleArrow direction="up-right"/></Link>
    </div><div className="node-display" id="node-model-viewer">
      <div className="node-display-top"><span>AQUANODE / CONCEPT STUDY</span><span>{String(active+1).padStart(2,'0')} / 03</span></div>
      {renderViewer(active,setActive)}
      <div className="node-display-bottom"><span><b>pH</b> ACIDITY</span><span><b>°C</b> TEMPERATURE</span><span><b>1h</b> TRANSMISSION</span></div>
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
    <div className="feature-section-top"><p className="kicker">05 / LOOKING AHEAD</p><span>THE NEXT CHAPTER IS OPEN</span></div>
    <div className="future-heading"><h2 id="future-title">One node.<br/><em>A wider perspective.</em></h2><p>The first buoy is a starting point. More observation points could help us see how conditions differ across the water — and follow the questions that emerge.</p></div>
    <div className="future-workbench"><div className="future-map">
      <div className="future-map-top"><span>{expanded?'02 / A POSSIBLE NEXT CHAPTER':'01 / WHERE WE START'}</span><span>CONCEPTUAL LAYOUT</span></div>
      <svg viewBox="0 0 720 580" role="img" aria-label={expanded?'Concept of a future buoy network, not deployed':'One working buoy, with possible future locations shown faintly'}>
        <defs><g id={id}><rect x="-16" y="-12" width="32" height="26" rx="5"/><path d="M-7-9H7v16H-7zM4-9v-10M-5 14v6m10-6v6"/></g></defs>
        <g className="future-map-contours" fill="none">{[0,1,2,3,4].map(i=><path key={i} d={`M-80 ${120+i*68}C110 ${-20+i*68} 175 ${410+i*35} 370 ${280+i*45}S600 ${50+i*75} 820 ${180+i*65}`}/>)}</g>
        <g className="future-map-links" fill="none">{networkConnections.map(([from,to])=>{const a=networkPlanPoint(from),b=networkPlanPoint(to);return <path key={from+'-'+to} pathLength="1" d={`M${a.x} ${a.y}Q${(a.x+b.x)/2-20} ${(a.y+b.y)/2-35} ${b.x} ${b.y}`}/>})}</g>
        {networkNodes.map((_,index)=>{const point=networkPlanPoint(index);return <g key={index} className={'future-point'+(index?' is-proposed':' is-working')} transform={`translate(${point.x} ${point.y})`}>
          <circle className="future-node-ring" r={index?32:43}/><circle className="future-node-disc" r={index?23:30}/><use href={'#'+id} className="future-node-icon"/>
          <text y="58" textAnchor="middle">{index?String(index+1).padStart(2,'0'):'01 / WORKING TODAY'}</text>
        </g>})}
      </svg>
      <div className="future-map-foot"><span><i/> WORKING PROTOTYPE</span><span><i/> FUTURE POSSIBILITY</span></div>
    </div><div className="future-notes">
      <div className="future-switch" role="group" aria-label="Explore today and the future network"><button type="button" aria-pressed={!expanded} onClick={()=>setExpanded(false)}>One buoy today</button><button type="button" aria-pressed={expanded} onClick={()=>setExpanded(true)}>A future network</button></div>
      <div className="future-description" aria-live="polite"><span>{expanded?'NEXT / A SHARED VIEW':'NOW / A PLACE TO START'}</span><h3>{expanded?<>More points.<br/>Better questions.</>:<>Begin with one<br/>good observation.</>}</h3><p>{expanded?'Several buoys could add context to each reading: different places, observed over time. A deployed network and a public dataset are future work.':'One working prototype measures pH and temperature and transmits an update every hour. What we learn from it will shape what comes next.'}</p></div>
      <dl className="future-evidence"><div><dt>Working today</dt><dd>01 prototype</dd></div><div><dt>Next to explore</dt><dd>More observation points</dd></div></dl>
      <Link className="arrow-link" to="/journal">Follow the next chapter <FlexibleArrow direction="up-right"/></Link>
    </div></div>
    <div className="future-bottom"><span>INDIVIDUAL NODES. SHARED PERSPECTIVE.</span><p>Illustrative concept · no deployed network.</p></div>
  </section>;
}
