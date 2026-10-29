import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {awardUrl,awardCertificate} from '../../data/content';
import {ExternalLink,DownloadLink} from '../../components/ui/ActionLinks';
import LearningLab from './LearningLab';
import RevisionNotice from '../../components/ui/RevisionNotice';

function AboutLink({to,children}:{to:string;children:ReactNode}){
  return <Link className="arrow-link" to={to}>{children}<FlexibleArrow direction="up-right"/></Link>;
}

export default function AboutPage(){
  return <div className="about-page">
    <header className="page-intro about-hero">
      <div className="about-hero-top"><SectionLabel icon="idea">{t("THE PROJECT / A QUESTION WORTH ASKING")}</SectionLabel><span>{t("Freshwater learning project")}</span></div>
      <div className="about-hero-layout"><div className="about-hero-copy">
        <Heading as="h1">{t("From the classroom to the shoreline.")}</Heading>
        <p>{t("AquaNode is a project for an affordable educational freshwater buoy. We want students to build hardware with guidance, work with readings and learn to test their environmental conclusions.")}</p>
        <RevisionNotice/>
        <a className="arrow-link" href="#about-idea">{t("Follow the idea")}<FlexibleArrow direction="down"/></a>
      </div><aside className="about-hero-question"><span>{t("OUR STARTING QUESTION")}</span><Heading as="h2">{t('What if students could measure the change themselves?')}</Heading><span>{t("A PROJECT FOR CURIOUS MINDS")}</span></aside></div>
      <div className="about-hero-foot"><span>{t("WATER. CURIOSITY. CONNECTION.")}</span><span className="about-hero-foot-caption">{t("A small instrument. A longer conversation with the water.")}</span></div>
    </header>

    <section className="about-section about-idea" id="about-idea" aria-labelledby="about-idea-title">
      <div className="about-section-top"><SectionLabel icon="search">{t("01 / THE REASON")}</SectionLabel><span>{t("LOOK CLOSER, THEN ASK AGAIN.")}</span></div>
      <div className="about-idea-layout"><Heading as="h2" id="about-idea-title">{t("The surface only")}<br/>{' '}{t("tells part of")}<br/>{' '}<em>{t("the story.")}</em></Heading><div className="about-idea-copy"><p className="lead">{t("The monitoring gap: a river, lake or coastline can change while communities have too few measurements to understand what is happening.")}</p><p>{t("The learning gap: students study climate, water and electronics in class, while those same questions unfold outside their school.")}</p><p>{t("AquaNode connects these two needs through a planned learning journey: understand the instrument, compare observations and explain what the evidence supports.")}</p><AboutLink to="/technology">{t("Meet the instrument")}</AboutLink></div></div>
    </section>

    <LearningLab/>

    <section className="about-section about-school-pilot" aria-labelledby="school-pilot-title">
      <div className="about-section-top"><SectionLabel icon="network">{t('NEXT / THE SCHOOL PILOT')}</SectionLabel><span>{t('INITIAL TARGETS')}</span></div>
      <div className="school-pilot-heading"><Heading as="h2" id="school-pilot-title">{t('One school. One monitoring point.')}</Heading><p>{t("The presentation sets a future direction: school groups investigating their local freshwater shorelines. Engineering validation comes before a field pilot.")}</p></div>
      <dl className="school-pilot-targets">{[['10',t("School participation goal")],['500+',t("Student participation goal")],[t('50+ km'),t("Freshwater shoreline goal")]].map(([value,label])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="school-pilot-foot"><p>{t("These are presentation goals, not verified participation or deployed monitoring coverage. The revB package does not confirm a field pilot.")}</p><AboutLink to="/build#assembly-guide">{t('Prepare the learning activity')}</AboutLink></div>
    </section>

    <section className="about-section about-recognition" aria-labelledby="about-recognition-title">
      <figure className="about-certificate"><div className="about-certificate-meta"><span>GEEP / YIC 2026</span><span>{t("WINNER")}</span></div><img src={awardCertificate.preview} width="1600" height="1237" alt={t("Youth Innovation Challenge 2026 winner certificate awarded to AquaNode Team by GEEP")} loading="lazy" decoding="async"/><figcaption>{t("Recognition from the Global Environmental Education Partnership.")}</figcaption><DownloadLink href={awardCertificate.original} label={t("Winner certificate")} format="PNG" detail={t("YIC 2026 · Original certificate")}/></figure>
      <div><SectionLabel icon="award">{t("03 / A SHARED ENCOURAGEMENT")}</SectionLabel><Heading as="h2" id="about-recognition-title">{t("A small team.")}<br/>{t("A recognised idea.")}</Heading><p>{t("AquaNode won the Youth Innovation Challenge 2026. The recognition is an encouragement to keep building, testing and asking better questions.")}</p><ExternalLink href={awardUrl}>{t("Read the GEEP profile")}</ExternalLink><p className="about-recognition-note">{t("The award profile describes the original vision. For current milestones and next steps,")} <Link to="/journal">{t("visit the project journal →").replace(" →","")}<FlexibleArrow direction="up-right"/></Link>.</p></div>
    </section>

    <section className="about-section about-next"><SectionLabel icon="people">{t("THE PEOPLE BEHIND THE QUESTION")}</SectionLabel><Heading as="h2">{t("Curiosity brought us here.")}<br/><em>{t("Meet who’s behind it.")}</em></Heading><AboutLink to="/team">{t("Meet the AquaNode team")}</AboutLink></section>
  </div>;
}
