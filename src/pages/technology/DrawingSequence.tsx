import {t} from '../../features/i18n/i18n';
import Heading from '../../components/ui/Heading';
import SectionLabel from '../../components/ui/SectionLabel';
import {DownloadLink,ExternalIcon} from '../../components/ui/ActionLinks';

export default function DrawingSequence(){
 const drawings=[
  {name:t('Assembly'),src:'/assets/Assembly.png',alt:t('Original R0.3 component placement drawing'),title:t('Room to fit, room to service.'),copy:t('The carrier reserves the module footprint and an extra 4 mm below it for access to the battery connections. R0.3 moves C17 and C18 beside the module area to keep that space clear.'),note:t('The drawing marks connector polarity and the USB end. Actual module height, cable clearance and enclosure fit still need a physical check.')},
  {name:t('Copper layout'),src:'/assets/PCB_F.png',alt:t('Original R0.3 front copper and silkscreen drawing'),title:t('A considered path for power.'),copy:t('The power components are grouped around a short switching path. Ground stitching joins the copper areas on both layers; the release notes record 71 ground vias.'),note:t('Layout checks document the design. They do not replace measurements of supply ripple, startup behaviour or the analog input on a physical board.')},
 ];
 return <div className="tech-drawing-sequence">
  <Heading as="h2">{t('Space for')} <em>{t('every connection.')}</em></Heading>
  {drawings.map((drawing,index)=><article key={drawing.src} className="tech-drawing-chapter">
   <div className="tech-drawing-chapter-label"><SectionLabel as="span" icon={index===0?'assembly':'circuit'}>{drawing.name}</SectionLabel><span>R0.3</span></div>
   <figure><img src={drawing.src} alt={drawing.alt} loading="lazy"/><figcaption><span>80 × 60 mm</span><a href={drawing.src} target="_blank" rel="noopener noreferrer">{t('View full-size drawing')}<ExternalIcon/><span className="sr-only">{t('(opens in a new tab)')}</span></a></figcaption></figure>
   <Heading as="h3">{drawing.title}</Heading><p>{drawing.copy}</p><p className="tech-drawing-caution">{drawing.note}</p>
  </article>)}
  <DownloadLink href="/resources/Assembly.svg" label={t('Assembly drawing')} format="SVG" detail={t('R0.3 · Original engineering drawing')}/>
 </div>;
}
