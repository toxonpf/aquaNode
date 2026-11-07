import gsap from 'gsap';
import {captureLocaleLayout} from './localeLayout';

export const localeLeaveEvent='aquanode:locale-leave';
export const localeEnterEvent='aquanode:locale-enter';
export const localeMeasureEvent='aquanode:locale-measure';

export function visibleCopy(node:HTMLElement){
  if((node.checkVisibility&&!node.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))||node.closest('[inert]'))return false;
  let {top,bottom,left,right}=node.getBoundingClientRect();
  for(let parent=node.parentElement;parent;parent=parent.parentElement){
    const style=getComputedStyle(parent);
    if(/auto|scroll|hidden|clip/.test(style.overflowY)){
      const clip=parent.getBoundingClientRect();top=Math.max(top,clip.top);bottom=Math.min(bottom,clip.bottom);
    }
    if(/auto|scroll|hidden|clip/.test(style.overflowX)){
      const clip=parent.getBoundingClientRect();left=Math.max(left,clip.left);right=Math.min(right,clip.right);
    }
  }
  return bottom>Math.max(top,0)&&top<innerHeight&&right>Math.max(left,0)&&left<innerWidth;
}

function bodyCopy(){
  // Discover the elements that actually own text, including inline captions,
  // dates and diagram labels. Moving their card/button containers would also
  // move photographs, traces or fixed-position controls.
  const owners=new Set<HTMLElement>();
  const roots=document.querySelectorAll<HTMLElement>('main,.site-header,.site-footer,.audio-control,.atlas-map-portal');
  roots.forEach(root=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    for(let text=walker.nextNode();text;text=walker.nextNode()){
      if(text.textContent?.trim()&&text.parentElement)owners.add(text.parentElement);
    }
    root.querySelectorAll<HTMLElement>('select,input[placeholder]').forEach(node=>owners.add(node));
  });
  const candidates=[...owners].filter(node=>visibleCopy(node)&&
    !node.closest('svg,script,style,noscript,option,textarea,.word-heading,.language-dropdown,.page-curtain,.sr-only,.leaflet-pane,.leaflet-control-attribution')&&
    !node.querySelector('.word-heading,img,canvas,video'));
  const all=new Set(candidates);
  return candidates.filter(node=>{
    for(let parent=node.parentElement;parent;parent=parent.parentElement)if(all.has(parent))return false;
    return true;
  });
}

function movesWithCopy(node:HTMLElement){
  const style=getComputedStyle(node);
  return !['absolute','fixed'].includes(style.position)&&style.display!=='inline';
}

/** Hide the old copy before committing translations; headings own their entrance. */
export async function animateLocaleChange(commit:()=>void){
  const root=document.documentElement;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||document.querySelector('.page-curtain[data-active]')){commit();return}
  root.dataset.localePhase='leaving';
  window.dispatchEvent(new Event(localeLeaveEvent));
  const headings=[...document.querySelectorAll<HTMLElement>('.word-heading')].filter(visibleCopy).flatMap(node=>[...node.querySelectorAll('.heading-word')]);
  const outgoing=bodyCopy();
  const scrollAnchor=root.style.overflowAnchor;root.style.overflowAnchor='none';
  const layout=captureLocaleLayout(outgoing,visibleCopy);
  // Store the pre-exit styles once. Reverting a fromTo context would restore
  // its hidden start state after the translated copy has already appeared.
  const properties=['transform','translate','rotate','scale','opacity','filter'];
  const styles=new Map<HTMLElement,{property:string;value:string;priority:string}[]>();
  const remember=(nodes:HTMLElement[])=>nodes.forEach(node=>{
    if(styles.has(node))return;
    const revealing=gsap.getTweensOf(node).some(tween=>tween.vars.y===0&&tween.vars.opacity===1&&tween.vars.filter==='blur(0px)');
    styles.set(node,properties.map(property=>({property,
      value:revealing?(property==='opacity'?'1':property==='filter'?'blur(0px)':''):node.style.getPropertyValue(property),
      priority:node.style.getPropertyPriority(property),
    })));
  });
  remember(outgoing);
  const motions:gsap.core.Animation[]=[];
  try{
    await new Promise<void>(resolve=>{
      const exit=gsap.timeline({onComplete:resolve});
      motions.push(exit);
      if(headings.length)exit.to(headings,{yPercent:105,opacity:0,duration:.32,stagger:{each:Math.min(.025,.12/headings.length),from:'end'},ease:'power3.in',overwrite:true},0);
      for(const moving of [true,false]){
        const targets=outgoing.filter(node=>(movesWithCopy(node)&&!layout.owns(node))===moving);
        if(targets.length)exit.to(targets,{...(moving?{y:13}:{}),opacity:0,filter:'blur(3px)',duration:.26,stagger:{amount:.08,from:'end'},ease:'power2.in',overwrite:'auto'},0);
      }
      if(!headings.length&&!outgoing.length)exit.call(resolve);
    });
    root.dataset.localePhase='swapping';
    commit();
    // React may replace elements keyed by translated titles. Prepare those
    // new elements synchronously, before the browser can paint even one frame.
    const incoming=bodyCopy();
    // Outgoing nodes have opacity zero; collect retained nodes separately.
    const targets=[...new Set([...outgoing.filter(node=>node.isConnected),...incoming])];
    remember(targets);
    gsap.set(targets,{opacity:0,filter:'blur(3px)'});
    // Load the destination font and settle the boxes while all incoming text
    // is hidden. Revealing it during width interpolation changes its wrapping.
    await document.fonts.ready;
    root.dataset.localePhase='resizing';
    const layoutMotion=layout.start(incoming);
    await layoutMotion.then(()=>{});
    layout.finish();
    root.dataset.localePhase='measuring';
    window.dispatchEvent(new Event(localeMeasureEvent));
    await new Promise<void>(resolve=>requestAnimationFrame(()=>{
      window.dispatchEvent(new Event(localeMeasureEvent));resolve();
    }));
    const moving=targets.filter(node=>movesWithCopy(node)&&!layout.owns(node)),stationary=targets.filter(node=>!movesWithCopy(node)||layout.owns(node));
    if(moving.length)gsap.set(moving,{y:13,opacity:0,filter:'blur(3px)'});
    if(stationary.length)gsap.set(stationary,{opacity:0,filter:'blur(3px)'});
    root.dataset.localePhase='entering';
    window.dispatchEvent(new Event(localeEnterEvent));
    await new Promise<void>(resolve=>{
      const entrance=gsap.timeline({onComplete:resolve});motions.push(entrance);
      if(moving.length)entrance.to(moving,{y:0,opacity:1,filter:'blur(0px)',duration:.62,stagger:{amount:.12},ease:'power2.out',overwrite:'auto'},0);
      if(stationary.length)entrance.to(stationary,{opacity:1,filter:'blur(0px)',duration:.62,stagger:{amount:.12},ease:'power2.out',overwrite:'auto'},0);
    });
  }finally{
    layout.finish();
    motions.forEach(motion=>motion.kill());
    styles.forEach((values,node)=>values.forEach(({property,value,priority})=>value?node.style.setProperty(property,value,priority):node.style.removeProperty(property)));
    delete root.dataset.localePhase;
    root.style.overflowAnchor=scrollAnchor;
  }
}
