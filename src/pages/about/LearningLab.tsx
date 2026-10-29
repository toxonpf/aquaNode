import ArchitectureImage from '../../components/ui/ArchitectureImage';
import SectionLabel from '../../components/ui/SectionLabel';
import {architectureUrl} from '../../data/project';
import {t} from '../../features/i18n/i18n';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';

const getSteps=()=>[
 {label:t('Assemble'),title:t('Give the question a tool.'),task:t("Use the current architecture to explain the planned EC and temperature inputs. Discuss what needs a bench check before the design can become a classroom instrument."),outcome:t('An instrument you can explain'),link:t("Explore the validation plan"),to:'/build#assembly-guide'},
 {label:t('Observe'),title:t('Take the lesson to the water.'),task:t("Plan an accessible freshwater observation site with a mentor. List the conditions and references a future measurement record will need; use archive records to practise comparison."),outcome:t('A reading with its context'),link:t('Explore the map examples'),to:'/map'},
 {label:t('Act'),title:t('Make the result useful.'),task:t('Investigate an unusual reading, compare it with the record and discuss what it might mean. Decide on a follow-up observation or a concern to share with the community.'),outcome:t('A question, a record, a next action'),link:t('See how we document the work'),to:'/journal'},
];

function FieldNote({step}:{step:number}){
 if(step===0)return <figure className="learning-reference learning-reference--drawing"><ArchitectureImage alt={t("AquaNode EC-revB architecture: a design illustration, not a tested instrument")} loading="lazy"/><figcaption>{t("Trace the design from its sensor inputs to planned USB capture.")}</figcaption></figure>;
 const prompts=step===1?[t('Where will you observe?'),t('What could change?'),t('What will you compare?')]:[t('Which reading needs another check?'),t('What did you learn?'),t('What action could follow?')];
 return <div className="learning-reference learning-reference--notes"><span>{step===1?t('BEFORE THE OBSERVATION'):t('AFTER THE OBSERVATION')}</span>{prompts.map((prompt,index)=><div key={prompt}><span>0{index+1}</span><p>{prompt}</p></div>)}</div>;
}

export default function LearningLab(){
 return <section className="about-section learning-lab learning-journey dark" aria-labelledby="about-readings-title">
  <div className="about-section-top"><SectionLabel icon="learning">{t('02 / LEARNING BY DOING')}</SectionLabel><span>{t('FROM CURIOSITY TO SOMETHING YOU CAN TRY.')}</span></div>
  <div className="learning-heading"><Heading as="h2" id="about-readings-title">{t('More than a classroom exercise.')}</Heading><p>{t("The planned activity moves from understanding the instrument to comparing observations and choosing a follow-up question. Each stage gives students a concrete task with a mentor.")}</p></div>
  <ol className="learning-journey-steps">{getSteps().map((step,index)=><li className="learning-journey-step" key={step.label}>
   <div className="learning-journey-index"><span>0{index+1}</span><b>{step.label}</b></div>
   <Heading as="h3">{step.title}</Heading><p className="learning-journey-task">{step.task}</p>
   <FieldNote step={index}/>
   <p className="learning-journey-outcome"><span>{t('TAKE AWAY')}</span>{step.outcome}</p>
   <Link className="arrow-link" to={step.to}>{step.link}<FlexibleArrow direction="up-right"/></Link>
  </li>)}</ol>
 </section>;
}
