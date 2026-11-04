import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import RelatedLinks from '../../components/ui/RelatedLinks';
import Heading from '../../components/ui/Heading';
import ArrowLink from '../../components/ui/ArrowLink';
import {awardUrl,awardCertificate} from '../../data/content';
import {ExternalLink,DownloadLink} from '../../components/ui/ActionLinks';
import LearningLab from './LearningLab';
export default function AboutPage(){return <div className="about-page">
 <header className="page-intro about-hero"><div className="about-hero-top"><SectionLabel icon="learning">{t('The project')}</SectionLabel></div><div className="about-hero-layout"><div className="about-hero-copy"><Heading as="h1">{t('Engineering and water education')}</Heading><p>{t('AquaNode brings practical engineering and environmental education together: students study the buoy and work with water measurements.')}</p><ArrowLink to="/map">{t('Open the buoy map')}</ArrowLink></div><aside className="about-hero-question"><Heading as="h2">{t('Buoys sent to partners')}</Heading><p>{t('We have sent buoys to partners. We are developing shared observations and teaching materials.')}</p></aside></div></header>
 <section className="about-section about-idea" id="about-idea" aria-labelledby="about-idea-title"><div className="about-idea-layout"><Heading as="h2" id="about-idea-title">{t('Why AquaNode for schools')}</Heading><div className="about-idea-copy"><p className="lead">{t('Building an instrument and working with water measurements connects electronics and natural science with the environment around a school.')}</p><ArrowLink to="/technology">{t('How the buoy works')}</ArrowLink></div></div></section>
 <LearningLab/>
 <section className="about-section about-recognition" aria-labelledby="about-recognition-title"><figure className="about-certificate"><img src={awardCertificate.preview} width="1600" height="1237" alt={t('Youth Innovation Challenge 2026 winner certificate awarded to AquaNode Team by GEEP')} loading="lazy" decoding="async"/><DownloadLink href={awardCertificate.original} label={t('Winner certificate')} format="PNG" detail={t('YIC 2026 · Original certificate')}/></figure><div><SectionLabel icon="award">GEEP / 2026</SectionLabel><Heading as="h2" id="about-recognition-title">{t('Youth Innovation Challenge 2026 winner')}</Heading><ExternalLink href={awardUrl}>{t('Read the GEEP profile')}</ExternalLink></div></section>
 <RelatedLinks items={[{to:'/team',label:'AquaNode team',detail:'People and public contacts'},{to:'/build',label:'Build & documentation',detail:'Revision files and assembly materials'}]}/>
 </div>}
