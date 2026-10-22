import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import Heading from './Heading';
import FlexibleArrow from './FlexibleArrow';
import {awardUrl} from './content';
import './about.css';
import {ExternalLink} from './ActionLinks';
import LearningLab from './LearningLab';

function AboutLink({to,children}:{to:string;children:ReactNode}){
  return <Link className="arrow-link" to={to}>{children}<FlexibleArrow direction="up-right"/></Link>;
}

export default function AboutPage(){
  return <div className="about-page">
    <header className="page-intro about-hero">
      <div className="about-hero-top"><p className="kicker">THE PROJECT / A QUESTION WORTH ASKING</p><span>01 PROTOTYPE · AN OPEN BEGINNING</span></div>
      <div className="about-hero-layout"><div className="about-hero-copy">
        <Heading as="h1">Understanding starts with observing.</Heading>
        <p>AquaNode connects hands-on engineering with a long-term ambition: making water observation more accessible.</p>
        <a className="arrow-link" href="#about-idea">Follow the idea<FlexibleArrow direction="down"/></a>
      </div><aside className="about-hero-question"><span>OUR STARTING QUESTION</span><Heading as="h2">What could we learn<br/>if we paid closer<br/><em>attention?</em></Heading><span>A PROJECT FOR CURIOUS MINDS</span></aside></div>
      <div className="about-hero-foot"><span>WATER. CURIOSITY. CONNECTION.</span><span className="about-hero-foot-caption">A small instrument. A longer conversation with the water.</span></div>
    </header>

    <section className="about-section about-idea" id="about-idea" aria-labelledby="about-idea-title">
      <div className="about-section-top"><p className="kicker">01 / THE REASON</p><span>LOOK CLOSER, THEN ASK AGAIN.</span></div>
      <div className="about-idea-layout"><Heading as="h2" id="about-idea-title">The surface only<br/>{' '}tells part of<br/>{' '}<em>the story.</em></Heading><div className="about-idea-copy"><p className="lead">Water can look the same while its conditions change. A measurement gives us another way to pay attention.</p><p>AquaNode is a way into that process: something you can build, inspect and use to ask questions about the water around you.</p><p>The project brings engineering and learning together. Understanding a connection, checking an assumption and recording a result are all part of the experience.</p><AboutLink to="/technology">Meet the instrument</AboutLink></div></div>
    </section>

    <LearningLab/>

    <section className="about-section about-recognition" aria-labelledby="about-recognition-title">
      <div className="about-recognition-seal" aria-hidden="true"><span>✳</span><span>YOUTH INNOVATION<br/>CHALLENGE / 2026</span></div>
      <div><p className="kicker">03 / A SHARED ENCOURAGEMENT</p><Heading as="h2" id="about-recognition-title">A small team.<br/>A recognised idea.</Heading><p>AquaNode won the Youth Innovation Challenge 2026. The recognition is an encouragement to keep building, testing and asking better questions.</p><ExternalLink href={awardUrl}>Read the GEEP profile</ExternalLink><p className="about-recognition-note">The award profile describes the original vision. For current milestones and next steps, <Link to="/journal">visit the project journal →</Link>.</p></div>
    </section>

    <section className="about-section about-next"><p className="kicker">THE PEOPLE BEHIND THE QUESTION</p><Heading as="h2">Curiosity brought us here.<br/><em>Meet who’s behind it.</em></Heading><AboutLink to="/team">Meet the AquaNode team</AboutLink></section>
  </div>;
}
