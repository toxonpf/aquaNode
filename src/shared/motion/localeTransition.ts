import gsap from 'gsap';

export const localeLeaveEvent='aquanode:locale-leave';
export const localeEnterEvent='aquanode:locale-enter';

export function visibleCopy(node:HTMLElement){
  if((node.checkVisibility&&!node.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))||node.closest('[inert],[aria-hidden=true]'))return false;
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
  const candidates=[...document.querySelectorAll<HTMLElement>([
    'main p','main .kicker','main .note','main .badge','main a','main label','main dt','main dd','main figcaption',
    'main button:not(:has(img,canvas))','main .team-profile-kicker','main .team-profile-contact-label',
    '.site-header nav a>span:not(.header-nav-number)','.header-cta','.menu-button',
    '.site-footer p','.site-footer .footer-nav-label','.footer-invitation>a','.footer-return>button',
  ].join(','))].filter(node=>node.textContent?.trim()&&visibleCopy(node)&&
    !node.closest('.word-heading,.language-switch,.page-curtain,.atlas-map-shell,.team-portrait-trigger,.team-profile-portrait')&&
    !node.querySelector('.word-heading')&&
    !node.matches('.buoy-annotation,.story-dive,.ocean-scroll,.ocean-chapters a,.story-return-hint,.circuit-node,.build-step-heading button'));
  const all=new Set(candidates);
  return candidates.filter(node=>{
    for(let parent=node.parentElement;parent;parent=parent.parentElement)if(all.has(parent))return false;
    return true;
  });
}

/** Hide the old copy before committing translations; headings own their entrance. */
export async function animateLocaleChange(commit:()=>void){
  const root=document.documentElement;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||document.querySelector('.page-curtain[data-active]')){commit();return}
  root.dataset.localePhase='leaving';
  window.dispatchEvent(new Event(localeLeaveEvent));
  const headings=[...document.querySelectorAll<HTMLElement>('.word-heading')].filter(visibleCopy).flatMap(node=>[...node.querySelectorAll('.heading-word')]);
  const outgoing=bodyCopy();
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
      if(outgoing.length)exit.to(outgoing,{y:13,opacity:0,filter:'blur(3px)',duration:.26,stagger:{amount:.08,from:'end'},ease:'power2.in',overwrite:'auto'},0);
      if(!headings.length&&!outgoing.length)exit.call(resolve);
    });
    root.dataset.localePhase='swapping';
    commit();
    // Retained elements stay hidden while React updates their text and dimensions.
    await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    root.dataset.localePhase='entering';
    window.dispatchEvent(new Event(localeEnterEvent));
    const incoming=bodyCopy();
    // Outgoing nodes have opacity zero; collect retained nodes separately.
    const targets=[...new Set([...outgoing.filter(node=>node.isConnected),...incoming])];
    remember(targets);
    await new Promise<void>(resolve=>{
      if(!targets.length){resolve();return}
      motions.push(gsap.fromTo(targets,{y:13,opacity:0,filter:'blur(3px)'},{y:0,opacity:1,filter:'blur(0px)',duration:.62,stagger:{amount:.12},ease:'power2.out',overwrite:'auto',onComplete:resolve}));
    });
  }finally{
    motions.forEach(motion=>motion.kill());
    styles.forEach((values,node)=>values.forEach(({property,value,priority})=>value?node.style.setProperty(property,value,priority):node.style.removeProperty(property)));
    delete root.dataset.localePhase;
  }
}
