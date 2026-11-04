import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
export default function LearningLab(){
 const steps=[
  {label:t('Assemble'),task:t('Study the buoy, sensor connections and calibration procedure.'),link:t('Open documentation'),to:'/build'},
  {label:t('Measure'),task:t('Choose an observation site and compare measurements collected under consistent conditions. Record the place, time and sampling depth.'),link:t('Open the buoy map'),to:'/map'},
  {label:t('Discuss results'),task:t('Compare results, check unusual values and explain which conclusions the records support.'),link:t('Development journal'),to:'/journal'},
 ];
 return <section className="about-section learning-lab learning-journey dark" aria-labelledby="about-readings-title"><div className="about-section-top"><SectionLabel icon="learning">{t('Learning activities')}</SectionLabel></div><Heading as="h2" id="about-readings-title">{t('Assemble a buoy → collect measurements → compare results')}</Heading><ol className="learning-journey-steps">{steps.map((step,index)=><li className="learning-journey-step" key={step.to}><div className="learning-journey-index"><span>0{index+1}</span></div><Heading as="h3">{step.label}</Heading><p className="learning-journey-task">{step.task}</p><Link className="arrow-link" to={step.to}>{step.link}<FlexibleArrow direction="up-right"/></Link></li>)}</ol></section>;
}
