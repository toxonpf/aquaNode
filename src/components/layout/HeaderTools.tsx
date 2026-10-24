import {Link} from 'react-router-dom';
import LanguageSwitch from '../../features/i18n/LanguageSwitch';
import FlexibleArrow from '../ui/FlexibleArrow';
import {t} from '../../features/i18n/i18n';

export default function HeaderTools({menu,onMenu}:{menu:boolean;onMenu:()=>void}){
  return <div className="header-tools"><Link className="header-cta" to="/journal">{t('Project progress')}<FlexibleArrow direction="up-right"/></Link><LanguageSwitch/><button className="menu-button" onClick={onMenu} aria-expanded={menu} aria-controls="navigation">{menu?t('Close'):t('Menu')} <span>{menu?'−':'+'}</span></button></div>;
}
