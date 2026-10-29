import ArchitectureImage from '../../components/ui/ArchitectureImage';
import {t} from '../../features/i18n/i18n';
import {architectureUrl,revision} from '../../data/project';
import Heading from '../../components/ui/Heading';
import SectionLabel from '../../components/ui/SectionLabel';
import {DownloadLink,ExternalIcon} from '../../components/ui/ActionLinks';

export default function DrawingSequence(){
 return <div className="tech-drawing-sequence revb-drawing-sequence">
  <Heading as="h2" id="tech-drawings-title">{t('A bench before the water.')}</Heading>
  <article className="tech-drawing-chapter"><div className="tech-drawing-chapter-label"><SectionLabel as="span" icon="connections">{t('System architecture')}</SectionLabel><span>{revision}</span></div>
   <figure><ArchitectureImage alt={t('R0.3-EC-revB design overview: SEN0244 and DS18B20 connect to XIAO ESP32S3 for planned USB logging. Hardware validation is pending.')} loading="lazy" width="1100" height="620"/><figcaption><span>{t('Design illustration · AquaNode · CC BY 4.0')}</span><a href={architectureUrl} target="_blank" rel="noopener noreferrer">{t('View full-size drawing')}<ExternalIcon/><span className="sr-only">{t('(opens in a new tab)')}</span></a></figcaption></figure>
   <Heading as="h3">{t('Two inputs. One test setup.')}</Heading><p>{t('The architecture links an experimental EC estimate, a temperature input and planned USB capture. It is not a prototype photograph, an electrical schematic or proof of working hardware.')}</p>
  </article>
  <article className="tech-drawing-chapter revb-validation"><div className="tech-drawing-chapter-label"><SectionLabel as="span" icon="check">{t('The checks still ahead')}</SectionLabel><span>{t('NOT A PRODUCTION RELEASE')}</span></div>
   <Heading as="h3">{t('Let measurements test the design.')}</Heading><p>{t('Native ERC/DRC and a current full schematic export are pending. Compile the ESP32 firmware and validate power, ADC behaviour and EC against independent standards before moving towards water tests.')}</p><p className="tech-drawing-caution">{t('Historical R0.3 and EC revA reports are not revB results. The connection-review PDF is not a native schematic export.')}</p>
   <DownloadLink showActionLabel={false} href={architectureUrl} label={t('System architecture')} format="SVG" detail={t('R0.3-EC-revB · Design illustration · CC BY 4.0')}/>
  </article>
 </div>;
}
