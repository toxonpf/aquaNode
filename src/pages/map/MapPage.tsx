import SectionLabel from '../../components/ui/SectionLabel';
import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import Heading from '../../components/ui/Heading';
import {ExternalLink} from '../../components/ui/ActionLinks';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {buoys,stations,regionIds,periods,datasetUrl,type Buoy,type RegionId} from './data';
import BuoyReadings from './BuoyReadings';
import TaiwanComparison from './TaiwanComparison';
import StationArchive from './StationArchive';
import {useMapCopy} from './copy';
import type {MapRequest} from './ObservationMap';

const ObservationMap=lazy(()=>import('./ObservationMap'));

export default function MapPage(){
  const {text,region,water}=useMapCopy();
  const [params]=useSearchParams(),query=params.toString();
  const entryBuoy=buoys.find(buoy=>buoy.id===params.get('buoy'))??null;
  const entryRegion=entryBuoy?.region??regionIds.find(id=>id===params.get('region'))??'world';
  const [request,setRequest]=useState<MapRequest>({region:entryRegion,sequence:0,buoyId:entryBuoy?.id});
  const [active,setActive]=useState<RegionId>(entryRegion==='world'?'hawaii':entryRegion),[selected,setSelected]=useState<Buoy|null>(entryBuoy??(entryRegion==='world'?null:buoys.find(buoy=>buoy.region===entryRegion)!));
  const previousQuery=useRef(query),detail=useRef<HTMLElement>(null);
  const [period,setPeriod]=useState(periods[0]);
  const [archiveStationId,setArchiveStationId]=useState(entryBuoy?.stationId??stations[0].id);
  const choose=useCallback((buoy:Buoy)=>{setSelected(buoy);setActive(buoy.region);if(buoy.stationId)setArchiveStationId(buoy.stationId)},[]);
  useEffect(()=>{
    if(query===previousQuery.current)return;
    previousQuery.current=query;
    const nextBuoy=entryBuoy??(entryRegion==='world'?null:buoys.find(buoy=>buoy.region===entryRegion)!);
    setSelected(nextBuoy);
    setActive(entryRegion==='world'?'hawaii':entryRegion);
    if(nextBuoy?.stationId)setArchiveStationId(nextBuoy.stationId);
    setRequest(value=>({region:entryRegion,buoyId:entryBuoy?.id,sequence:value.sequence+1}));
  },[query]);
  const inspect=useCallback(()=>{
    detail.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    detail.current?.focus({preventScroll:true});
  },[]);
  const visit=(id:RegionId|'world')=>{
    setRequest(value=>({region:id,sequence:value.sequence+1}));
    if(id!=='world')choose(buoys.find(buoy=>buoy.region===id)!);else setSelected(null);
  };
  const selectStation=(id:string)=>{
    const buoy=buoys.find(item=>item.stationId===id)!;
    choose(buoy);setRequest(value=>({region:'taiwan',sequence:value.sequence+1,buoyId:buoy.id}));
  };
  const descriptions={
    hawaii:text("According to the AquaNode team, three buoys in Hawaiʻi were deployed jointly with Hawaiʻi Pacific University (HPU). The map shows their approximate coastal locations near Honolulu.","По информации команды AquaNode, три буйка на Гавайях запущены совместно с Hawaiʻi Pacific University (HPU). Карта показывает их приблизительное расположение у побережья Гонолулу.","據 AquaNode 團隊提供的資訊，夏威夷的三個浮標與夏威夷太平洋大學（HPU）共同部署。地圖呈現其在檀香山沿岸的概略位置。"),
    aktau:text("According to the AquaNode team, all 97 buoys in Aktau were assembled by students of coastal School No. 15. Their approximate locations follow the waterfront area supplied by the team.","По информации команды AquaNode, все 97 буйков в Актау собраны учениками прибрежной школы №15. Их приблизительные точки расположены вдоль указанного командой участка набережной.","據 AquaNode 團隊提供的資訊，阿克套的全部 97 個浮標由沿海第 15 學校的學生組裝。概略點位沿團隊提供的水岸區域排列。"),
    taiwan:text("According to the AquaNode team, all four Taiwan buoys were deployed with support from the Ocean Conservation Administration (OCA), near the reference stations shown here. The station archive and simulated comparisons remain separate from revC hardware tests.","По информации команды AquaNode, все четыре буйка на Тайване запущены при поддержке Ocean Conservation Administration (OCA), рядом с показанными референсными станциями. Архив станций и расчётные сравнения отделены от аппаратных испытаний revC.","據 AquaNode 團隊提供的資訊，台灣的四個浮標皆在海洋保育署（OCA）支持下，部署於圖示參考站點附近。站點歷史資料與模擬比較獨立於 revC 硬體測試。"),
  };
  return <div className="atlas-page">
    <header className="atlas-hero">
      <div className="atlas-eyebrow"><SectionLabel icon="globe">{text('AQUANODE / FIELD ATLAS','AQUANODE / КАРТА НАБЛЮДЕНИЙ')}</SectionLabel><span>{text('THREE REGIONS. ONE SHARED CURIOSITY.','ТРИ РЕГИОНА. ОБЩИЙ ИНТЕРЕС К ВОДЕ.')}</span></div>
      <div className="atlas-heading"><Heading as="h1">{text('Many places.','Разные берега.')}<br/><em>{text('One connected water.','Одна стихия.')}</em></Heading><div><p>{text("Explore deployments reported by the team in Hawaiʻi, Aktau and Taiwan, alongside the public Taiwan station archive. Locations are approximate; the current freshwater revC design has no published field readings.","Здесь собраны сведения команды о запусках на Гавайях, в Актау и на Тайване, а также открытый архив тайваньских станций. Точки приблизительные; полевые показания текущего пресноводного проекта revC пока не опубликованы.","探索團隊提供的夏威夷、阿克套與台灣部署資訊，以及台灣公開站點歷史資料。點位為概略位置；目前的淡水 revC 設計尚未公布實地讀值。")}</p><span className="atlas-total"><b>{buoys.length}</b>{text("approximate locations","приблизительных точек","個概略點位")}<i aria-hidden="true"/>03 {text('regions','региона')}</span></div></div>
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
            <a className="arrow-link atlas-open-archive" href="#taiwan-archive">{text('Explore station records','Открыть архив станции','查看站點歷史資料')}<FlexibleArrow direction="down"/></a>
            {selected&&<BuoyReadings buoy={selected} period={period}/>}
          </>:<><div className="atlas-local-note"><span>{buoys.filter(buoy=>buoy.region===active).length.toString().padStart(2,'0')}</span><div><b>{text("illustrative markers in this area","условных точек в этой зоне")}</b><p>{text("Choose a marker for its geographic context. Current revC measurements have not been published.","Выберите точку для просмотра географического контекста. Измерения текущей revC не опубликованы.")}</p></div></div>{selected&&<BuoyReadings buoy={selected} period={period}/>}</>}
          <div className="atlas-detail-source">{active==='taiwan'?<ExternalLink href={datasetUrl} inline>{text('Original station dataset','Исходные данные станций')}</ExternalLink>:<span>{text('Approximate locations supplied by the AquaNode team.','Приблизительные точки предоставлены командой AquaNode.')}</span>}</div>
        </aside>
      </div>
      <div className="atlas-map-foot"><div className="atlas-legend"><span><i className="atlas-legend-buoy"/>{text('AquaNode buoy','Буй AquaNode')}</span><span><i className="atlas-legend-station"/>{text('Reference station','Референсная станция')}</span><span><i className="atlas-legend-cluster">n</i>{text('Buoy group','Группа буйков')}</span></div><p>{text('Click a group to zoom in. Drag to explore.','Нажмите на группу для приближения. Перетаскивайте карту для навигации.')}</p></div>
      <TaiwanComparison period={period} onPeriodChange={setPeriod}/>
    </section>

    <StationArchive stationId={archiveStationId} period={period} onStationChange={selectStation} onPeriodChange={setPeriod}/>

    <section className="atlas-context"><div className="atlas-context-heading"><SectionLabel icon="route">{text('READING THE MAP','КАК ЧИТАТЬ КАРТУ')}</SectionLabel><Heading as="h2">{text('A place. A date.','Место. Дата.')}<br/><em>{text('A traceable observation.','Наблюдение.')}</em></Heading></div><div className="atlas-context-cards">
      <article><span>01 / {text('IN THE FIELD','НА ВОДЕ')}</span><Heading as="h3">{text('Start with a location.','Начинаем с места.')}</Heading><p>{text('The map follows the coastal areas supplied by the team. The 97 Aktau markers follow the marked shoreline on its water side. Zoom in to reveal smaller neighbourhood groups.','Карта следует прибрежным зонам, указанным командой. 97 точек в Актау повторяют отмеченный участок берега со стороны воды. Приближайте карту, чтобы раскрывать небольшие соседние группы.')}</p></article>
      <article><span>03 / {text('THE COMPARISON','СРАВНЕНИЕ')}</span><Heading as="h3">{text('Compare in context.','Сравниваем в контексте.')}</Heading><p>{text("The marine station archive can support a learning exercise in comparing observations. It is separate from the freshwater EC design and cannot establish revC accuracy, field deployment or radio performance.","Архив морских станций подходит для учебного сравнения наблюдений. Он отделён от пресноводного EC-проекта и не подтверждает точность revC, размещение устройств или работу радио.")}</p></article>
    </div></section>
  </div>;
}
