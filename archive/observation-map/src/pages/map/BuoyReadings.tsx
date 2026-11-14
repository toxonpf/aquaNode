import {t} from '../../features/i18n/i18n';
import {ExternalLink} from '../../components/ui/ActionLinks';
import {exampleFor,type Buoy} from './data';
export default function BuoyReadings({buoy,period}:{buoy:Buoy;period:string}){
 const example=exampleFor(buoy,period);
 return <section className="atlas-example" aria-label={t('Calculation example')}>
  <div className="atlas-example-heading"><strong>{t('Calculation example')}</strong><span>{buoy.id}</span></div>
  <p>{t('These values are calculated examples within 5% of the source value, not buoy measurements. The source observation date is retained.')}</p>
  {example.readings.length?<dl>{example.readings.map(reading=><div className="atlas-example-row" key={reading.key}><dt>{t(reading.key==='ph'?'Acidity':'Temperature')}</dt><dd><strong>{reading.value}{reading.key==='temperature'?' °C':''}</strong><br/>{t('Reference value')}: {reading.reference} · {t('Generated offset')}: {reading.deviation.toFixed(2)}%</dd></div>)}</dl>:<p>{t('No numeric source value for this example.')}</p>}
  <p className="atlas-example-source"><b>{t('Source observation')}</b><br/>{t(example.source.observation)}<br/>{example.source.label}</p>
  {buoy.region==='hawaii'&&<p>{t('Maui regional averages are used as a comparison reference; they are not measurements at these Honolulu map positions.')}</p>}
  {buoy.region==='aktau'&&<p>{t('The Aktau source provides pH. No temperature value is added without a matching source.')}</p>}
  <ExternalLink href={example.source.url} inline>{t(example.kind==='regional'?'Regional reference':'Original station dataset')}</ExternalLink>
 </section>;
}
