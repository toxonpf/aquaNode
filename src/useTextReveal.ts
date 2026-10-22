import {useLayoutEffect} from 'react';
import gsap from 'gsap';

// Body copy uses a quieter current than the word-by-word Heading motion.
const selector=[
  'main p', 'main .kicker', 'main .note', 'main .badge', 'main button',
  'main a', 'main label',
  'main .figure-label', 'main figcaption', 'main dt', 'main dd',
  'main .story-panel article>span', 'main .team-person-info p',
  'main .team-hero-count', 'main .status-foot', 'main .status-number',
  'main .flow>div>span', 'main .footer-row',
].join(',');

export function useTextReveal(key:string){
  useLayoutEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const main=document.querySelector('main');if(!main)return;
    const ctx=gsap.context(()=>{
      const targets=gsap.utils.toArray<HTMLElement>(selector).filter(node=>
        !node.closest('[inert],[aria-hidden=true],.page-curtain')&&
        !node.matches('.buoy-annotation,.story-dive,.ocean-chapters a,.back-to-surface,.back-to-buoy,.back-to-sensors,.signal-back,.story-return-hint')
      );
      // Set the resting state during the layout phase, before the route can
      // paint beneath the page curtain. Previously the nodes painted once at
      // their final state, then `fromTo` hid them when the curtain closed.
      gsap.set(targets,{y:13,opacity:0,filter:'blur(3px)'});
      const curtain=document.querySelector<HTMLElement>('.page-curtain');
      let built=false;
      const build=()=>{
        // Start with the opening ripple instead of waiting until its final
        // frame. The text is already prepared below the opaque cover, so it
        // reaches the reader just as the next page becomes visible.
        if(built||curtain?.hasAttribute('data-active')&&curtain.dataset.phase!=='revealing')return;
        built=true;
      targets.forEach((node,index)=>{
        gsap.to(node,{
          y:0,opacity:1,filter:'blur(0px)',duration:.62,
          delay:Math.min(index%5*.035,.14),ease:'power2.out',overwrite:'auto',
          scrollTrigger:{trigger:node,start:'top 94%',once:true},
        });
      });
      };
      const observer=new MutationObserver(build);
      if(curtain)observer.observe(curtain,{attributes:true,attributeFilter:['data-active','data-phase']});
      build();
      return()=>observer.disconnect();
    },main);
    return()=>ctx.revert();
  },[key]);
}
