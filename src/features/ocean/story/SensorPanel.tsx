import SectionLabel from '../../../components/ui/SectionLabel';
import {t} from '../../i18n/i18n';
import Heading from '../../../components/ui/Heading';
import AnimatedHeight from '../../../components/ui/AnimatedHeight';
import type {SensorKind} from '../sceneTypes';
import StoryPanel from './StoryPanel';
import FlexibleArrow from '../../../components/ui/FlexibleArrow';

const getSensors=()=>({
  ph:{symbol:'pH',name:t("Isolated pH"),description:t("SEN0169-V2 connects through DFR0504 power and signal isolation to ADS1115. The electrode may share water with EC, but calibration, supply checks and interference tests are still required. Numerical pH stays null until real validation."),label:t("pH / SEN0169-V2 + DFR0504")},
  ec:{symbol:'EC',name:t("Experimental EC"),description:t("SEN0244 is a TDS module being investigated for an experimental conductivity estimate in freshwater. Independent standards and temperature checks are needed; it does not identify a particular salt."),label:t("EC / SEN0244 EXPERIMENT")},
  temperature:{symbol:'°C',name:t("Water temperature"),description:t("DS18B20 supplies the temperature input for the EC and pH checks. Numerical pH is currently restricted to the calibration temperature ±0.5 °C; automatic pH temperature compensation is not claimed."),label:t("TEMPERATURE / WATER PROBE")},
});

export default function SensorPanel({sensor,onChange,onExplore}:{sensor:SensorKind;onChange:(sensor:SensorKind)=>void;onExplore:()=>void}){
  const sensors=getSensors();
  const selected=sensors[sensor];
  return <StoryPanel chapter="sensing" className="sensor-copy" label={t("Explore the water probes")}>
    <SectionLabel icon="probe">{t("03 / BELOW THE SURFACE")}</SectionLabel>
    <Heading as="h2" id="sensor-story-title">{t("The story starts")} {t("in the water.")}</Heading>
    <p className="sensor-lead">{t("Follow three bench inputs: experimental EC, temperature and isolated pH. Shared-water operation still needs power, calibration and interference checks.")}</p>
    <div className="sensor-picker" role="group" aria-label={t("Explore the water probes")}>
      {(Object.keys(sensors) as SensorKind[]).map(kind=><button key={kind} type="button" aria-pressed={sensor===kind} onClick={()=>onChange(kind)} aria-controls="sensor-explanation">
        <span className="sensor-picker-symbol">{sensors[kind].symbol}</span>
        <span>{kind==='ph'?t('Isolated pH'):kind==='ec'?t('EC estimate'):t("Temperature")}<small>{sensor===kind?t("Exploring this probe"):t("Explore this probe")}</small></span>
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
    <div className="sensor-cadence"><span aria-hidden="true" className="cadence-orbit"><i/></span><span>{t("Three bench inputs.")}<br/><b>{t("USB bench source, not live telemetry.")}</b></span><span className="sensor-hour sensor-bench-mode">USB</span></div>
    <div className="story-details">
      <article><SectionLabel as="span" icon="water">{t("01 / THREE VIEWS OF THE WATER")}</SectionLabel><Heading as="h3">{t("Read them together.")}</Heading><p>{t("Compare observations from the same location and keep the depth and time alongside them. A consistent setup makes differences easier to investigate.")}</p></article>
      <article><SectionLabel as="span" icon="calibration">{t("02 / BEFORE THE FIRST READING")}</SectionLabel><Heading as="h3">{t("Calibration comes first.")}</Heading><p>{t("Use real pH buffers, independent EC standards and a reference thermometer. Calibrate the entire pH isolation and ADC chain. Synthetic test inputs are not calibration, and the ESP32 build is incomplete.")}</p></article>
      <article><SectionLabel as="span" icon="notebook">{t("03 / MAKE OBSERVATIONS USEFUL")}</SectionLabel><Heading as="h3">{t("Keep the context.")}</Heading><p>{t("Record setup, calibration, independent references and uncertainty. revC does not establish sensor accuracy, identify salts or assess drinking-water safety; its EC estimate is for freshwater.")}</p></article>
    </div>
    <button className="arrow-link sensor-explore" type="button" onClick={onExplore}>{t("Inside the technology")} <span className="arrow-link-icon"><FlexibleArrow direction="up-right"/></span></button>
  </StoryPanel>;
}
