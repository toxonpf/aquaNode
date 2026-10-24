import {t} from '../../features/i18n/i18n';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import AnimatedHeight from '../../components/ui/AnimatedHeight';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
const getSteps=()=>[
  {label:t("Ask"),hint:t("Find something worth noticing."),title:t("Start with a question."),task:t("Choose one accessible location and a change you want to investigate. Think about what would make two observations comparable."),outcome:t("A question you can investigate"),link:t("Explore the instrument"),to:'/technology'},
  {label:t("Build"),hint:t("Follow a connection, understand its job."),title:t("Make the process visible."),task:t("Use the assembly drawing to locate a connector. Follow it through the documentation and explain what it connects to the rest of the device."),outcome:t("A connection you can explain"),link:t("Open the assembly resources"),to:'/build'},
  {label:t("Reflect"),hint:t("Turn the experience into a useful record."),title:t("Leave a useful record."),task:t("Write down the setup, what you checked and what remains uncertain. Decide what you would change or repeat in the next investigation."),outcome:t("A clear next step"),link:t("See how we document the work"),to:'/journal'},
];

function LearningArtifact({step}:{step:number}){
  return <div className={'learning-sheet learning-sheet--'+step}>
    <div className="learning-sheet-top"><span>{[t("FIELD QUESTION"),t("DRAWING STUDY"),t("REFLECTION NOTES")][step]}</span><span>{t("AQUANODE / 0")}{step+1}</span></div>
    {step===0?<div className="learning-question"><span className="learning-mini-label">{t("A PLACE TO BEGIN")}</span><blockquote>{t("What changes between")}<br/><em>{t("morning and afternoon?")}</em></blockquote><dl><div><dt>{t("Choose")}</dt><dd>{t("One location")}</dd></div><div><dt>{t("Compare")}</dt><dd>{t("Two times of day")}</dd></div><div><dt>{t("Keep consistent")}</dt><dd>{t("The observation setup")}</dd></div></dl></div>:
    step===1?<figure className="learning-drawing"><img src="/assets/Assembly.png" alt={t("AquaNode R0.3 assembly drawing for the connector study")} loading="lazy"/><figcaption>{t("Start at a labelled connector. What is its role?")}<br/>{t("R0.3 CAD drawing · physical validation pending.")}</figcaption></figure>:
    <div className="learning-notebook">{[['01',t("The question"),t("What did you want to understand?")],['02',t("The evidence"),t("What did you check, and how?")],['03',t("The next attempt"),t("What would you repeat or change?")]].map(([n,label,prompt])=><div key={n}><span>{n}</span><div><b>{label}</b><p>{prompt}</p><i/></div></div>)}</div>}
    <div className="learning-sheet-foot"><span>{t("LEARNING EXERCISE")}</span><span>{[t("PLAN THE OBSERVATION"),t("READ THE DESIGN"),t("KEEP THE CONTEXT")][step]}</span></div>
  </div>;
}

export default function LearningLab(){
  const steps=getSteps();
  const [active,setActive]=useState(0),selected=steps[active];
  return <section className="about-section learning-lab dark" aria-labelledby="about-readings-title">
    <div className="about-section-top"><p className="kicker">{t("02 / LEARNING BY DOING")}</p><span>{t("FROM CURIOSITY TO SOMETHING YOU CAN TRY.")}</span></div>
    <div className="learning-heading"><Heading as="h2" id="about-readings-title">{t("Less guessing.")}<br/><em>{t("More finding out.")}</em></Heading><p>{t("AquaNode can be a starting point for a small investigation. Pick a question, explore how the tool works, then make a record someone else could follow.")}</p></div>
    <div className="learning-workbench"><div className="learning-controls"><div className="learning-control-heading"><span>{t("YOUR WAY THROUGH")}</span><span>0{active+1} / 03</span></div><div role="group" aria-label={t("Explore our learning approach")}>{steps.map((step,index)=><button key={step.label} type="button" aria-label={`0${index+1} ${step.label}`} aria-pressed={active===index} aria-controls="learning-detail" onClick={()=>setActive(index)}><span className="learning-step-number">0{index+1}</span><span className="learning-step-copy"><b>{step.label}</b><span>{step.hint}</span></span><FlexibleArrow direction="up-right"/></button>)}</div><div className="learning-loop"><svg viewBox="0 0 130 50" fill="none" aria-hidden="true"><path d="M7 25C20 4 38 4 47 25S75 47 86 25 113 4 124 25M114 22l10 3-2-10"/></svg><p>{t("Follow the steps in your own order.")}<br/>{t("A new question can bring you back.")}</p></div></div>
    <div className="learning-detail" id="learning-detail" aria-live="polite" aria-atomic="true"><AnimatedHeight><div className="learning-stage-content" key={active}><LearningArtifact step={active}/><div className="learning-task"><span className="learning-mini-label">{t("TRY THIS / 0")}{active+1}</span><Heading as="h3">{selected.title}</Heading><p>{selected.task}</p><div className="learning-takeaway"><span>{t("TAKE AWAY")}</span><b>{selected.outcome}</b></div></div></div></AnimatedHeight></div></div>
    <div className="learning-footer"><span>{t("A SMALL EXERCISE. A BETTER QUESTION.")}</span><Link className="arrow-link" to={selected.to}>{selected.link}<FlexibleArrow direction="up-right"/></Link></div>
  </section>;
}
