import RelatedLinks from '../../components/ui/RelatedLinks';
import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import Heading from '../../components/ui/Heading';
import ArrowLink from '../../components/ui/ArrowLink';
import {ExternalLink} from '../../components/ui/ActionLinks';
import {awardUrl} from '../../data/content';
import OceanStory from '../../features/ocean/OceanStory';

export default function HomePage(){return <>
 <OceanStory/>
 <div className="award"><span className="award-mark" aria-hidden="true">✳</span><p>{t('Youth Innovation Challenge 2026 winner')}</p><ExternalLink href={awardUrl} inline>{t('Read the GEEP profile')}</ExternalLink></div>
 <section id="progress" className="section progress-section"><div className="section-heading results-heading"><div><SectionLabel icon="progress">{t('Project results')}</SectionLabel><Heading as="h2">{t('AquaNode today')}</Heading></div><p>{t('Buoys, measurements and development')}</p></div>
 <div className="status-grid">
  <article className="status-current"><Heading as="h3">{t('Recorded measurements')}</Heading><p>{t('We have collected data with checked AquaNode sensors.')}</p><ArrowLink to="/journal#journal-record">{t('Read the development history')}</ArrowLink></article>
  <article><Heading as="h3">{t('Second version with OCA')}</Heading><p>{t('We are creating the second version of the buoy together with specialists from the Ocean Conservation Administration (OCA).')}</p><ArrowLink to="/journal#oca-v2">{t('View the second version')}</ArrowLink></article>
  <article><Heading as="h3">{t('Device development')}</Heading><p>{t('We refine new buoy revisions and document the changes.')}</p><ArrowLink to="/journal">{t('Development journal')}</ArrowLink></article>
 </div><p className="note">{t('Measurement files and device identifiers are being prepared for publication.')}</p></section>
 <section id="why" className="section cycle-section observation-workflow"><div className="workflow-intro"><SectionLabel icon="learning">{t('Water observation at school')}</SectionLabel><Heading as="h2">{t('From assembly to observations')}</Heading><p>{t('Changes in water are not always visible. Measurements help students investigate them.')}</p><ArrowLink to="/about">{t('The project')}</ArrowLink></div><ol className="workflow-steps">{[
 ['assembly','Assemble the instrument','Connect the sensors and understand the role of each component.'],
 ['probe','Collect a record','Keep the measurement with its place, date and setup.'],
 ['progress','Compare observations','Check changes and discuss what the measurements show.'],
].map(([icon,title,copy],index)=><li key={title}><SectionLabel icon={icon as 'assembly'|'probe'|'progress'}>{`0${index+1}`}</SectionLabel><div><Heading as="h3">{t(title)}</Heading><p>{t(copy)}</p></div></li>)}</ol></section>
 <RelatedLinks items={[{to:'/build',label:'Build & documentation',detail:'Revision files and assembly materials'},{to:'/team',label:'AquaNode team',detail:'People and public contacts'}]}/>

</>}
