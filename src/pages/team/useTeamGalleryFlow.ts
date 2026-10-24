import {useCallback,useLayoutEffect,useRef,type RefObject} from 'react';
import gsap from 'gsap';

export function useTeamGalleryFlow(gallery:RefObject<HTMLElement|null>){
  const finishReveal=useRef<(button:HTMLButtonElement)=>void>(()=>{});
  useLayoutEffect(()=>{
    const host=gallery.current,grid=host?.querySelector<HTMLElement>('.team-gallery-grid');
    if(!host||!grid)return;
    const cards=Array.from(grid.querySelectorAll<HTMLElement>('.team-person'));
    const note=grid.querySelector<HTMLElement>('.team-gallery-note');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,alive=true,lastWidth=0;
    const layout=()=>{
      frame=0;
      if(innerWidth<=760){
        [...cards,...(note?[note]:[])].forEach(card=>{card.style.gridRow=''});
        return;
      }
      const ends=[0,0],gap=innerWidth<=1050?32:48,unit=4;
      // Balance the second portrait between the first and third, so both handoffs stay visible.
      const portraitHeights=cards.map(card=>card.querySelector<HTMLElement>('.team-portrait-trigger')!.offsetHeight);
      const secondTop=(portraitHeights[0]+cards[0].offsetHeight+gap-portraitHeights[1])/2;
      cards.forEach((card,index)=>{
        const lane=index%2;
        const top=index===1?Math.round(secondTop):ends[lane];
        const height=card.offsetHeight;
        card.style.gridRow=`${Math.ceil(top/unit)+1} / span ${Math.ceil(height/unit)}`;
        ends[lane]=top+height+gap;
      });
      if(note){
        const last=cards[cards.length-1];
        const top=Math.max(ends[1]+20,ends[0]-last.offsetHeight*.7);
        note.style.gridRow=`${Math.ceil(top/unit)+1} / span ${Math.ceil(note.offsetHeight/unit)}`;
      }
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(layout)};
    const resize=new ResizeObserver(entries=>{
      if(entries.some(entry=>entry.target!==grid||Math.abs(entry.contentRect.width-lastWidth)>.5)){
        lastWidth=grid.getBoundingClientRect().width;schedule();
      }
    });
    resize.observe(grid);cards.forEach(card=>resize.observe(card));if(note)resize.observe(note);
    window.addEventListener('resize',schedule);
    document.fonts.ready.then(()=>{if(alive)schedule()});
    layout();
    const context=gsap.context(()=>{
      if(reduced.matches)return;
      cards.forEach((card,index)=>{
        gsap.set(card.querySelector('.team-portrait-trigger'),{clipPath:index%2?'polygon(0 0,100% 0,100% 8%,0 16%)':'polygon(0 0,100% 0,100% 16%,0 8%)'});
        gsap.set(card.querySelector('.team-portrait-visual'),{yPercent:9,scale:1.06});
      });
    },host);
    const revealed=new Set<HTMLElement>();
    const reveals=new Map<HTMLElement,gsap.core.Timeline>();
    const reveal=(card:HTMLElement)=>{
      if(reduced.matches||revealed.has(card))return;
      revealed.add(card);
      context.add(()=>{
        reveals.set(card,gsap.timeline()
          .to(card.querySelector('.team-portrait-trigger'),{clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',duration:1.05,ease:'power3.inOut'},0)
          .to(card.querySelector('.team-portrait-visual'),{yPercent:0,scale:1,duration:1.3,ease:'power3.out'},.08)
          .fromTo(card.querySelectorAll('.team-person-info,.team-contacts'),{y:15,opacity:0},{y:0,opacity:1,duration:.65,stagger:.08,ease:'power2.out'},.3));
      });
    };
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){reveal(entry.target as HTMLElement);observer.unobserve(entry.target)}
    }),{rootMargin:'0px 0px 140px 0px',threshold:0});
    // A profile can select a card that has not entered the viewport yet.
    // Its return destination must already be at rest, without a second reveal.
    finishReveal.current=button=>{
      const card=button.closest<HTMLElement>('.team-person');if(!card)return;
      observer.unobserve(card);revealed.add(card);
      reveals.get(card)?.progress(1).kill();
      context.add(()=>{
        gsap.set(button,{clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)'});
        gsap.set(button.querySelector('.team-portrait-visual'),{yPercent:0,scale:1});
      });
    };
    cards.forEach(card=>observer.observe(card));
    return()=>{alive=false;finishReveal.current=()=>{};cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();window.removeEventListener('resize',schedule);context.revert()};
  },[gallery]);
  return useCallback((button:HTMLButtonElement)=>finishReveal.current(button),[]);
}
