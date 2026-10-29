import SectionLabel from '../../components/ui/SectionLabel';
import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import {DownloadLink,ExternalLink} from '../../components/ui/ActionLinks';
import {buoys,stations,regionIds,sampleFor,periods,archiveSummary,datasetUrl,csvUrl,type Buoy,type RegionId} from './data';
import BuoyReadings from './BuoyReadings';
import {useMapCopy} from './copy';
import type {MapRequest} from './ObservationMap';
import {localeFormat} from '../../features/i18n/i18n';

const ObservationMap=lazy(()=>import('./ObservationMap'));
const measures=[['Depth','Глубина','m'],['Temperature','Температура','°C'],['Salinity','Солёность','PSU'],['pH','pH',''],['Dissolved oxygen','Растворённый кислород','mg/L'],['Suspended solids','Взвешенные вещества','mg/L'],['Chlorophyll a','Хлорофилл a','µg/L']];

export default function MapPage(){
  const {locale,ru,text,region,water}=useMapCopy();
  const [params]=useSearchParams(),query=params.toString();
  const entryBuoy=buoys.find(buoy=>buoy.id===params.get('buoy'))??null;
  const entryRegion=entryBuoy?.region??regionIds.find(id=>id===params.get('region'))??'world';
  const [request,setRequest]=useState<MapRequest>({region:entryRegion,sequence:0,buoyId:entryBuoy?.id});
  const [active,setActive]=useState<RegionId>(entryRegion==='world'?'hawaii':entryRegion),[selected,setSelected]=useState<Buoy|null>(entryBuoy??(entryRegion==='world'?null:buoys.find(buoy=>buoy.region===entryRegion)!));
  const previousQuery=useRef(query),detail=useRef<HTMLElement>(null);
  const [period,setPeriod]=useState(periods[0]);
  const choose=useCallback((buoy:Buoy)=>{setSelected(buoy);setActive(buoy.region)},[]);
  useEffect(()=>{
    if(query===previousQuery.current)return;
    previousQuery.current=query;
    setSelected(entryBuoy??(entryRegion==='world'?null:buoys.find(buoy=>buoy.region===entryRegion)!));
    setActive(entryRegion==='world'?'hawaii':entryRegion);
    setRequest(value=>({region:entryRegion,buoyId:entryBuoy?.id,sequence:value.sequence+1}));
  },[query]);
  const inspect=useCallback(()=>{
    detail.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    detail.current?.focus({preventScroll:true});
  },[]);
  const visit=(id:RegionId|'world')=>{
    setRequest(value=>({region:id,sequence:value.sequence+1}));
    if(id!=='world'){setActive(id);setSelected(buoys.find(buoy=>buoy.region===id)!)}else setSelected(null);
  };
  const selectStation=(id:string)=>{
    const buoy=buoys.find(item=>item.stationId===id)!;
    choose(buoy);setRequest(value=>({region:'taiwan',sequence:value.sequence+1,buoyId:buoy.id}));
  };
  const station=stations.find(item=>item.id===selected?.stationId);
  const sample=station?sampleFor(station.id,period):undefined;
  const date=(value:string)=>new Intl.DateTimeFormat(localeFormat(locale),{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`));
  const quarter=(value:string)=>locale==='zh-TW'?`${value.slice(0,4)}年 · 第${value.slice(-1)}季`:`${value.slice(0,4)} · ${text('Q','кв. ')}${value.slice(-1)}`;
  const descriptions={
    hawaii:text("Three approximate coastal markers from team-supplied sketches. They are geographic illustrations, not evidence of a revB deployment or university partnership.","Три приблизительные прибрежные точки по эскизам команды. Это географическая иллюстрация, не подтверждение размещения revB или партнёрства с университетом."),
    aktau:text("97 approximate markers follow the team-supplied Aktau shoreline sketch. They do not establish installed devices, participating students or a verified school pilot.","97 приблизительных точек повторяют предоставленный командой эскиз набережной Актау. Они не подтверждают число установленных устройств, участников или школьный пилот."),
    taiwan:text("Four illustrative points sit near the supplied Taiwan monitoring stations. The station archive is a separate source, not revB test evidence or a verified joint deployment.","Четыре условные точки находятся рядом с указанными станциями Тайваня. Архив станций — отдельный источник, не испытания revB и не подтверждение совместного размещения."),
  };
  return <div className="atlas-page">
    <header className="atlas-hero">
      <div className="atlas-eyebrow"><SectionLabel icon="globe">{text('AQUANODE / FIELD ATLAS','AQUANODE / КАРТА НАБЛЮДЕНИЙ')}</SectionLabel><span>{text('THREE REGIONS. ONE SHARED CURIOSITY.','ТРИ РЕГИОНА. ОБЩИЙ ИНТЕРЕС К ВОДЕ.')}</span></div>
      <div className="atlas-heading"><Heading as="h1">{text('Many places.','Разные берега.')}<br/><em>{text('One connected water.','Одна стихия.')}</em></Heading><div><p>{text("Explore team-supplied approximate locations and a public Taiwan station archive. These coastal examples are not revB deployment records; the current EC design targets freshwater and has no published hardware readings.","Изучайте приблизительные точки от команды и открытый архив станций Тайваня. Эти прибрежные примеры не являются размещениями revB: текущий EC-проект рассчитан на пресную воду, аппаратные показания пока не опубликованы.")}</p><span className="atlas-total"><b>{buoys.length}</b>{text("illustrative locations","условных точек")}<i aria-hidden="true"/>03 {text('regions','региона')}</span></div></div>
    </header>

    <section className="atlas-workspace" aria-label={text('Explore buoy locations','Расположение буйков')}>
      <div className="atlas-toolbar"><div className="atlas-regions" role="group" aria-label={text('Choose a region','Выберите регион')}>
        <button type="button" aria-pressed={request.region==='world'&&!selected} onClick={()=>visit('world')}>{text('The world','Весь мир')}<span>{buoys.length}</span></button>
        {regionIds.map((id,index)=><button type="button" key={id} aria-pressed={active===id&&selected!==null} onClick={()=>visit(id)}><span className="atlas-region-number" aria-hidden="true">0{index+1}</span>{region[id]}<span>{buoys.filter(buoy=>buoy.region===id).length}</span></button>)}
      </div><span className="atlas-archive-label"><i/>{text('FIELD LOCATIONS / ARCHIVE DATA','ТОЧКИ НАБЛЮДЕНИЙ / АРХИВ')}</span></div>
      <div className="atlas-grid">
        <Suspense fallback={<div className="atlas-map-loading" role="status">{text('Opening the atlas…','Открываем карту…')}</div>}><ObservationMap request={request} selectedId={selected?.id??null} onSelect={choose} onInspect={inspect}/></Suspense>
        <aside ref={detail} tabIndex={-1} className="atlas-detail" aria-label={text('Location details','Информация о точке')}>
          <div className="atlas-detail-top"><span>{text('LOCATION','ЛОКАЦИЯ')} / 0{regionIds.indexOf(active)+1}</span><span>{selected?.id??text('SELECT A BUOY','ВЫБЕРИТЕ БУЙ')}</span></div>
          <Heading as="h2">{region[active]}</Heading><span className="atlas-water">{water[active]}</span>
          <p className="atlas-description">{descriptions[active]}</p>
          <div className="atlas-position"><span>{text('Approximate locations','Приблизительное расположение')}</span><p>{text('Markers illustrate the supplied coastal areas. Exact GPS fixes and live telemetry are not available.','Точки показывают указанные прибрежные зоны. Точные GPS-координаты и онлайн-телеметрия пока не опубликованы.')}</p></div>
          {active==='taiwan'?<>
            <label className="atlas-field">{text('REFERENCE STATION','РЕФЕРЕНСНАЯ СТАНЦИЯ')}<select aria-label={text('REFERENCE STATION','РЕФЕРЕНСНАЯ СТАНЦИЯ')} value={station?.id??stations[0].id} onChange={event=>selectStation(event.target.value)}>{stations.map(item=><option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}</select></label>
            {station&&<p className="atlas-station-location">{station.position[0].toFixed(6)}° N · {station.position[1].toFixed(6)}° E<br/>{station.kmFromTaipei} {text('km from Taipei','км от Тайбэя')}</p>}
            <label className="atlas-field">{text('OBSERVATION PERIOD','ПЕРИОД НАБЛЮДЕНИЙ')}<select aria-label={text('OBSERVATION PERIOD','ПЕРИОД НАБЛЮДЕНИЙ')} value={period} onChange={event=>setPeriod(event.target.value)}>{periods.map(value=><option key={value} value={value}>{quarter(value)}</option>)}</select></label>
            {selected&&<BuoyReadings buoy={selected} period={period}/>}
            {sample?<div className="atlas-observations" aria-live="polite"><div className="atlas-sample-date"><span>{text('Station archive','Архив станции')} {station?.id}</span><time dateTime={sample.date}>{date(sample.date)}</time></div><dl>{measures.map(([en,russian,unit],index)=><div key={en}><dt>{text(en,russian)}</dt><dd>{sample.values[index]||'—'}{sample.values[index]&&<small>{unit}</small>}</dd></div>)}</dl><p className="atlas-data-note">{text('— No value in the source. “<” denotes a value below the reported threshold. Each station retains its actual sampling date.','— Значение отсутствует в источнике. «<» означает значение ниже указанного порога. Для каждой станции сохранена фактическая дата замера.')}</p></div>:<p className="atlas-no-data" role="status">{text('No observation for this station in the selected period.','В выбранном периоде для этой станции нет замера.')}</p>}
          </>:<><div className="atlas-local-note"><span>{buoys.filter(buoy=>buoy.region===active).length.toString().padStart(2,'0')}</span><div><b>{text("illustrative markers in this area","условных точек в этой зоне")}</b><p>{text("Choose a marker for its geographic context. Current revB measurements have not been published.","Выберите точку для просмотра географического контекста. Измерения текущей revB не опубликованы.")}</p></div></div>{selected&&<BuoyReadings buoy={selected} period={period}/>}</>}
          <div className="atlas-detail-source">{active==='taiwan'?<ExternalLink href={datasetUrl} inline>{text('Original station dataset','Исходные данные станций')}</ExternalLink>:<span>{text('Approximate locations supplied by the AquaNode team.','Приблизительные точки предоставлены командой AquaNode.')}</span>}</div>
        </aside>
      </div>
      <div className="atlas-map-foot"><div className="atlas-legend"><span><i className="atlas-legend-buoy"/>{text('AquaNode buoy','Буй AquaNode')}</span><span><i className="atlas-legend-station"/>{text('Reference station','Референсная станция')}</span><span><i className="atlas-legend-cluster">n</i>{text('Buoy group','Группа буйков')}</span></div><p>{text('Click a group to zoom in. Drag to explore.','Нажмите на группу для приближения. Перетаскивайте карту для навигации.')}</p></div>
    </section>

    <section className="atlas-context"><div className="atlas-context-heading"><SectionLabel icon="route">{text('READING THE MAP','КАК ЧИТАТЬ КАРТУ')}</SectionLabel><Heading as="h2">{text('A place. A date.','Место. Дата.')}<br/><em>{text('A traceable observation.','Наблюдение.')}</em></Heading></div><div className="atlas-context-cards">
      <article><span>01 / {text('IN THE FIELD','НА ВОДЕ')}</span><Heading as="h3">{text('Start with a location.','Начинаем с места.')}</Heading><p>{text('The map follows the coastal areas supplied by the team. The 97 Aktau markers follow the marked shoreline on its water side. Zoom in to reveal smaller neighbourhood groups.','Карта следует прибрежным зонам, указанным командой. 97 точек в Актау повторяют отмеченный участок берега со стороны воды. Приближайте карту, чтобы раскрывать небольшие соседние группы.')}</p></article>
      <article><span>02 / {text('THE REFERENCE','РЕФЕРЕНС')}</span><Heading as="h3">{text('Keep the source close.','Источник всегда рядом.')}</Heading><p>{text(`The supplied CSV extract contains ${archiveSummary.count} records from ${archiveSummary.stationCount} Taiwan stations, ${archiveSummary.years}. Choose a quarter to inspect the retained values and sampling dates.`,`В предоставленной CSV-выборке — ${archiveSummary.count} записей ${archiveSummary.stationCount} станций Тайваня за ${archiveSummary.years} годы. Выберите квартал, чтобы посмотреть сохранённые значения и даты замеров.`,`提供的 CSV 選錄包含 ${archiveSummary.stationCount} 個台灣站點的 ${archiveSummary.count} 筆資料，涵蓋 ${archiveSummary.years} 年。選擇季度可查看保留的數值與採樣日期。`)}</p><DownloadLink href={csvUrl} filename="stations_data_en.csv" className="atlas-download" format="CSV" label={text('Station archive','Архив станций')} detail={text(`${archiveSummary.count} records · ${archiveSummary.years}`,`${archiveSummary.count} записей · ${archiveSummary.years}`,`${archiveSummary.count} 筆資料 · ${archiveSummary.years}`)}/></article>
      <article><span>03 / {text('THE COMPARISON','СРАВНЕНИЕ')}</span><Heading as="h3">{text('Compare in context.','Сравниваем в контексте.')}</Heading><p>{text('The marine station archive can support a learning exercise in comparing observations. It is separate from the freshwater EC design and cannot establish revB accuracy, field deployment or radio performance.','Архив морских станций подходит для учебного сравнения наблюдений. Он отделён от пресноводного EC-проекта и не подтверждает точность revB, размещение устройств или работу радио.')}</p></article>
    </div></section>
  </div>;
}
