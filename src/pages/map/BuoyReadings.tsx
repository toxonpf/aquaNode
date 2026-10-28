import {exampleFor,type Buoy} from './data';
import {useMapCopy} from './copy';

export default function BuoyReadings({buoy,period}:{buoy:Buoy;period:string}){
  const {text}=useMapCopy(),example=exampleFor(buoy,period);
  return <section className="atlas-example" id="atlas-example" aria-label={text('Simulated buoy readings','Моделируемые показания буйка')}>
    <div className="atlas-example-heading"><span>{text('SIMULATED EXAMPLE','МОДЕЛИРУЕМЫЙ ПРИМЕР')}</span><b>{buoy.id}</b></div>
    <p>{example.kind==='station'?text(`Reference: nearest station ${example.station!.id}. Calculated from its record for the selected period.`,`База: ближайшая станция ${example.station!.id}. Расчёт по её записи за выбранный период.`):text('Independent demo baseline for this region. No Taiwan station data is used.','Отдельная демонстрационная база для этого региона. Данные станций Тайваня не используются.')}</p>
    {example.readings.length?<table><caption className="sr-only">{text('Baseline, simulated value and relative deviation','Базовое значение, расчёт и относительное отклонение')}</caption><thead><tr><th scope="col">{text('Parameter','Параметр')}</th><th scope="col">{text('Baseline','База')}</th><th scope="col">{text('Buoy','Буй')}</th><th scope="col">{text('Diff.','Откл.')}</th></tr></thead><tbody>{example.readings.map(reading=><tr key={reading.key} data-reading={reading.key} data-deviation={reading.deviation}><th scope="row">{reading.key==='ph'?'pH':text('Temp.','Темп.')} {reading.key==='temperature'&&<small>°C</small>}</th><td>{reading.reference}</td><td>{reading.value}</td><td>{reading.deviation>0?'+':''}{reading.deviation.toFixed(1)}%</td></tr>)}</tbody></table>:<p role="status">{text('No station value in this period to calculate a preview.','В этом периоде нет значения станции для расчёта примера.')}</p>}
    <p className="atlas-example-disclaimer">{text('Calculated deviation from the baseline ≤ 5%. These are not field measurements.','Расчётное отклонение от базы ≤ 5%. Это не полевые измерения.')}</p>
  </section>;
}
