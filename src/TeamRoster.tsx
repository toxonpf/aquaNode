import Heading from './Heading';
import {useRef,useState,type PointerEvent} from 'react';
import {team,awardUrl,type TeamMember,type TeamContact} from './content';
import FlexibleArrow from './FlexibleArrow';
import './team.css';
import {ExternalLink,ExternalIcon} from './ActionLinks';
import {useTeamGalleryFlow} from './useTeamGalleryFlow';
import {useTeamProfileMotion} from './useTeamProfileMotion';

function ContactIcon({kind}:{kind:TeamContact['kind']}){
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    {kind==='email'?<><rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="m3 5 7 5.5L17 5"/></>:
      kind==='telegram'?<path d="m2.5 9 15-6-3 14-4.5-4-3 2V11l8-6-10 5z"/>:
      kind==='github'?<><path d="M7 17v-3c-3 .5-3-2-4-2m10 5v-3c0-1-.3-1.5-.8-2 2.8-.3 4.8-1.6 4.8-4.4A4 4 0 0 0 16 5c.2-1 .1-1.9-.3-2.5-1.4 0-2.5.7-3.2 1.2a10 10 0 0 0-5 0C6.8 3.2 5.7 2.5 4.3 2.5 3.9 3.1 3.8 4 4 5a4 4 0 0 0-1 2.6C3 10.4 5 11.7 7.8 12c-.5.5-.8 1-.8 2"/></>:
      <><circle cx="10" cy="10" r="7.5"/><ellipse cx="10" cy="10" rx="3.4" ry="7.5"/><path d="M3 10h14"/></>}
  </svg>;
}

function Portrait({person}:{person:TeamMember}){
  const [failed,setFailed]=useState(false);
  const initials=person.name.split(' ').map(part=>part[0]).slice(0,2).join('');
  return <figure className="team-portrait">
    {person.photo&&!failed?<img src={person.photo} alt={person.name} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<div className="team-portrait-placeholder" role="img" aria-label={`Portrait placeholder for ${person.name}`}>
      <span className="team-monogram" aria-hidden="true">{initials}</span>
      <svg viewBox="0 0 400 500" fill="none" aria-hidden="true"><g>
        <path d="M-70 265C40 15 125 18 152 155S280 325 470 112"/>
        <path d="M-70 300C40 50 125 53 152 190S280 360 470 147"/>
        <path d="M-70 335C40 85 125 88 152 225S280 395 470 182"/>
        <path d="M-70 370C40 120 125 123 152 260S280 430 470 217"/>
        <path d="M-70 405C40 155 125 158 152 295S280 465 470 252"/>
      </g><circle cx="278" cy="141" r="38"/><circle cx="278" cy="141" r="57"/></svg>
      <span className="team-portrait-label">AQUANODE / PORTRAIT TO COME</span>
    </div>}
  </figure>;
}

function Contacts({person}:{person:TeamMember}){
  return <div className="team-contacts" role="group" aria-label={`Contacts for ${person.name}`}>
    {person.links.length?person.links.map(contact=>contact.url?
      <a className="team-contact" key={contact.kind+contact.label} href={contact.url} target={/^https?:/.test(contact.url)?'_blank':undefined} rel={/^https?:/.test(contact.url)?'noopener noreferrer':undefined}><ContactIcon kind={contact.kind}/>{contact.label}{/^https?:/.test(contact.url)&&<ExternalIcon/>}</a>:
      <span className="team-contact is-pending" key={contact.kind+contact.label} aria-disabled="true" title="Contact details to be added"><ContactIcon kind={contact.kind}/>{contact.label}</span>):
      <span className="team-contact-note">Contact details to follow</span>}
  </div>;
}

function movePortrait(event:PointerEvent<HTMLButtonElement>){
  if(event.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rect=event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--pointer-x',`${event.clientX-rect.left}px`);
  event.currentTarget.style.setProperty('--pointer-y',`${event.clientY-rect.top}px`);
}

export default function TeamRoster(){
  const gallery=useRef<HTMLElement>(null),dialog=useRef<HTMLDialogElement>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const person=selected===null?null:team[selected];
  const count=String(team.length).padStart(2,'0');
  useTeamGalleryFlow(gallery);
  const {openProfile,closeProfile,changeMember,onClosed}=useTeamProfileMotion({gallery,dialog,selected,setSelected,count:team.length});
  return <div className="team-page">
    <header className="team-hero">
      <div className="team-hero-top"><span>THE AQUANODE COLLECTIVE</span><span>KAZAKHSTAN · A SHARED CURIOSITY</span></div>
      <div className="team-hero-heading"><Heading as="h1">People behind <br/><span>the node.</span></Heading><div className="team-hero-aside"><span className="team-hero-count">{count}<i>↗</i></span><p>Different minds.<br/>One shared direction.</p></div></div>
      <div className="team-hero-bottom"><p>Engineering, observation and a little curiosity.<br/>Meet the people moving AquaNode forward.</p><a href="#team-gallery" className="team-meet-link">MEET THE PEOPLE <FlexibleArrow direction="down"/></a></div>
      <svg className="team-hero-current" viewBox="0 0 900 240" fill="none" aria-hidden="true"><path d="M-30 145C180 310 300-40 510 100S795 270 960 22M-30 172C180 337 300-13 510 127S795 297 960 49M-30 199C180 364 300 14 510 154S795 324 960 76"/></svg>
    </header>
    <section ref={gallery} id="team-gallery" className="team-roster" aria-label="Team members and contacts">
      <div className="team-gallery-heading"><span>01 / THE PEOPLE</span><p>A small team.<br/>A world to understand.</p><span>{count} MEMBERS</span></div>
      <div className="team-gallery-grid">{team.map((member,index)=><article id={'team-card-'+member.slug} className="team-person" key={member.slug} aria-labelledby={'person-'+member.slug}>
        <div className="team-card-top"><span>{String(index+1).padStart(2,'0')} / {count}</span><span>AQUANODE</span></div>
        <button type="button" className="team-portrait-trigger" onClick={event=>openProfile(index,event.currentTarget)} onPointerMove={movePortrait} aria-label={`View profile of ${member.name}`} aria-haspopup="dialog" aria-controls="team-profile-dialog">
          <div className="team-portrait-visual"><Portrait person={member}/></div><span className="team-portrait-cursor" aria-hidden="true">MEET<br/>{member.name.split(' ')[0]} <span>↗</span></span><span className="team-portrait-open" aria-hidden="true">VIEW PROFILE <span>↗</span></span>
        </button>
        <div className="team-person-info"><Heading as="h2" id={'person-'+member.slug}>{member.name}</Heading><p>{member.role}</p></div>
        <Contacts person={member}/>
        {team[index+1]&&<a className={'team-next-preview team-profile-tone-'+(index+1)} href={'#team-card-'+team[index+1].slug} aria-label={`Continue to ${team[index+1].name}`}><span>NEXT / {String(index+2).padStart(2,'0')}</span><Portrait person={team[index+1]}/><span aria-hidden="true">↓</span></a>}
      </article>)}<aside className="team-gallery-note"><span>CURIOUS MINDS.<br/>SHARED WATERS.</span><FlexibleArrow direction="down"/><p>Meet the founders, engineers<br/>and supporters behind the work.</p></aside></div>
    </section>
    <section className="team-outro"><span>THE NEXT CHAPTER IS OPEN</span><Heading as="h2">It starts with people.<br/><em>And a question.</em></Heading><ExternalLink className="team-outro-link" href={awardUrl}>Get to know AquaNode</ExternalLink></section>
    <dialog ref={dialog} id="team-profile-dialog" className="team-profile-dialog" aria-labelledby="team-profile-name" onClose={onClosed} onCancel={event=>{event.preventDefault();closeProfile()}} onClick={event=>{if(event.target===event.currentTarget)closeProfile()}}>
      {person&&<>
        <button type="button" className="team-dialog-close" onClick={closeProfile} autoFocus>CLOSE <span aria-hidden="true">×</span></button>
        <div className="team-profile-content">
        <div className={'team-profile-portrait team-profile-tone-'+selected}><Portrait key={person.slug} person={person}/></div>
        <div className="team-profile-info-viewport"><div className="team-profile-info" aria-live="polite">
          <span className="team-profile-kicker">THE AQUANODE COLLECTIVE / {String(selected!+1).padStart(2,'0')}</span>
          <Heading as="h2" id="team-profile-name">{person.name}</Heading><p className="team-profile-role">{person.role}</p>
          {person.profilePhoto&&<figure className={`team-profile-field-photo team-profile-field-photo--${person.slug}`}>
            <img src={person.profilePhoto} alt={`${person.name} during a project moment`} loading="eager" decoding="async"/>
            <span className="team-profile-field-index" aria-hidden="true"><b>{String(selected!+1).padStart(2,'0')}</b><span>PROJECT<br/>FRAME</span></span>
            <svg className="team-profile-photo-current" viewBox="0 0 180 220" fill="none" aria-hidden="true"><path d="M-8 168C22 145 39 177 65 150S103 105 126 125 155 141 188 67"/><circle cx="126" cy="125" r="3"/></svg>
            <figcaption><span>AN OBSERVATION</span><span>{String(selected!+1).padStart(2,'0')} / {count}</span></figcaption>
          </figure>}
          <p className="team-profile-intro">A shared curiosity about water. A hands-on approach to building the tools that help us understand it.</p>
          <span className="team-profile-contact-label">STAY IN TOUCH</span><Contacts person={person}/>
          <div className="team-profile-pagination"><button type="button" onClick={()=>changeMember(-1)} aria-label="Previous team member">← Previous</button><span>{String(selected!+1).padStart(2,'0')} / {count}</span><button type="button" onClick={()=>changeMember(1)} aria-label="Next team member">Next →</button></div>
        </div></div>
        </div>
      </>}
    </dialog>
  </div>;
}
