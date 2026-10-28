import SectionLabel from '../../components/ui/SectionLabel';
import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import {DownloadLink,ExternalLink} from '../../components/ui/ActionLinks';
import {buoys,stations,regionIds,sampleFor,periods,datasetUrl,geepUrl,csvUrl,type Buoy,type RegionId} from './data';
import BuoyReadings from './BuoyReadings';
import {useMapCopy} from './copy';
import type {MapRequest} from './ObservationMap';

const ObservationMap=lazy(()=>import('./ObservationMap'));
const measures=[['Depth','Глубина','m'],['Temperature','Температура','°C'],['Salinity','Солёность','PSU'],['pH','pH',''],['Dissolved oxygen','Растворённый кислород','mg/L'],['Suspended solids','Взвешенные вещества','mg/L'],['Chlorophyll a','Хлорофилл a','µg/L']];

export default function MapPage(){
  const {ru,text,region,water}=useMapCopy();
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
  const date=(value:string)=>new Intl.DateTimeFormat(ru?'ru-RU':'en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`));
  const quarter=(value:string)=>`${value.slice(0,4)} · ${text('Q','кв. ')}${value.slice(-1)}`;
  const descriptions={
    hawaii:text('Three buoys in the Honolulu coastal area, with Hawaiʻi Pacific University and support from Dr. Jennifer M. Lynch, Ph.D.','Три буйка в прибрежной зоне Гонолулу при Hawaiʻi Pacific University, при поддержке Dr. Jennifer M. Lynch, Ph.D.'),
    aktau:text('97 buoys along the Aktau waterfront near School No. 58. A local field for learning about the Caspian Sea.','97 буйков вдоль набережной Актау у школы №58. Локальная площадка для знакомства с Каспийским морем.'),
    taiwan:text('Four AquaNode locations near professional monitoring stations, close to Taipei. Deployment with Taiwan’s Ocean Conservation Administration (OCA), a GEEP Youth Innovation Challenge partner, as reported by the team.','Четыре точки AquaNode рядом с профессиональными станциями у Тайбэя. По данным команды, размещение проведено совместно с Ocean Conservation Administration (OCA), партнёром GEEP по Youth Innovation Challenge.'),
  };
  return <div className="atlas-page">
    <header className="atlas-hero">
      <div className="atlas-eyebrow"><SectionLabel icon="globe">{text('AQUANODE / FIELD ATLAS','AQUANODE / КАРТА НАБЛЮДЕНИЙ')}</SectionLabel><span>{text('THREE REGIONS. ONE SHARED CURIOSITY.','ТРИ РЕГИОНА. ОБЩИЙ ИНТЕРЕС К ВОДЕ.')}</span></div>
      <div className="atlas-heading"><Heading as="h1">{text('Many places.','Разные берега.')}<br/><em>{text('One connected water.','Одна стихия.')}</em></Heading><div><p>{text('Follow the buoys from the Caspian shore to the Pacific. Explore a location, then look closer at the water around it.','От берегов Каспия до Тихого океана. Выберите регион, найдите буй и узнайте больше о воде рядом с ним.')}</p><span className="atlas-total"><b>{buoys.length}</b>{text('buoys mapped','буйков на карте')}<i aria-hidden="true"/>03 {text('regions','региона')}</span></div></div>
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
          </>:<><div className="atlas-local-note"><span>{buoys.filter(buoy=>buoy.region===active).length.toString().padStart(2,'0')}</span><div><b>{text('buoys in this area','буйков в этой зоне')}</b><p>{text('Choose an individual marker to explore its demo scenario.','Выберите отдельную точку, чтобы посмотреть её демонстрационный сценарий.')}</p></div></div>{selected&&<BuoyReadings buoy={selected} period={period}/>}</>}
          <div className="atlas-detail-source">{active==='taiwan'?<ExternalLink href={datasetUrl} inline>{text('Original station dataset','Исходные данные станций')}</ExternalLink>:active==='hawaii'?<ExternalLink href="https://www.hpu.edu/faculty/cncs/jennifer-lynch.html" inline>{text('About Dr. Jennifer M. Lynch','О Dr. Jennifer M. Lynch')}</ExternalLink>:<span>{text('Location information supplied by the AquaNode team.','Информация о размещении предоставлена командой AquaNode.')}</span>}</div>
        </aside>
      </div>
      <div className="atlas-map-foot"><div className="atlas-legend"><span><i className="atlas-legend-buoy"/>{text('AquaNode buoy','Буй AquaNode')}</span><span><i className="atlas-legend-station"/>{text('Reference station','Референсная станция')}</span><span><i className="atlas-legend-cluster">n</i>{text('Buoy group','Группа буйков')}</span></div><p>{text('Click a group to zoom in. Drag to explore.','Нажмите на группу для приближения. Перетаскивайте карту для навигации.')}</p></div>
    </section>

    <section className="atlas-context"><div className="atlas-context-heading"><SectionLabel icon="route">{text('READING THE MAP','КАК ЧИТАТЬ КАРТУ')}</SectionLabel><Heading as="h2">{text('A place. A date.','Место. Дата.')}<br/><em>{text('A traceable observation.','Наблюдение.')}</em></Heading></div><div className="atlas-context-cards">
      <article><span>01 / {text('IN THE FIELD','НА ВОДЕ')}</span><Heading as="h3">{text('Start with a location.','Начинаем с места.')}</Heading><p>{text('The map follows the coastal areas supplied by the team. The 97 Aktau markers follow the marked shoreline on its water side. Zoom in to reveal smaller neighbourhood groups.','Карта следует прибрежным зонам, указанным командой. 97 точек в Актау повторяют отмеченный участок берега со стороны воды. Приближайте карту, чтобы раскрывать небольшие соседние группы.')}</p></article>
      <article><span>02 / {text('THE REFERENCE','РЕФЕРЕНС')}</span><Heading as="h3">{text('Keep the source close.','Источник всегда рядом.')}</Heading><p>{text('The Taiwan archive contains 388 observations across four stations from 2002 to 2026. Choose a quarter to inspect the original values and sampling dates.','Тайваньский архив содержит 388 записей четырёх станций за 2002–2026 годы. Выберите квартал, чтобы увидеть исходные значения и даты отбора проб.')}</p><DownloadLink href={csvUrl} filename="stations_data_en.csv" className="atlas-download" format="CSV" label={text('Station archive','Архив станций')} detail={text('388 records · 2002–2026','388 записей · 2002–2026')}/></article>
      <article><span>03 / {text('THE COMPARISON','СРАВНЕНИЕ')}</span><Heading as="h3">{text('Compare in context.','Сравниваем в контексте.')}</Heading><p>{text('The team reports deployment with OCA near professional stations and deviations of up to 5%. This is a team-reported result; the station archive and simulated preview are not paired field-test records.','Команда сообщает о размещении совместно с OCA рядом с профессиональными станциями и отклонении до 5%. Это результат, заявленный командой; архив станций и моделируемый пример не являются парными записями испытаний.')}</p><ExternalLink href={geepUrl} inline>GEEP / OCA · Youth Innovation Challenge</ExternalLink></article>
    </div></section>
  </div>;
}
