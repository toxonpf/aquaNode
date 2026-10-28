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
    <div className="footer-invitation"><Heading as="h2">{t('Keep observing.')}</Heading><Link className="arrow-link" to="/build">{t('Explore the resources')}<FlexibleArrow direction="up-right"/></Link></div>
    <FooterCurrent/>
    <div className="footer-directory">
      <div className="footer-identity"><Link className="footer-brand" to="/" aria-label={t('AquaNode home')} onClick={event=>{if(location.pathname==='/'){event.preventDefault();scrollToPageStart()}}}><BrandLogo/></Link><span>{t('KAZAKHSTAN · 2026')}</span></div>
      <nav aria-label={t('Footer navigation')}><div>{[...nav,['/map',t('Observation map')]].map(([path,label],index)=><Link key={path} to={path} className={pathname===path?'active':undefined} aria-current={pathname===path?'page':undefined} onClick={event=>{if(location.pathname===path){event.preventDefault();scrollToPageStart()}}}><span className="footer-nav-number" aria-hidden="true">0{index+1}</span><span className="footer-nav-label">{label}</span><FlexibleArrow direction="up-right"/></Link>)}</div></nav>
      <div className="footer-return"><button type="button" onClick={scrollToPageStart}>{t('Back to the top')}<FlexibleArrow direction="up"/></button><LanguageSwitch/></div>
    </div>
    <div className="footer-legal"><span>© 2026 AquaNode</span><details className="footer-credits"><summary>{t('Credits & sound')}</summary><p>{t('Ocean audio:')} <ExternalLink href="https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg" inline>Luftrum</ExternalLink> · <ExternalLink href="https://creativecommons.org/licenses/by/3.0/" inline>CC BY 3.0</ExternalLink><br/>{t('Underwater mix adapted')}</p></details></div>
  </footer>;
}
