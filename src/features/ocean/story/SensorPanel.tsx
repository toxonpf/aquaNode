import SectionLabel from '../../../components/ui/SectionLabel';
import {t} from '../../i18n/i18n';
import Heading from '../../../components/ui/Heading';
import AnimatedHeight from '../../../components/ui/AnimatedHeight';
import type {SensorKind} from '../sceneTypes';
import StoryPanel from './StoryPanel';
import FlexibleArrow from '../../../components/ui/FlexibleArrow';

const getSensors=()=>({
 ph:{symbol:'pH',name:t('Acidity'),description:t('pH describes how acidic or alkaline water is. Calibration and temperature context belong with the reading.'),label:'pH'},
 ec:{symbol:'EC',name:t('Electrical conductivity'),description:t('EC describes electrical conductivity. The developing revC explores an EC estimate in freshwater; its method is documented separately.'),label:'EC'},
 temperature:{symbol:'°C',name:t('Water temperature'),description:t('Temperature provides context for changes in water and comparisons between observations.'),label:'°C'},
});

export default function SensorPanel({sensor,onChange,onExplore}:{sensor:SensorKind;onChange:(sensor:SensorKind)=>void;onExplore:()=>void}){
  const sensors=getSensors();
  const selected=sensors[sensor];
  return <StoryPanel chapter="sensing" className="sensor-copy" label={t("Explore the water probes")}>
    <SectionLabel icon="probe">{t("03 / BELOW THE SURFACE")}</SectionLabel>
    <Heading as="h2" id="sensor-story-title">{t('What the buoy measures')}</Heading>
    <p className="sensor-lead">{t('Sensors depend on the build. Choose a parameter to learn what it describes; device configurations are listed in the technology section.')}</p>
    <div className="sensor-picker" role="group" aria-label={t("Explore the water probes")}>
      {(Object.keys(sensors) as SensorKind[]).map(kind=><button key={kind} type="button" aria-pressed={sensor===kind} onClick={()=>onChange(kind)} aria-controls="sensor-explanation">
        <span className="sensor-picker-symbol">{sensors[kind].symbol}</span>
        <span>{kind==='ph'?t('Acidity'):kind==='ec'?t('EC estimate'):t("Temperature")}<small>{sensor===kind?t("Exploring this probe"):t("Explore this probe")}</small></span>
        <FlexibleArrow/>
      </button>)}
    </div>
    <AnimatedHeight className="sensor-explanation" id="sensor-explanation" aria-live="polite" aria-atomic="true">
      <div key={sensor} className="sensor-explanation-content">
        <span className="sensor-small-label">{selected.label}</span>
        <Heading as="h3">{selected.name}</Heading>
        <p>{selected.description}</p>
      </div>
    </AnimatedHeight>
    <button className="arrow-link sensor-explore" type="button" onClick={onExplore}>{t("Inside the technology")} <span className="arrow-link-icon"><FlexibleArrow direction="up-right"/></span></button>
  </StoryPanel>;
}
