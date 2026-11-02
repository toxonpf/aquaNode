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
   <figure><ArchitectureImage alt={t("revC design overview: SEN0244 EC, DS18B20 temperature and SEN0169-V2 pH through DFR0504 and ADS1115 feed a planned XIAO ESP32S3 USB bench. Hardware validation is pending.")} loading="lazy" width="1100" height="620"/><figcaption><span>{t('Design illustration · AquaNode · CC BY 4.0')}</span><a href={architectureUrl} target="_blank" rel="noopener noreferrer">{t('View full-size drawing')}<ExternalIcon/><span className="sr-only">{t('(opens in a new tab)')}</span></a></figcaption></figure>
   <Heading as="h3">{t("Three inputs. One bench configuration.")}</Heading><p>{t("The architecture adds isolated pH with a separate bench supply to experimental EC, temperature and USB capture. It is a design illustration, not an electrical schematic or proof of working hardware.")}</p>
  </article>
  <article className="tech-drawing-chapter revb-validation"><div className="tech-drawing-chapter-label"><SectionLabel as="span" icon="check">{t('The checks still ahead')}</SectionLabel><span>{t('NOT A PRODUCTION RELEASE')}</span></div>
   <Heading as="h3">{t('Let measurements test the design.')}</Heading><p>{t("Native ERC/DRC and a current full schematic export are pending. Complete the ESP32 build, validate power and both ADC paths, calibrate the entire pH chain and test EC+pH together before field use.")}</p><p className="tech-drawing-caution">{t("Historical native checks for R0.3 do not validate revC. The revC source comparison and presentation simulation are separate from KiCad checks and physical measurements.")}</p>
   <DownloadLink showActionLabel={false} href={architectureUrl} label={t('System architecture')} format="SVG" detail={t("R0.3-EC-pH-revC · Design illustration · CC BY 4.0")}/>
  </article>
 </div>;
}
