import Heading from './Heading';
import type {SensorKind} from './sceneTypes';
import StoryPanel from './StoryPanel';
import FlexibleArrow from './FlexibleArrow';

const sensors={
  ph:{symbol:'pH',name:'Water acidity',description:'A closer look at the acidity of the water. Calibrated pH measurements help us observe how conditions change over time.',label:'ACIDITY / pH PROBE'},
  temperature:{symbol:'°C',name:'Water temperature',description:'A little context for every observation. Temperature measurements help us follow the water through daily and seasonal changes.',label:'TEMPERATURE / WATER PROBE'},
};

export default function SensorPanel({sensor,onChange,onExplore}:{sensor:SensorKind;onChange:(sensor:SensorKind)=>void;onExplore:()=>void}){
  const selected=sensors[sensor];
  return <StoryPanel chapter="sensing" className="sensor-copy" label="Explore the water probes">
    <p className="kicker">03 / BELOW THE SURFACE</p>
    <Heading as="h2" id="sensor-story-title">The story starts<br/>in the water.</Heading>
    <p className="sensor-lead">Above, a small buoy. Below, two probes quietly observing the water around them.</p>
    <div className="sensor-picker" role="group" aria-label="Explore the water probes">
      {(Object.keys(sensors) as SensorKind[]).map(kind=><button key={kind} type="button" aria-pressed={sensor===kind} onClick={()=>onChange(kind)} aria-controls="sensor-explanation">
        <span className="sensor-picker-symbol">{sensors[kind].symbol}</span>
        <span>{kind==='ph'?'Acidity':'Temperature'}<small>{sensor===kind?'Exploring this probe':'Explore this probe'}</small></span>
        <FlexibleArrow/>
      </button>)}
    </div>
    <div className="sensor-explanation" id="sensor-explanation" aria-live="polite" aria-atomic="true">
      <div key={sensor} className="sensor-explanation-content">
        <span className="sensor-small-label">{selected.label}</span>
        <Heading as="h3">{selected.name}</Heading>
        <p>{selected.description}</p>
      </div>
    </div>
    <div className="sensor-cadence"><span aria-hidden="true" className="cadence-orbit"><i/></span><span>Two parameters.<br/><b>One transmission every hour.</b></span><span className="sensor-hour">1<span>h</span></span></div>
    <div className="story-details">
      <article><span>01 / TWO VIEWS OF THE WATER</span><Heading as="h3">Read them together.</Heading><p>Compare observations from the same location and keep the depth and time alongside them. A consistent setup makes differences easier to investigate.</p></article>
      <article><span>02 / BEFORE THE FIRST READING</span><Heading as="h3">Calibration comes first.</Heading><p>A probe can produce a number before that number is trustworthy. Reference checks help distinguish changes in the water from changes in the instrument. The Build guide covers the checking procedure.</p></article>
      <article><span>03 / MAKE OBSERVATIONS USEFUL</span><Heading as="h3">Keep the context.</Heading><p>Record the setup, reference instruments and uncertainty alongside readings. pH and temperature describe part of the picture; they do not, on their own, establish water safety or explain why a change occurred.</p></article>
    </div>
    <button className="arrow-link sensor-explore" type="button" onClick={onExplore}>Inside the technology <span className="arrow-link-icon"><FlexibleArrow direction="up-right"/></span></button>
  </StoryPanel>;
}
