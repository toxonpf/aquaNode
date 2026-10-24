import {t} from '../../features/i18n/i18n';
import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {awardUrl,awardCertificate} from '../../data/content';
import {ExternalLink,DownloadLink} from '../../components/ui/ActionLinks';
import LearningLab from './LearningLab';

function AboutLink({to,children}:{to:string;children:ReactNode}){
  return <Link className="arrow-link" to={to}>{children}<FlexibleArrow direction="up-right"/></Link>;
}

export default function AboutPage(){
  return <div className="about-page">
    <header className="page-intro about-hero">
      <div className="about-hero-top"><p className="kicker">{t("THE PROJECT / A QUESTION WORTH ASKING")}</p><span>{t("01 PROTOTYPE · AN OPEN BEGINNING")}</span></div>
      <div className="about-hero-layout"><div className="about-hero-copy">
        <Heading as="h1">{t("Understanding starts with observing.")}</Heading>
        <p>{t("AquaNode connects hands-on engineering with a long-term ambition: making water observation more accessible.")}</p>
        <a className="arrow-link" href="#about-idea">{t("Follow the idea")}<FlexibleArrow direction="down"/></a>
      </div><aside className="about-hero-question"><span>{t("OUR STARTING QUESTION")}</span><Heading as="h2">{t("What could we learn")}<br/>{t("if we paid closer")}<br/><em>{t("attention?")}</em></Heading><span>{t("A PROJECT FOR CURIOUS MINDS")}</span></aside></div>
      <div className="about-hero-foot"><span>{t("WATER. CURIOSITY. CONNECTION.")}</span><span className="about-hero-foot-caption">{t("A small instrument. A longer conversation with the water.")}</span></div>
    </header>

    <section className="about-section about-idea" id="about-idea" aria-labelledby="about-idea-title">
      <div className="about-section-top"><p className="kicker">{t("01 / THE REASON")}</p><span>{t("LOOK CLOSER, THEN ASK AGAIN.")}</span></div>
      <div className="about-idea-layout"><Heading as="h2" id="about-idea-title">{t("The surface only")}<br/>{' '}{t("tells part of")}<br/>{' '}<em>{t("the story.")}</em></Heading><div className="about-idea-copy"><p className="lead">{t("Water can look the same while its conditions change. A measurement gives us another way to pay attention.")}</p><p>{t("AquaNode is a way into that process: something you can build, inspect and use to ask questions about the water around you.")}</p><p>{t("The project brings engineering and learning together. Understanding a connection, checking an assumption and recording a result are all part of the experience.")}</p><AboutLink to="/technology">{t("Meet the instrument")}</AboutLink></div></div>
    </section>

    <LearningLab/>

    <section className="about-section about-recognition" aria-labelledby="about-recognition-title">
      <figure className="about-certificate"><div className="about-certificate-meta"><span>GEEP / YIC 2026</span><span>{t("WINNER")}</span></div><img src={awardCertificate.preview} width="1600" height="1237" alt={t("Youth Innovation Challenge 2026 winner certificate awarded to AquaNode Team by GEEP")} loading="lazy" decoding="async"/><figcaption>{t("Recognition from the Global Environmental Education Partnership.")}</figcaption><DownloadLink href={awardCertificate.original} label={t("Winner certificate")} format="PNG" detail={t("YIC 2026 · Original certificate")}/></figure>
      <div><p className="kicker">{t("03 / A SHARED ENCOURAGEMENT")}</p><Heading as="h2" id="about-recognition-title">{t("A small team.")}<br/>{t("A recognised idea.")}</Heading><p>{t("AquaNode won the Youth Innovation Challenge 2026. The recognition is an encouragement to keep building, testing and asking better questions.")}</p><ExternalLink href={awardUrl}>{t("Read the GEEP profile")}</ExternalLink><p className="about-recognition-note">{t("The award profile describes the original vision. For current milestones and next steps,")} <Link to="/journal">{t("visit the project journal →").replace(" →","")}<FlexibleArrow direction="up-right"/></Link>.</p></div>
    </section>

    <section className="about-section about-next"><p className="kicker">{t("THE PEOPLE BEHIND THE QUESTION")}</p><Heading as="h2">{t("Curiosity brought us here.")}<br/><em>{t("Meet who’s behind it.")}</em></Heading><AboutLink to="/team">{t("Meet the AquaNode team")}</AboutLink></section>
  </div>;
}
