import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import Heading from '../../components/ui/Heading';
import MapEmbed from '../map/MapEmbed';
export function FutureNetwork(){return <section className="section future-section future-atlas" aria-labelledby="future-title">
 <div className="feature-section-top"><SectionLabel icon="map">{t('Buoy map')}</SectionLabel></div>
 <div className="future-heading"><Heading as="h2" id="future-title">{t('Buoys with our partners')}</Heading><p>{t('The map shows the regions associated with buoys sent for collaborative work. Select a region for its status and available sources.')}</p></div>
 <div className="future-workbench"><MapEmbed/></div>
 <div className="future-bottom"><p>{t('Approximate regional locations')}</p></div>
 </section>}
