import ArchitectureImage from '../../components/ui/ArchitectureImage';
import {t} from '../../features/i18n/i18n';
import {architectureUrl} from '../../data/project';
import Heading from '../../components/ui/Heading';
import {DownloadLink,ExternalIcon} from '../../components/ui/ActionLinks';
export default function DrawingSequence(){return <div className="tech-drawing-sequence revb-drawing-sequence">
 <Heading as="h2" id="tech-drawings-title">{t('revC architecture')}</Heading>
 <article className="tech-drawing-chapter"><figure><ArchitectureImage alt={t('Functional diagram of revC')} loading="lazy"/><figcaption><span>{t('Functional diagram; not for PCB fabrication.')}</span><a href={architectureUrl} target="_blank" rel="noopener noreferrer">{t('View full-size drawing')}<ExternalIcon/></a></figcaption></figure><DownloadLink showActionLabel={false} href={architectureUrl} label={t('System architecture')} format="SVG" detail={t('Design illustration · AquaNode · CC BY 4.0')}/></article>
 <article className="tech-drawing-chapter revb-validation"><Heading as="h3">{t('Completed revC checks')}</Heading><p>{t('18 Python tests passed on synthetic inputs. Source comparisons cover 166 schematic pins and 139 PCB pads.')}</p><Heading as="h3">{t('Before revC hardware testing')}</Heading><p>{t('Complete the ESP32 build and native ERC/DRC, then check power, both ADC paths, calibration and joint EC+pH operation.')}</p><a className="arrow-link" href="/journal#revc-checks">{t('Development journal')}</a></article>
 </div>}
