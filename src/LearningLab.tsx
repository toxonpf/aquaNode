import {useState} from 'react';
import {Link} from 'react-router-dom';
import Heading from './Heading';
import FlexibleArrow from './FlexibleArrow';
import './learning-lab.css';

const steps=[
  {label:'Ask',hint:'Find something worth noticing.',title:'Start with a question.',task:'Choose one accessible location and a change you want to investigate. Think about what would make two observations comparable.',outcome:'A question you can investigate',link:'Explore the instrument',to:'/technology'},
  {label:'Build',hint:'Follow a connection, understand its job.',title:'Make the process visible.',task:'Use the assembly drawing to locate a connector. Follow it through the documentation and explain what it connects to the rest of the device.',outcome:'A connection you can explain',link:'Open the assembly resources',to:'/build'},
  {label:'Reflect',hint:'Turn the experience into a useful record.',title:'Leave a useful record.',task:'Write down the setup, what you checked and what remains uncertain. Decide what you would change or repeat in the next investigation.',outcome:'A clear next step',link:'See how we document the work',to:'/journal'},
];

function LearningArtifact({step}:{step:number}){
  return <div className={'learning-sheet learning-sheet--'+step}>
    <div className="learning-sheet-top"><span>{['FIELD QUESTION','DRAWING STUDY','REFLECTION NOTES'][step]}</span><span>AQUANODE / 0{step+1}</span></div>
    {step===0?<div className="learning-question"><span className="learning-mini-label">A PLACE TO BEGIN</span><blockquote>What changes between<br/><em>morning and afternoon?</em></blockquote><dl><div><dt>Choose</dt><dd>One location</dd></div><div><dt>Compare</dt><dd>Two times of day</dd></div><div><dt>Keep consistent</dt><dd>The observation setup</dd></div></dl></div>:
    step===1?<figure className="learning-drawing"><img src="/assets/Assembly.png" alt="AquaNode R0.3 assembly drawing for the connector study" loading="lazy"/><figcaption>Start at a labelled connector. What is its role?<br/>R0.3 CAD drawing · physical validation pending.</figcaption></figure>:
    <div className="learning-notebook">{[['01','The question','What did you want to understand?'],['02','The evidence','What did you check, and how?'],['03','The next attempt','What would you repeat or change?']].map(([n,label,prompt])=><div key={n}><span>{n}</span><div><b>{label}</b><p>{prompt}</p><i/></div></div>)}</div>}
    <div className="learning-sheet-foot"><span>LEARNING EXERCISE</span><span>{['PLAN THE OBSERVATION','READ THE DESIGN','KEEP THE CONTEXT'][step]}</span></div>
  </div>;
}

export default function LearningLab(){
  const [active,setActive]=useState(0),selected=steps[active];
  return <section className="about-section learning-lab dark" aria-labelledby="about-readings-title">
    <div className="about-section-top"><p className="kicker">02 / LEARNING BY DOING</p><span>FROM CURIOSITY TO SOMETHING YOU CAN TRY.</span></div>
    <div className="learning-heading"><Heading as="h2" id="about-readings-title">Less guessing.<br/><em>More finding out.</em></Heading><p>AquaNode can be a starting point for a small investigation. Pick a question, explore how the tool works, then make a record someone else could follow.</p></div>
    <div className="learning-workbench"><div className="learning-controls"><div className="learning-control-heading"><span>YOUR WAY THROUGH</span><span>0{active+1} / 03</span></div><div role="group" aria-label="Explore our learning approach">{steps.map((step,index)=><button key={step.label} type="button" aria-label={`0${index+1} ${step.label}`} aria-pressed={active===index} aria-controls="learning-detail" onClick={()=>setActive(index)}><span className="learning-step-number">0{index+1}</span><span className="learning-step-copy"><b>{step.label}</b><span>{step.hint}</span></span><FlexibleArrow direction="up-right"/></button>)}</div><div className="learning-loop"><svg viewBox="0 0 130 50" fill="none" aria-hidden="true"><path d="M7 25C20 4 38 4 47 25S75 47 86 25 113 4 124 25M114 22l10 3-2-10"/></svg><p>Follow the steps in your own order.<br/>A new question can bring you back.</p></div></div>
    <div className="learning-detail" id="learning-detail" aria-live="polite" aria-atomic="true"><div className="learning-stage-content" key={active}><LearningArtifact step={active}/><div className="learning-task"><span className="learning-mini-label">TRY THIS / 0{active+1}</span><Heading as="h3">{selected.title}</Heading><p>{selected.task}</p><div className="learning-takeaway"><span>TAKE AWAY</span><b>{selected.outcome}</b></div></div></div></div></div>
    <div className="learning-footer"><span>A SMALL EXERCISE. A BETTER QUESTION.</span><Link className="arrow-link" to={selected.to}>{selected.link}<FlexibleArrow direction="up-right"/></Link></div>
  </section>;
}
