// Shared by the GPU surface and the buoy so both move with the same swells.
export const OCEAN_LEVEL = -.12;
export const swells = [
  {x:.94,z:.342,amplitude:.17,frequency:.85,speed:.72},
  {x:-.42,z:.9075,amplitude:.095,frequency:1.48,speed:1.04},
  {x:.685,z:-.7285,amplitude:.047,frequency:2.62,speed:1.38},
  {x:.2,z:.98,amplitude:.018,frequency:5.3,speed:1.8},
];

export function sampleOcean(x:number,z:number,time:number){
  let height=0,dx=0,dz=0;
  for(const wave of swells){
    const phase=(x*wave.x+z*wave.z)*wave.frequency-time*wave.speed;
    height+=Math.sin(phase)*wave.amplitude;
    const slope=Math.cos(phase)*wave.amplitude*wave.frequency;
    dx+=slope*wave.x;
    dz+=slope*wave.z;
  }
  return {height,dx,dz};
}

export const oceanWaveShader = `
  void sampleWaves(vec2 p,float time,out float height,out vec2 slope){
    height=0.0;
    slope=vec2(0.0);
    ${swells.map(w=>`{
      vec2 direction=vec2(${w.x.toFixed(5)},${w.z.toFixed(5)});
      float phase=dot(p,direction)*${w.frequency.toFixed(5)}-time*${w.speed.toFixed(5)};
      height+=sin(phase)*${w.amplitude.toFixed(5)};
      slope+=cos(phase)*${(w.amplitude*w.frequency).toFixed(7)}*direction;
    }`).join('\n')}
  }
`;
