import {Link} from 'react-router-dom';
import type {Buoy} from './data';
import {revision} from '../../data/project';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
import {useMapCopy} from './copy';

export default function BuoyReadings({buoy}:{buoy:Buoy;period:string}){
 const {text}=useMapCopy();
 return <section className="atlas-example" id="atlas-example" aria-label={text('Current measurement status','Текущий статус измерений')}>
  <div className="atlas-example-heading"><span>{text('HARDWARE READINGS PENDING','АППАРАТНЫЕ ПОКАЗАНИЯ ОЖИДАЮТСЯ')}</span><b>{buoy.id}</b></div>
  <p>{text('No hardware measurements are published for this marker. The current revision prepares an experimental freshwater EC estimate and temperature input; its hardware validation is pending.','Для этой точки не опубликованы аппаратные измерения. Текущая ревизия готовит экспериментальную оценку EC и температурный вход для пресной воды; испытания оборудования предстоят.')}</p>
  <p className="atlas-example-disclaimer">{revision} · {text('Accuracy and battery life are unknown. Station records below, when available, belong to the original archive.','Точность и автономность неизвестны. Записи станции ниже, если они доступны, относятся к исходному архиву.')}</p>
  <Link className="arrow-link" to="/journal">{text('Read the current evidence','Посмотреть текущие подтверждения')}<FlexibleArrow direction="up-right"/></Link>
 </section>;
}
