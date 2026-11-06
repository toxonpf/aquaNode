import Heading from '../../components/ui/Heading';
import SectionLabel from '../../components/ui/SectionLabel';
import {DownloadLink,ExternalLink} from '../../components/ui/ActionLinks';
import {localeFormat,t} from '../../features/i18n/i18n';
import {useState} from 'react';
import {useMapCopy} from './copy';
import {stations,stationLocations,periods,sampleFor,archiveSummary,csvUrl,datasetUrl} from './data';
import BuoyReadings from './BuoyReadings';

const measures=[['Depth','Глубина','水深','m'],['Temperature','Температура','溫度','°C'],['Salinity','Солёность','鹽度','PSU'],['pH','pH','pH',''],['Dissolved oxygen','Растворённый кислород','溶氧','mg/L'],['Suspended solids','Взвешенные вещества','懸浮固體','mg/L'],['Chlorophyll a','Хлорофилл a','葉綠素 a','µg/L']];

export default function StationArchive({stationId,period,onStationChange,onPeriodChange}:{stationId:string;period:string;onStationChange:(id:string)=>void;onPeriodChange:(period:string)=>void}){
  const {locale,text}=useMapCopy();
  const [showExample,setShowExample]=useState(false);
  const station=stations.find(item=>item.id===stationId)??stations[0],sample=sampleFor(station.id,period);
  const date=(value:string)=>new Intl.DateTimeFormat(localeFormat(locale),{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`));
  const quarter=(value:string)=>locale==='zh-TW'?`${value.slice(0,4)}年 · 第${value.slice(-1)}季`:`${value.slice(0,4)} · ${text('Q','кв. ')}${value.slice(-1)}`;
  return <section id="taiwan-archive" className="atlas-station-archive" aria-labelledby="taiwan-archive-title">
    <header className="atlas-archive-top"><div><SectionLabel icon="notebook">{text('THE REFERENCE / OPEN DATA','РЕФЕРЕНС / ОТКРЫТЫЕ ДАННЫЕ','參考來源 / 開放資料')}</SectionLabel><Heading as="h2" id="taiwan-archive-title">{text('Taiwan station archive','Архив станций Тайваня','台灣站點歷史資料')}</Heading></div><p>{text('Choose a station and a quarter. Values and sampling dates come from the original archive.','Выберите станцию и квартал. Значения и даты замеров сохранены из исходного архива.','選擇站點及季度，查看原始歷史資料中的數值與採樣日期。')}</p></header>
    <div className="atlas-archive-layout">
      <div className="atlas-archive-controls">
        <label className="atlas-field">{text('REFERENCE STATION','РЕФЕРЕНСНАЯ СТАНЦИЯ')}<select aria-label={text('REFERENCE STATION','РЕФЕРЕНСНАЯ СТАНЦИЯ')} value={station.id} onChange={event=>onStationChange(event.target.value)}>{stations.map(item=><option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}</select></label>
        <label className="atlas-field">{text('OBSERVATION PERIOD','ПЕРИОД НАБЛЮДЕНИЙ')}<select aria-label={text('OBSERVATION PERIOD','ПЕРИОД НАБЛЮДЕНИЙ')} value={period} onChange={event=>onPeriodChange(event.target.value)}>{periods.map(value=><option key={value} value={value}>{quarter(value)}</option>)}</select></label>
        <div className="atlas-archive-location"><span>{text('STATION COORDINATES','КООРДИНАТЫ СТАНЦИИ','站點座標')}</span><p>{station.position[0].toFixed(6)}° N<br/>{station.position[1].toFixed(6)}° E</p><small>{station.kmFromTaipei} {text('km from Taipei','км от Тайбэя')}</small></div>
      </div>
      <div className="atlas-archive-results" aria-live="polite">
        {sample?<div className="atlas-observations"><div className="atlas-sample-date"><span>{text('Station archive','Архив станции')} <b>{station.id}</b></span><time dateTime={sample.date}>{date(sample.date)}</time></div><dl>{measures.map(([en,ru,zh,unit],index)=><div key={en}><dt>{text(en,ru,zh)}</dt><dd>{sample.values[index]||'—'}{sample.values[index]&&<small>{unit}</small>}</dd></div>)}</dl><p className="atlas-data-note">{text('— No value in the source. “<” denotes a value below the reported threshold. Each station retains its actual sampling date.','— Значение отсутствует в источнике. «<» означает значение ниже указанного порога. Для каждой станции сохранена фактическая дата замера.')}</p></div>:<p className="atlas-no-data" role="status">{text('No observation for this station in the selected period.','В выбранном периоде для этой станции нет замера.')}</p>}
        <p className="atlas-data-note">{t('Sampling date only; time and time zone are not supplied in the CSV.')}</p>
        <label className="atlas-demo-toggle"><input type="checkbox" checked={showExample} onChange={event=>setShowExample(event.target.checked)}/>{t('Show calculation example')}</label>
        {showExample&&<BuoyReadings buoy={stationLocations.find(item=>item.stationId===station.id)!} period={period}/>}
      </div>
    </div>
    <div className="atlas-archive-resources"><ExternalLink href={datasetUrl} inline>{text('Original station dataset','Исходные данные станций')}</ExternalLink><DownloadLink href={csvUrl} filename="stations_data_en.csv" className="atlas-download" format="CSV" label={text('Station archive','Архив станций')} detail={text(`${archiveSummary.count} records · ${archiveSummary.years}`,`${archiveSummary.count} записей · ${archiveSummary.years}`,`${archiveSummary.count} 筆資料 · ${archiveSummary.years}`)}/></div>
  </section>;
}
