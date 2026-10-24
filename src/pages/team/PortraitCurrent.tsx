import {useLayoutEffect,useRef} from 'react';

const timurCurves=[
  'M-60 330C50 70 135 72 166 215S294 390 465 130',
  'M-60 360C50 100 135 102 166 245S294 420 465 160',
  'M-60 390C50 130 135 132 166 275S294 450 465 190',
];
const romanCurve='M-80 1280C190 1260 380 1150 510 1020C720 810 929 885 910 656C893 445 645 351 511 497C403 614 461 746 365 812C244 896 97 780 -60 842';

function playCurrent(path:Element,time=0){
  const animation=path.animate([
    {strokeDashoffset:'100',opacity:0,visibility:'visible',offset:0},
    {opacity:.95,visibility:'visible',offset:.12},
    {strokeDashoffset:'0',opacity:.95,visibility:'visible',offset:.85},
    {strokeDashoffset:'-15',opacity:0,visibility:'visible',offset:1},
  ],{duration:3600,easing:'linear',iterations:1});
  animation.currentTime=time;
  return animation;
}

/** A flight copy finishes the same pass instead of restarting or cutting it off. */
export function copyPortraitCurrent(from:Element,to:Element){
  const targets=to.querySelectorAll('.portrait-current-flow');
  from.querySelectorAll('.portrait-current-flow').forEach((path,index)=>{
    const running=path.getAnimations().find(animation=>animation.playState==='running');
    if(!running||!targets[index])return;
    targets[index].getAnimations().forEach(animation=>animation.cancel());
    playCurrent(targets[index],Number(running.currentTime)||0);
  });
}

/** Also called for the DOM copy used while a portrait flies back to its card. */
export function syncPortraitCurrent(figure:Element){
  const svg=figure.querySelector<SVGSVGElement>('.team-profile-photo-wave'),image=figure.querySelector('img');
  if(!svg||!image)return;
  const figureStyle=getComputedStyle(figure),imageStyle=getComputedStyle(image);
  const width=parseFloat(figureStyle.width),height=parseFloat(figureStyle.height);
  const photo={width:parseFloat(imageStyle.width),height:parseFloat(imageStyle.height),left:parseFloat(imageStyle.left)||0,top:parseFloat(imageStyle.top)||0};
  if(!width||!height)return;
  const imageHeight=image.naturalWidth?image.naturalHeight/image.naturalWidth*1000:1600/900*1000;
  const scale=Math.max(photo.width/1000,photo.height/imageHeight);
  const position=imageStyle.objectPosition.split(' ').map(value=>parseFloat(value)/100);
  const x=(photo.width-1000*scale)*(position[0]??.5),y=(photo.height-imageHeight*scale)*(position[1]??.5);
  const transform=`translate(${photo.left+photo.width} ${photo.top}) scale(-1 1) translate(${x} ${y}) scale(${scale})`;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const fit=Math.min(width/400,height/500);
  svg.querySelector('.portrait-current-curves')?.setAttribute('transform',svg.dataset.composition==='photo'?transform:`translate(${(width-400*fit)/2} ${(height-500*fit)/2}) scale(${fit})`);
}

export default function PortraitCurrent({slug}:{slug:string}){
  const host=useRef<SVGSVGElement>(null);
  useLayoutEffect(()=>{
    const figure=host.current!.parentElement!,image=figure.querySelector('img')!;
    const media=matchMedia('(prefers-reduced-motion:reduce)'),paths=host.current!.querySelectorAll('.portrait-current-flow');
    const stop=()=>paths.forEach(path=>path.getAnimations().forEach(animation=>animation.cancel()));
    const enter=(event:PointerEvent)=>{
      if(event.pointerType!=='mouse'||media.matches||paths[0]?.getAnimations().some(animation=>animation.playState==='running'))return;
      paths.forEach(path=>playCurrent(path));
    };
    const preference=()=>{if(media.matches)stop()};
    // Layout dimensions ignore the gallery and modal's animated transforms.
    const measure=()=>syncPortraitCurrent(figure);
    const observer=new ResizeObserver(measure);observer.observe(figure);observer.observe(image);
    image.addEventListener('load',measure);measure();
    figure.addEventListener('pointerenter',enter,{passive:true});media.addEventListener('change',preference);
    return()=>{stop();observer.disconnect();image.removeEventListener('load',measure);figure.removeEventListener('pointerenter',enter);media.removeEventListener('change',preference)};
  },[slug]);

  const roman=slug==='roman-benzler';
  const curves=roman?[romanCurve,romanCurve,romanCurve]:timurCurves;
  return <svg ref={host} className="team-profile-photo-wave" data-composition={roman?'photo':'frame'} viewBox="0 0 400 500" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <g className="portrait-current-curves">{curves.map((curve,index)=><g key={index} transform={roman?`translate(${index*20} ${index*29})`:undefined}>
        <path className="portrait-current-line" d={curve}/>
        <path className="portrait-current-flow" pathLength="100" d={curve}/>
      </g>)}</g>
  </svg>;
}
