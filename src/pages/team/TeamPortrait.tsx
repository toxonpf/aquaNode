import {useState} from 'react';
import type {TeamMember} from '../../data/content';
import {t} from '../../features/i18n/i18n';
import PortraitCurrent from './PortraitCurrent';

/** One visual for the gallery, full profile and return flight. */
export default function TeamPortrait({person,index,count,kind='card'}:{person:TeamMember;index:number;count:string;kind?:'card'|'profile'|'preview'}){
  const image=kind==='profile'?person.profilePhoto??person.photo:person.photo??person.profilePhoto;
  const [failed,setFailed]=useState<string|null>(null);
  const initials=person.name.split(' ').map(part=>part[0]).slice(0,2).join('');
  const hasPhoto=Boolean(image&&failed!==image);
  return <figure className={'team-portrait team-member-portrait'+(hasPhoto?` team-profile-image-portrait team-profile-image-portrait--${person.slug}${kind==='card'?' team-card-photo':''}`:'')} data-portrait-kind={kind}>
    {hasPhoto?<>
      <img src={image!} alt={person.name} loading={kind==='profile'?'eager':'lazy'} decoding="async" onError={()=>setFailed(image!)}/>
      <PortraitCurrent slug={person.slug}/>
      <span className="team-profile-photo-label">{t('AQUANODE / PROJECT FRAME')}</span><span className="team-profile-photo-index">{String(index+1).padStart(2,'0')} / {count}</span><span className="team-profile-photo-monogram" aria-hidden="true">{initials}</span>
    </>:<div className="team-portrait-placeholder" role="img" aria-label={t('Portrait placeholder for {name}',{name:person.name})}>
      <span className="team-monogram" aria-hidden="true">{initials}</span>
      <svg viewBox="0 0 400 500" fill="none" aria-hidden="true"><g>
        <path d="M-70 265C40 15 125 18 152 155S280 325 470 112"/><path d="M-70 300C40 50 125 53 152 190S280 360 470 147"/><path d="M-70 335C40 85 125 88 152 225S280 395 470 182"/><path d="M-70 370C40 120 125 123 152 260S280 430 470 217"/><path d="M-70 405C40 155 125 158 152 295S280 465 470 252"/>
      </g><circle cx="278" cy="141" r="38"/><circle cx="278" cy="141" r="57"/></svg>
      <span className="team-portrait-label">{t('AQUANODE / PORTRAIT TO COME')}</span>
    </div>}
  </figure>;
}
