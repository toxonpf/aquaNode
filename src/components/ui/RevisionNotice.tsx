import {t,useLocale,localeFormat} from '../../features/i18n/i18n';
import {revision,revisionDate} from '../../data/project';
import {SectionIcon} from './SectionLabel';

export default function RevisionNotice(){
 const locale=useLocale();
 const date=new Intl.DateTimeFormat(localeFormat(locale),{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${revisionDate}T00:00:00Z`));
 return <aside className="revision-notice" aria-label={t('Current engineering revision')}>
  <div className="revision-notice-layout">
   <span className="revision-notice-mark" aria-hidden="true"><SectionIcon theme="circuit"/></span>
   <div className="revision-notice-copy"><strong>{t('Engineering development')}</strong><p>{t('Hardware validation pending')}</p></div>
   <div className="revision-notice-meta"><span className="revision-notice-version">{revision}</span><span><time dateTime={revisionDate}>{date}</time><span className="revision-notice-scope">{t('Freshwater only')}</span></span></div>
  </div>
 </aside>;
}
