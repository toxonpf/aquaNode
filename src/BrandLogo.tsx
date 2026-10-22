import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {logoMarkup} from './brand';
import './brand.css';

const PROFILE_STEPS=256,RENDER_STEPS=96;

// Sample the real SVG crest once, relative to the line between its endpoints.
// Preserve its asymmetric crest. Only soften the periodic join over a few SVG
// units; filtering the whole shape into a sine wave changes the brand artwork.
function sampleWave(path:SVGPathElement){
  const length=path.getTotalLength();
  const points=Array.from({length:PROFILE_STEPS+1},(_,i)=>path.getPointAtLength(length*i/PROFILE_STEPS)).sort((a,b)=>a.x-b.x);
  const left=points[0],right=points[points.length-1],width=right.x-left.x;
  const original=new Float32Array(PROFILE_STEPS+1),profile=new Float32Array(PROFILE_STEPS+1);
  let cursor=0;
  for(let i=0;i<=PROFILE_STEPS;i++){
    const u=i/PROFILE_STEPS,x=left.x+width*u;
    while(cursor<points.length-2&&points[cursor+1].x<x)cursor++;
    const a=points[cursor],b=points[cursor+1];
    const y=a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x||1);
    original[i]=y;
    profile[i]=y-left.y-(right.y-left.y)*u;
  }
  const smooth=new Float32Array(PROFILE_STEPS);
  for(let i=0;i<PROFILE_STEPS;i++){
    const seamDistance=Math.min(i,PROFILE_STEPS-i)*width/PROFILE_STEPS;
    const sigma=(2+4*Math.exp(-.5*(seamDistance/10)**2))*PROFILE_STEPS/width;
    const radius=Math.ceil(sigma*3);
    let total=0,weight=0;
    for(let offset=-radius;offset<=radius;offset++){
      const influence=Math.exp(-.5*(offset/sigma)**2);
      total+=profile[(i+offset+PROFILE_STEPS)%PROFILE_STEPS]*influence;
      weight+=influence;
    }
    smooth[i]=total/weight;
  }
  return {left,right,width,original,profile:smooth};
}

function sample(values:Float32Array,position:number){
  const at=Math.max(0,Math.min(PROFILE_STEPS,position*PROFILE_STEPS));
  const index=Math.min(PROFILE_STEPS-1,Math.floor(at));
  return values[index]+(values[index+1]-values[index])*(at-index);
}

function periodicSample(values:Float32Array,position:number){
  const at=((position%1+1)%1)*PROFILE_STEPS,index=Math.floor(at),t=at-index;
  const a=values[(index+PROFILE_STEPS-1)%PROFILE_STEPS],b=values[index];
  const c=values[(index+1)%PROFILE_STEPS],d=values[(index+2)%PROFILE_STEPS];
  return b+.5*t*(c-a+t*(2*a-5*b+4*c-d+t*(3*(b-c)+d-a)));
}

function travellingWave(wave:ReturnType<typeof sampleWave>,phase:number,strength:number){
  const step=wave.width/RENDER_STEPS;
  const heights=Array.from({length:RENDER_STEPS+1},(_,i)=>{
    const u=i/RENDER_STEPS,source=sample(wave.original,u);
    // Let the ends rise with the passing wave instead of squeezing the crest
    // into a fixed envelope. All three strokes retain their original spacing.
    const crest=periodicSample(wave.profile,u-phase);
    const target=wave.left.y+(wave.right.y-wave.left.y)*u+crest;
    return source+(target-source)*strength;
  });
  let d=`M${wave.left.x.toFixed(3)} ${heights[0].toFixed(3)}`;
  for(let i=0;i<RENDER_STEPS;i++){
    const x=wave.left.x+step*i;
    const startSlope=i===0?(heights[1]-heights[0])/3:(heights[i+1]-heights[i-1])/6;
    const endSlope=i===RENDER_STEPS-1?(heights[i+1]-heights[i])/3:(heights[i+2]-heights[i])/6;
    d+=`C${(x+step/3).toFixed(3)} ${(heights[i]+startSlope).toFixed(3)} ${(x+step*2/3).toFixed(3)} ${(heights[i+1]-endSlope).toFixed(3)} ${(x+step).toFixed(3)} ${heights[i+1].toFixed(3)}`;
  }
  return d;
}

export default function BrandLogo({loading=false}:{loading?:boolean}){
  const host=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    // The header is a stable navigation landmark. Reserve the travelling
    // waveform for the transition curtain, where it communicates loading.
    if(!loading)return;
    const element=host.current;if(!element)return;
    const waves=Array.from(element.querySelectorAll<SVGPathElement>('path[stroke]:not([stroke="none"])'));
    const original=waves.map(path=>path.getAttribute('d')!);
    const profiles=waves.map(sampleWave);
    const curtain=element.closest('.page-curtain');
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let motion:gsap.core.Timeline|null=null;
    const stop=()=>{motion?.kill();motion=null;waves.forEach((path,index)=>path.setAttribute('d',original[index]))};
    const play=()=>{
      stop();if(media.matches||!curtain?.hasAttribute('data-active'))return;
      const water={phase:0,strength:0};
      motion=gsap.timeline({onUpdate:()=>waves.forEach((path,index)=>path.setAttribute('d',travellingWave(profiles[index],water.phase,water.strength))),onComplete:stop})
        // Blend to the periodic contour while its crest is still aligned.
        // Moving during that blend creates two competing crests at startup.
        .to(water,{strength:1,duration:.3,ease:'sine.inOut'},0)
        .to(water,{phase:1,duration:3.8,repeat:-1,ease:'none'},.3);
    };
    const observer=new MutationObserver(play);
    if(curtain)observer.observe(curtain,{attributes:true,attributeFilter:['data-active']});
    media.addEventListener('change',play);play();
    return()=>{stop();observer.disconnect();media.removeEventListener('change',play)};
  },[loading]);
  return <span ref={host} className="brand-mark" aria-hidden="true" dangerouslySetInnerHTML={{__html:logoMarkup}}/>;
}
