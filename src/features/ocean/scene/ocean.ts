import {getOceanStyle} from './oceanStyle';
import type {OceanStyle} from './oceanStyles';

export const OCEAN_LEVEL=-.12;
export const oceanImmersion=(cameraY:number)=>Math.max(0,Math.min(1,(OCEAN_LEVEL+.45-cameraY)/.9));

// The GPU surface, main buoy, network buoys and links sample the same preset.
export function sampleOcean(x:number,z:number,time:number,style:OceanStyle=getOceanStyle()){
  let height=0,dx=0,dz=0;
  for(const wave of style.waves){
    const bend=style.bend;
    const bendPhase=bend?(-x*wave.z+z*wave.x)*bend.frequency+time*bend.speed:0;
    const phase=(x*wave.x+z*wave.z)*wave.frequency-time*wave.speed+(bend?Math.sin(bendPhase)*bend.amplitude:0);
    const sine=Math.sin(phase),bendSlope=bend?Math.cos(bendPhase)*bend.amplitude*bend.frequency:0;
    const crest=wave.crest??0;
    height+=(sine+crest*(sine*sine-.5))*wave.amplitude;
    const slope=Math.cos(phase)*(1+2*crest*sine)*wave.amplitude;
    dx+=slope*(wave.x*wave.frequency-wave.z*bendSlope);
    dz+=slope*(wave.z*wave.frequency+wave.x*bendSlope);
  }
  return {height,dx,dz};
}

const glsl=(value:number)=>value.toFixed(7);
export const oceanWaveShader=(style:OceanStyle)=>`
  void sampleWaves(vec2 p,float time,out float height,out vec2 slope){
    height=0.0;
    slope=vec2(0.0);
    ${style.waves.map(w=>`{
      vec2 direction=vec2(${glsl(w.x)},${glsl(w.z)});
      vec2 across=vec2(-direction.y,direction.x);
      ${style.bend?`
      float bend=dot(p,across)*${glsl(style.bend.frequency)}+time*${glsl(style.bend.speed)};
      float phase=dot(p,direction)*${glsl(w.frequency)}-time*${glsl(w.speed)}+sin(bend)*${glsl(style.bend.amplitude)};
      vec2 gradient=direction*${glsl(w.frequency)}+across*cos(bend)*${glsl(style.bend.frequency*style.bend.amplitude)};
      `:`
      float phase=dot(p,direction)*${glsl(w.frequency)}-time*${glsl(w.speed)};
      vec2 gradient=direction*${glsl(w.frequency)};
      `}
      float sine=sin(phase);
      height+=(sine+${glsl(w.crest??0)}*(sine*sine-.5))*${glsl(w.amplitude)};
      slope+=cos(phase)*(1.0+${glsl(2*(w.crest??0))}*sine)*${glsl(w.amplitude)}*gradient;
    }`).join('\n')}
  }
`;
