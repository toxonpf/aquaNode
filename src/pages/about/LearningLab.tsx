import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';

const getSteps=()=>[
 {label:t('Ask'),title:t('Start with a question.'),task:t('Choose one accessible location and a change you want to investigate. Think about what would make two observations comparable.'),outcome:t('A question you can investigate'),link:t('Explore the observation map'),to:'/map'},
 {label:t('Build'),title:t('Make the process visible.'),task:t('Use the assembly drawing to locate a connector. Follow it through the documentation and explain what it connects to the rest of the device.'),outcome:t('A connection you can explain'),link:t('Open the assembly resources'),to:'/build'},
 {label:t('Reflect'),title:t('Leave a useful record.'),task:t('Write down the setup, what you checked and what remains uncertain. Decide what you would change or repeat in the next investigation.'),outcome:t('A clear next step'),link:t('See how we document the work'),to:'/journal'},
];

function FieldNote({step}:{step:number}){
 if(step===1)return <figure className="learning-reference learning-reference--drawing"><img src="/assets/Assembly.png" alt={t('AquaNode R0.3 assembly drawing for the connector study')} loading="lazy"/><figcaption>{t('Start at a labelled connector. What is its role?')}</figcaption></figure>;
 const prompts=step===0?[t('Where will you observe?'),t('What could change?'),t('What will you compare?')]:[t('What did you check, and how?'),t('What did you learn?'),t('What would you repeat or change?')];
 return <div className="learning-reference learning-reference--notes"><span>{step===0?t('BEFORE THE OBSERVATION'):t('AFTER THE OBSERVATION')}</span>{prompts.map((prompt,index)=><div key={prompt}><span>0{index+1}</span><p>{prompt}</p></div>)}</div>;
}

export default function LearningLab(){
 return <section className="about-section learning-lab learning-journey dark" aria-labelledby="about-readings-title">
  <div className="about-section-top"><SectionLabel icon="learning">{t('02 / LEARNING BY DOING')}</SectionLabel><span>{t('FROM CURIOSITY TO SOMETHING YOU CAN TRY.')}</span></div>
  <div className="learning-heading"><Heading as="h2" id="about-readings-title">{t('Less guessing.')} <em>{t('More finding out.')}</em></Heading><p>{t('One small investigation, from the first question to a record you can return to. Follow the steps as you scroll.')}</p></div>
  <ol className="learning-journey-steps">{getSteps().map((step,index)=><li className="learning-journey-step" key={step.label}>
   <div className="learning-journey-index"><span>0{index+1}</span><b>{step.label}</b></div>
   <Heading as="h3">{step.title}</Heading><p className="learning-journey-task">{step.task}</p>
   <FieldNote step={index}/>
   <p className="learning-journey-outcome"><span>{t('TAKE AWAY')}</span>{step.outcome}</p>
   <Link className="arrow-link" to={step.to}>{step.link}<FlexibleArrow direction="up-right"/></Link>
  </li>)}</ol>
 </section>;
}
