import {localeFormat} from '../../features/i18n/i18n';
import {useMapCopy} from './copy';
import {periods,taiwanComparison} from './data';
import Heading from '../../components/ui/Heading';

export default function TaiwanComparison({period,onPeriodChange}:{period:string;onPeriodChange:(period:string)=>void}){
  const {text,locale}=useMapCopy();
  const report=taiwanComparison(period);
  const number=new Intl.NumberFormat(localeFormat(locale),{minimumFractionDigits:2,maximumFractionDigits:2});
  const percent=(value:number|null)=>value===null?'—':`${number.format(value)}%`;
  const quarter=(value:string)=>locale==='zh-TW'?`${value.slice(0,4)}年 · 第${value.slice(-1)}季`:`${value.slice(0,4)} · ${text('Q','кв. ')}${value.slice(-1)}`;
  return <section className="atlas-comparison" aria-labelledby="atlas-comparison-title">
    <div className="atlas-comparison-intro">
      <span>{text('TAIWAN / SIMULATED COMPARISON','ТАЙВАНЬ / РАСЧЁТНОЕ СРАВНЕНИЕ','台灣 / 模擬比較')}</span>
      <Heading as="h2" id="atlas-comparison-title">{text('Mean deviation from nearby stations','Среднее отклонение от ближайших станций','與鄰近站點的平均差異')}</Heading>
      <label className="atlas-field">{text('COMPARISON PERIOD','ПЕРИОД СРАВНЕНИЯ','比較期間')}
        <select value={period} onChange={event=>onPeriodChange(event.target.value)}>{periods.map(value=><option key={value} value={value}>{quarter(value)}</option>)}</select>
      </label>
    </div>
    <div className="atlas-comparison-results" aria-live="polite" aria-atomic="true">
      <dl>
        <div className="atlas-comparison-total"><dt>{text('All available pairs','Все доступные пары','所有可用配對')}</dt><dd data-comparison-mean={report.mean??undefined}>{percent(report.mean)}</dd></div>
        {report.metrics.map(metric=><div key={metric.key}><dt>{metric.key==='ph'?'pH':text('Temperature','Температура','溫度')}</dt><dd data-comparison-metric={metric.key}>{percent(metric.mean)}</dd></div>)}
      </dl>
      <p>{text(`${report.buoyCount} of ${report.totalBuoys} Taiwan buoys · ${report.pairCount} buoy–station value pairs in the selected quarter.`,`${report.buoyCount} из ${report.totalBuoys} буйков Тайваня · ${report.pairCount} пар значений «буй — станция» за выбранный квартал.`,`所選季度涵蓋 ${report.totalBuoys} 個台灣浮標中的 ${report.buoyCount} 個，共 ${report.pairCount} 組浮標與站點數值配對。`)}</p>
      <p className="atlas-comparison-note">{text('Calculated from simulated buoy examples and the station archive: mean of |buoy − station| / |station| × 100% across temperature and pH. Missing, censored and zero-reference values are excluded. This is not measured accuracy or a revC test result.','Расчёт по смоделированным примерам буйков и архиву станций: среднее |буй − станция| / |станция| × 100% для температуры и pH. Пропуски, пороговые и нулевые референсные значения исключены. Это не измеренная точность и не результат испытаний revC.','依浮標模擬範例與站點歷史資料計算：將溫度及 pH 的 |浮標 − 站點| / |站點| × 100% 取平均。排除缺值、檢出限數值及零參考值。這不是實測準確度，也不是 revC 的測試結果。')}</p>
    </div>
  </section>;
}
