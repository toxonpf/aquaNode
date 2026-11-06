import SectionLabel from '../../components/ui/SectionLabel';
import {t} from '../../features/i18n/i18n';
import Heading from '../../components/ui/Heading';
import {useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {parts} from '../../data/content';
import MapEmbed from '../map/MapEmbed';
import {useMapCopy} from '../map/copy';
export function MeetNode({renderViewer}:{renderViewer:(active:number,onChange:(part:number)=>void)=>ReactNode}){
  const [active,setActive]=useState(0);
  return <section className="section dark node-showcase" aria-labelledby="meet-node-title">
    <div className="feature-section-top"><SectionLabel icon="buoy">{t("03 / MEET THE NODE")}</SectionLabel><span>{t("ONE INSTRUMENT. THREE CONNECTED PARTS.")}</span></div>
    <div className="node-showcase-layout"><div className="node-intro">
      <Heading as="h2" id="meet-node-title">{t("Purpose in")}<br/><em>{t("every part.")}</em></Heading>
      <p>{t("A tool students can assemble, inspect and learn from, above and below the water.")}</p>
      <div className="node-parts" role="group" aria-label={t("Explore the parts of AquaNode")}>{parts.map((part,index)=><button key={part.name} type="button" aria-pressed={active===index} aria-controls="node-model-viewer" onClick={()=>setActive(index)}>
        <span className="node-part-heading"><span>{String(index+1).padStart(2,'0')}</span><b>{[t("Stay afloat"),t("Protect the electronics"),t("Read the water")][index]}</b><FlexibleArrow direction="up-right"/></span>
        <span className="node-part-detail"><span>{part.text}</span></span>
      </button>)}</div>
      <Link className="arrow-link node-showcase-link" to="/technology">{t("Inside the technology")} <FlexibleArrow direction="up-right"/></Link>
    </div><div className="node-display" id="node-model-viewer">
      <div className="node-display-top"><span>{t("AQUANODE / CONCEPT STUDY")}</span><span>{String(active+1).padStart(2,'0')} / 03</span></div>
      {renderViewer(active,setActive)}
      <div className="node-display-bottom"><span><b>pH</b> {t("Isolated pH")}</span><span><b>EC</b> {t("EC ESTIMATE")}</span><span><b>°C</b> {t("TEMPERATURE")}</span><span><b>USB</b> {t("BENCH SOURCE")}</span></div>
    </div></div>
  </section>;
}

export function FutureNetwork(){
  const {text}=useMapCopy();
  return <section className="section future-section future-atlas" aria-labelledby="future-title">
    <div className="feature-section-top"><SectionLabel icon="map">{text('05 / CONNECTED SHORELINES','05 / БЕРЕГА НА КАРТЕ')}</SectionLabel><span>{text('FROM THE CASPIAN TO THE PACIFIC','ОТ КАСПИЯ ДО ТИХОГО ОКЕАНА')}</span></div>
    <div className="future-heading"><Heading as="h2" id="future-title">{text('Many classrooms.','Несколько школ.')}<br/><em>{text('A shared view.','Общая картина.')}</em></Heading><p>{text('Explore the coastal locations reported by the team in Aktau, Hawaiʻi and Taiwan. The atlas brings regional stories and an independent station archive together; current revC field readings are not published.','Посмотрите прибрежные точки, о которых рассказывает команда: Актау, Гавайи и Тайвань. Карта объединяет истории регионов и отдельный архив станций; полевые показания текущей revC пока не опубликованы.','探索團隊提供的阿克套、夏威夷與台灣沿岸點位。地圖結合各地故事與獨立的站點歷史資料；目前尚未公布 revC 實地讀值。')}</p></div>
    <div className="future-workbench"><MapEmbed/></div>
    <div className="future-bottom"><span>{t("INDIVIDUAL NODES. SHARED PERSPECTIVE.")}</span><p>{text("Approximate locations · independent station archive · no revC field readings","Приблизительные точки · отдельный архив станций · показаний revC нет")}</p></div>
  </section>;
}
