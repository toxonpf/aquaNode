import {Link} from 'react-router-dom';
import {t} from '../../features/i18n/i18n';
import FlexibleArrow from './FlexibleArrow';
export default function RelatedLinks({items}:{items:Array<{to:string;label:string;detail:string}>}){
 return <nav className="related-links" aria-label={t('Continue with AquaNode')}>{items.map(item=><Link key={item.to} to={item.to}><span><strong>{t(item.label)}</strong><small>{t(item.detail)}</small></span><FlexibleArrow direction="up-right"/></Link>)}</nav>;
}
