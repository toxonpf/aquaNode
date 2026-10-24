import {changeLocale,useLocale,t} from './i18n';
export default function LanguageSwitch(){
  const locale=useLocale();
  return <div className="language-switch" data-locale={locale} role="group" aria-label={t('Site language')}>
    <button type="button" lang="ru" aria-label="Русский" aria-pressed={locale==='ru'} onClick={()=>changeLocale('ru')}>RU</button>
    <button type="button" lang="en" aria-label="English" aria-pressed={locale==='en'} onClick={()=>changeLocale('en')}>EN</button>
  </div>;
}
