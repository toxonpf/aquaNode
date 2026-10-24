import {t} from '../../features/i18n/i18n';
import Heading from '../../components/ui/Heading';
import {useEffect,useRef,useState,type PointerEvent,type MouseEvent} from 'react';
import {team,awardUrl,type TeamMember,type TeamContact} from '../../data/content';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {ExternalLink,ExternalIcon} from '../../components/ui/ActionLinks';
import {useTeamGalleryFlow} from './useTeamGalleryFlow';
import {useTeamProfileMotion} from './useTeamProfileMotion';
import TeamPortrait from './TeamPortrait';
import TeamCurrent from './TeamCurrent';

function ContactIcon({kind}:{kind:TeamContact['kind']}){
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    {kind==='email'?<><rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="m3 5 7 5.5L17 5"/></>:
      kind==='telegram'?<path d="m2.5 9 15-6-3 14-4.5-4-3 2V11l8-6-10 5z"/>:
      kind==='github'?<><path d="M7 17v-3c-3 .5-3-2-4-2m10 5v-3c0-1-.3-1.5-.8-2 2.8-.3 4.8-1.6 4.8-4.4A4 4 0 0 0 16 5c.2-1 .1-1.9-.3-2.5-1.4 0-2.5.7-3.2 1.2a10 10 0 0 0-5 0C6.8 3.2 5.7 2.5 4.3 2.5 3.9 3.1 3.8 4 4 5a4 4 0 0 0-1 2.6C3 10.4 5 11.7 7.8 12c-.5.5-.8 1-.8 2"/></>:
      <><circle cx="10" cy="10" r="7.5"/><ellipse cx="10" cy="10" rx="3.4" ry="7.5"/><path d="M3 10h14"/></>}
  </svg>;
}

function Contacts({person}:{person:TeamMember}){
  return <div className="team-contacts" role="group" aria-label={t('Contacts for {name}',{name:person.name})}>
    {person.links.length?person.links.map(contact=>contact.url?
      <a className="team-contact" key={contact.kind+contact.label} href={contact.url} target={/^https?:/.test(contact.url)?'_blank':undefined} rel={/^https?:/.test(contact.url)?'noopener noreferrer':undefined}><ContactIcon kind={contact.kind}/>{contact.label}{/^https?:/.test(contact.url)&&<ExternalIcon/>}</a>:
      <span className="team-contact is-pending" key={contact.kind+contact.label} aria-disabled="true" title={t("Contact details to be added")}><ContactIcon kind={contact.kind}/>{contact.label}</span>):
      <span className="team-contact-note">{t("Contact details to follow")}</span>}
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
  const escapeAnimation=useRef<Animation|null>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const person=selected===null?null:team[selected];
  const count=String(team.length).padStart(2,'0');
  const settlePortrait=useTeamGalleryFlow(gallery);
  const meetTeam=(event:MouseEvent<HTMLAnchorElement>)=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!gallery.current)return;
    event.preventDefault();
    gallery.current.focus({preventScroll:true});
    const header=document.querySelector('.site-header')?.getBoundingClientRect().height??64;
    window.scrollTo({top:scrollY+gallery.current.getBoundingClientRect().top-header,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  };
  const {openProfile,closeProfile,changeMember,onClosed}=useTeamProfileMotion({gallery,dialog,selected,setSelected,count:team.length,settlePortrait});
  useEffect(()=>()=>escapeAnimation.current?.cancel(),[]);
  const closeWithEscape=()=>{
    const element=dialog.current,key=element?.querySelector('kbd');
    if(element&&key){
      escapeAnimation.current?.cancel();element.dataset.escapePressed='true';
      const animation=key.animate([
        {transform:'translateY(0)',offset:0},
        {transform:'translateY(3px)',background:'transparent',borderColor:'#e7f2ce',color:'#edf4da',boxShadow:'0 0 0 #42645e',offset:.3},
        {transform:'translateY(3px)',background:'transparent',borderColor:'#e7f2ce',color:'#edf4da',boxShadow:'0 0 0 #42645e',offset:.65},
        {transform:'translateY(0)',offset:1},
      ],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:340,easing:'ease-in-out'});
      escapeAnimation.current=animation;
      animation.finished.then(()=>{if(escapeAnimation.current===animation)delete element.dataset.escapePressed},()=>{});
    }
    closeProfile();
  };
  return <div className="team-page">
    <header className="team-hero">
      <div className="team-hero-top"><span>{t("THE AQUANODE COLLECTIVE")}</span><span>{t("KAZAKHSTAN · A SHARED CURIOSITY")}</span></div>
      <div className="team-hero-heading"><Heading as="h1">{t("People behind")} <br/><span>{t("the node.")}</span></Heading><div className="team-hero-aside"><span className="team-hero-count">{count}<i><FlexibleArrow direction="up-right"/></i></span><p>{t("Different minds.")}<br/>{t("One shared direction.")}</p></div></div>
      <div className="team-hero-bottom"><p>{t("Engineering, observation and a little curiosity.")}<br/>{t("Meet the people moving AquaNode forward.")}</p><a href="#team-gallery" className="team-meet-link" aria-controls="team-gallery" onClick={meetTeam}><span>{t("MEET THE PEOPLE")}</span><FlexibleArrow direction="down"/></a></div>
      <svg className="team-hero-current" viewBox="0 0 900 240" fill="none" aria-hidden="true"><path d="M-30 145C180 310 300-40 510 100S795 270 960 22M-30 172C180 337 300-13 510 127S795 297 960 49M-30 199C180 364 300 14 510 154S795 324 960 76"/></svg>
    </header>
    <section ref={gallery} id="team-gallery" className="team-roster" tabIndex={-1} aria-label={t("Team members and contacts")}>
      <div className="team-gallery-heading"><span>{t("01 / THE PEOPLE")}</span><p>{t("A small team.")}<br/>{t("A world to understand.")}</p><span>{count} {t("MEMBERS")}</span></div>
      <div className="team-gallery-grid">{team.map((member,index)=><article id={'team-card-'+member.slug} className="team-person" key={member.slug} aria-labelledby={'person-'+member.slug}>
        <div className="team-card-top"><span>{String(index+1).padStart(2,'0')} / {count}</span><span>AQUANODE</span></div>
        <button type="button" className="team-portrait-trigger" onClick={event=>openProfile(index,event.currentTarget)} onPointerMove={movePortrait} aria-label={t('View profile of {name}',{name:member.name})} aria-haspopup="dialog" aria-controls="team-profile-dialog">
          <div className="team-portrait-visual"><TeamPortrait person={member} index={index} count={count}/></div><span className="team-portrait-cursor" aria-hidden="true">{t("MEET")}<br/>{member.name.split(' ')[0]} <FlexibleArrow direction="up-right"/></span><span className="team-portrait-open" aria-hidden="true">{t("VIEW PROFILE")} <FlexibleArrow direction="up-right"/></span>
        </button>
        <div className="team-person-info"><Heading as="h2" id={'person-'+member.slug}>{member.name}</Heading><p>{member.role}</p></div>
        <Contacts person={member}/>
        {team[index+1]&&<a className={'team-next-preview team-profile-tone-'+(index+1)} href={'#team-card-'+team[index+1].slug} aria-label={t('Continue to {name}',{name:team[index+1].name})}><span>{t("NEXT /")} {String(index+2).padStart(2,'0')}</span><TeamPortrait person={team[index+1]} index={index+1} count={count} kind="preview"/><FlexibleArrow direction="down"/></a>}
      </article>)}<aside className="team-gallery-note"><span>{t("CURIOUS MINDS.")}<br/>{t("SHARED WATERS.")}</span><FlexibleArrow direction="down"/><p>{t("Meet the founders, engineers")}<br/>{t("and supporters behind the work.")}</p></aside></div>
    </section>
    <section className="team-outro"><span>{t("THE NEXT CHAPTER IS OPEN")}</span><Heading as="h2">{t("It starts with people.")}<br/><em>{t("And a question.")}</em></Heading><ExternalLink className="team-outro-link" href={awardUrl}>{t("Get to know AquaNode")}</ExternalLink></section>
    <dialog ref={dialog} id="team-profile-dialog" className="team-profile-dialog" aria-labelledby="team-profile-name" onClose={onClosed} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();if(!event.repeat)closeWithEscape()}}} onCancel={event=>{event.preventDefault();closeWithEscape()}} onClick={event=>{if(event.target===event.currentTarget)closeProfile()}}>
      {person&&<>
        <button type="button" className="team-dialog-close" aria-label={t('Close')} aria-keyshortcuts="Escape" onClick={closeProfile} autoFocus><span className="team-close-label">{t('Close')}</span><kbd aria-hidden="true">Esc</kbd><span className="team-close-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="m5 5 10 10M15 5 5 15"/></svg></span></button>
        <div className="team-profile-content">
        <div className={'team-profile-portrait team-profile-tone-'+selected}><TeamPortrait key={person.slug} person={person} index={selected!} count={count} kind="profile"/></div>
        <div className="team-profile-info-viewport"><div className="team-profile-info" aria-live="polite">
          <span className="team-profile-kicker">{t("THE AQUANODE COLLECTIVE /")} {String(selected!+1).padStart(2,'0')}</span>
          <Heading as="h2" id="team-profile-name">{person.name}</Heading><p className="team-profile-role">{person.role}</p>
          <p className="team-profile-intro">{t("A shared curiosity about water. A hands-on approach to building the tools that help us understand it.")}</p>
          <span className="team-profile-contact-label">{t("STAY IN TOUCH")}</span><Contacts person={person}/>
          <div className="team-profile-pagination"><TeamCurrent key={person.slug} index={selected!}/><button type="button" onClick={()=>changeMember(-1)} aria-label={t("Previous team member")}><FlexibleArrow direction="left"/><span>{t("← Previous").replace("← ","")}</span></button><span>{String(selected!+1).padStart(2,'0')} / {count}</span><button type="button" onClick={()=>changeMember(1)} aria-label={t("Next team member")}><span>{t("Next →").replace(" →","")}</span><FlexibleArrow/></button></div>
        </div></div>
        </div>
      </>}
    </dialog>
  </div>;
}
