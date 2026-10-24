import {Link} from 'react-router-dom';
import Heading from '../ui/Heading';
import BrandLogo from '../brand/BrandLogo';
import FlexibleArrow from '../ui/FlexibleArrow';
import {ExternalLink} from '../ui/ActionLinks';
import {nav} from '../../data/content';
import {scrollToPageStart} from '../../shared/navigation/pageScroll';
import LanguageSwitch from '../../features/i18n/LanguageSwitch';
import FooterCurrent from './FooterCurrent';
import {t} from '../../features/i18n/i18n';
export default function SiteFooter({pathname}:{pathname:string}){
  return <footer className="site-footer">
    <div className="footer-invitation"><div><span className="footer-eyebrow">{t('THE NEXT QUESTION STARTS HERE')}</span><Heading as="h2">{t('Keep looking closer.')}</Heading></div><Link className="arrow-link" to="/build">{t('Explore the resources')}<FlexibleArrow direction="up-right"/></Link></div>
    <FooterCurrent/>
    <div className="footer-directory">
      <div className="footer-identity"><Link className="footer-brand" to="/" aria-label={t('AquaNode home')} onClick={event=>{if(location.pathname==='/'){event.preventDefault();scrollToPageStart()}}}><BrandLogo/></Link><p>{t('A small node.')}<br/>{t('A world to understand.')}</p><span>{t('KAZAKHSTAN · 2026')}</span></div>
      <nav aria-label={t('Footer navigation')}><span className="footer-eyebrow">{t('EXPLORE AQUANODE')}</span><div>{nav.map(([path,label],index)=><Link key={path} to={path} className={pathname===path?'active':undefined} aria-current={pathname===path?'page':undefined} onClick={event=>{if(location.pathname===path){event.preventDefault();scrollToPageStart()}}}><span aria-hidden="true">0{index+1}</span>{label}<FlexibleArrow direction="up-right"/></Link>)}</div></nav>
      <div className="footer-return"><button type="button" onClick={scrollToPageStart}>{t('Back to the top')}<FlexibleArrow direction="up"/></button><div><span className="footer-eyebrow">{t('SITE LANGUAGE')}</span><LanguageSwitch/></div></div>
    </div>
    <div className="footer-legal"><span>{t('AquaNode · One prototype. An open-ended possibility.')}</span><span>{t('Ocean audio:')} <ExternalLink href="https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg" inline>Luftrum</ExternalLink> · <ExternalLink href="https://creativecommons.org/licenses/by/3.0/" inline>CC BY 3.0</ExternalLink> · {t('Underwater mix adapted')}</span></div>
  </footer>;
}
