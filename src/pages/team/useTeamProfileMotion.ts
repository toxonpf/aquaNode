import {useLayoutEffect,useRef,type RefObject} from 'react';
import gsap from 'gsap';
import {copyPortraitCurrent,syncPortraitCurrent} from './PortraitCurrent';

const clonePortrait=(original:HTMLElement)=>{
  const copy=original.cloneNode(true) as HTMLElement;copyPortraitCurrent(original,copy);return copy;
};

const labels=[
  ['.team-monogram','left','bottom'],['.team-portrait-label','left','top'],
  ['.team-profile-photo-monogram','left','bottom'],['.team-profile-photo-label','left','top'],['.team-profile-photo-index','right','top'],
] as const;

export function useTeamProfileMotion({gallery,dialog,selected,setSelected,count,settlePortrait}:{gallery:RefObject<HTMLElement|null>;dialog:RefObject<HTMLDialogElement|null>;selected:number|null;setSelected:(index:number|null)=>void;count:number;settlePortrait:(button:HTMLButtonElement)=>void}){
  const source=useRef<HTMLButtonElement|null>(null),flight=useRef<HTMLDivElement|null>(null),previous=useRef<HTMLElement|null>(null);
  const flightLayer=useRef<HTMLDivElement|null>(null);
  const flightResize=useRef<ResizeObserver|null>(null);
  const motion=useRef<gsap.core.Timeline|null>(null),closing=useRef(false),switching=useRef(false),direction=useRef(1);
  const settleAfterResize=useRef(false);
  const cards=useRef(new Map<HTMLButtonElement,{opacity:string;visibility:string;tween?:gsap.core.Tween}>());
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tucked=()=>matchMedia('(max-width:760px)').matches?{xPercent:0,yPercent:-100}:{xPercent:-100,yPercent:0};
  const concealed=()=>matchMedia('(max-width:760px)').matches?'inset(0% 0% 100% 0%)':'inset(0% 100% 0% 0%)';
  const phase=(value:string)=>{if(dialog.current)dialog.current.dataset.profilePhase=value};
  const removeFlight=()=>{flightResize.current?.disconnect();flightResize.current=null;flightLayer.current?.remove();flightLayer.current=null;flight.current=null};
  const removePrevious=()=>{previous.current?.remove();previous.current=null};
  const fadeCard=(card:HTMLButtonElement|null,visible:boolean,duration=.4)=>{
    if(!card)return;
    let state=cards.current.get(card);
    if(!state){state={opacity:card.style.opacity,visibility:card.style.visibility};cards.current.set(card,state)}
    state.tween?.kill();
    const original=state;
    state.tween=gsap.to(card,{autoAlpha:visible?1:0,duration:reduced()?0:duration,ease:'sine.inOut',onComplete:()=>{
      if(visible){card.style.opacity=original.opacity;card.style.visibility=original.visibility}
      original.tween=undefined;
    }});
  };
  const restoreCards=()=>{
    cards.current.forEach((state,card)=>{state.tween?.kill();card.style.opacity=state.opacity;card.style.visibility=state.visibility});
    cards.current.clear();
  };
  const restoreCard=(card:HTMLButtonElement|null)=>{
    if(!card)return;
    const state=cards.current.get(card);if(!state)return;
    state.tween?.kill();card.style.opacity=state.opacity;card.style.visibility=state.visibility;
    cards.current.delete(card);
  };
  const centered=(portrait:HTMLElement)=>{
    const rect=portrait.getBoundingClientRect();
    const x=Number(gsap.getProperty(portrait,'x'));
    // Keep the portrait on the card's top edge while it moves to the centre.
    return {x:(innerWidth-rect.width)/2-rect.left+x,y:0};
  };
  const makeFlight=(portrait:HTMLElement,rect:DOMRect)=>{
    removeFlight();
    const element=document.createElement('div');element.className='team-portrait-flight';element.setAttribute('aria-hidden','true');
    const styles=getComputedStyle(portrait);
    ['--portrait-base','--portrait-glow','--portrait-ink'].forEach(name=>element.style.setProperty(name,styles.getPropertyValue(name)));
    const copy=clonePortrait(portrait);
    // A moving portrait must retain the rendered crop, tint and mirror. It is
    // outside the gallery's hover state and the profile's responsive selectors.
    portrait.querySelectorAll('img').forEach((original,index)=>{
      const image=copy.querySelectorAll('img')[index],style=getComputedStyle(original);
      Object.assign(image.style,{transform:style.transform,filter:style.filter,objectPosition:style.objectPosition,objectFit:style.objectFit,transition:'none'});
    });
    copy.style.setProperty('--portrait-shade',styles.getPropertyValue('--portrait-shade'));
    const layer=document.createElement('div');layer.className='team-portrait-flight-layer';
    // Native dialogs paint above the header regardless of its z-index. Clip
    // only the moving layer to the visible page area below the fixed header.
    const headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom??0;
    layer.style.clipPath=`inset(${Math.max(0,headerBottom)}px 0 0)`;
    element.appendChild(copy);layer.appendChild(element);dialog.current!.appendChild(layer);flightLayer.current=layer;
    const badge=(portrait.closest('.team-portrait-trigger')??source.current)?.querySelector('.team-portrait-open')?.cloneNode(true) as HTMLElement|undefined;
    if(badge){badge.classList.add('team-flight-open');element.appendChild(badge)}
    labels.forEach(([selector,horizontal,vertical])=>{
      const original=portrait.querySelector<HTMLElement>(selector),copy=element.querySelector<HTMLElement>(selector);
      if(!original||!copy)return;
      const style=getComputedStyle(original);
      gsap.set(copy,{fontSize:style.fontSize,[horizontal]:style[horizontal],[vertical]:style[vertical]});
    });
    // Interpolating `none` into a polygon starts its percentage coordinates
    // at zero in GSAP, cropping the return image before growing it back.
    gsap.set(element,{left:rect.left,top:rect.top,width:rect.width,height:rect.height,clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)'});flight.current=element;
    const sync=()=>element.querySelectorAll('.team-member-portrait').forEach(syncPortraitCurrent);
    flightResize.current=new ResizeObserver(sync);flightResize.current.observe(element);sync();
    return element;
  };
  const matchFlightText=(timeline:gsap.core.Timeline,moving:HTMLElement,target:HTMLElement,start:number,duration:number)=>{
    labels.forEach(([selector,horizontal,vertical])=>{
      const original=target.querySelector<HTMLElement>(selector),copy=moving.querySelector<HTMLElement>(selector);
      if(!original||!copy)return;
      const style=getComputedStyle(original);
      timeline.to(copy,{fontSize:style.fontSize,[horizontal]:style[horizontal],[vertical]:style[vertical],duration,ease:'power3.inOut'},start);
    });
  };
  const finishClose=()=>{
    const target=source.current,rect=target?.getBoundingClientRect();
    restoreCards();removeFlight();removePrevious();closing.current=false;switching.current=false;
    if(dialog.current)delete dialog.current.dataset.profilePhase;
    dialog.current?.close();
    setSelected(null);
    if(rect&&rect.bottom>60&&rect.top<innerHeight-30)target?.focus({preventScroll:true});
  };
  const closeProfile=()=>{
    const element=dialog.current;
    if(!element?.open||closing.current)return;
    closing.current=true;switching.current=false;motion.current?.kill();
    if(reduced()){finishClose();return}
    phase('closing');
    const portrait=element.querySelector<HTMLElement>('.team-profile-portrait')!;
    const picture=portrait.querySelector<HTMLElement>('.team-portrait:not(.team-profile-previous)')!;
    const viewport=element.querySelector<HTMLElement>('.team-profile-info-viewport')!;
    const info=element.querySelector<HTMLElement>('.team-profile-info')!;
    const content=element.querySelector<HTMLElement>('.team-profile-content')!;
    const center=centered(portrait);
    const moving=flight.current??makeFlight(picture,portrait.getBoundingClientRect());
    const badge=moving.querySelector('.team-flight-open');
    if(badge)gsap.set(badge,{opacity:0,y:8});
    // Closing during a member change keeps both visible layers for the first
    // part of the return, instead of snapping the new photo into place.
    const oldPicture=previous.current?clonePortrait(previous.current):undefined;
    if(oldPicture){
      moving.appendChild(oldPicture);
      gsap.set(oldPicture,{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:1});
    }
    removePrevious();
    if(source.current)settlePortrait(source.current);
    const destination=source.current?.getBoundingClientRect();
    const onScreen=destination&&destination.bottom>60&&destination.top<innerHeight-30;
    const centerRect={left:(innerWidth-portrait.offsetWidth)/2,top:portrait.getBoundingClientRect().top-Number(gsap.getProperty(portrait,'y')),width:portrait.offsetWidth,height:portrait.offsetHeight};
    gsap.set(moving,{opacity:1});gsap.set(portrait,{opacity:0});fadeCard(source.current,false,.2);
    const timeline=gsap.timeline({onComplete:finishClose})
      .to(info,{...tucked(),duration:.44,ease:'power3.inOut'},0)
      .to(viewport,{...center,clipPath:concealed(),duration:.44,ease:'power3.inOut'},0)
      .set(viewport,{autoAlpha:0},.44)
      .to(content,{scrollTop:0,duration:.35,ease:'power2.inOut'},0)
      .to(moving,{...centerRect,clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',duration:.44,ease:'power3.inOut'},0)
      .to(element.querySelector('.team-dialog-close'),{opacity:0,duration:element.dataset.escapePressed? .28 : .18},element.dataset.escapePressed? .14 : 0);
    timeline.to(moving.querySelector('.team-portrait:not(.team-profile-previous)'),{xPercent:0,x:0,duration:.3,ease:'power3.out'},0);
    if(oldPicture)timeline.to(oldPicture,{opacity:0,duration:.3,ease:'sine.out'},0);
    matchFlightText(timeline,moving,picture,0,.44);
    if(onScreen&&destination){
      timeline.to(moving,{left:destination.left,top:destination.top,width:destination.width,height:destination.height,duration:.6,ease:'power3.inOut'},.48)
        // Hand the same, fully opaque image back in one frame. Cross-fading
        // both copies caused an opacity dip and a second apparent appearance.
        .call(()=>restoreCard(source.current),[],1.08);
      timeline.to(moving.querySelector('.team-member-portrait'),{'--portrait-shade':0,duration:.6,ease:'sine.inOut'},.48);
      if(badge)timeline.to(badge,{opacity:1,y:0,duration:.25,ease:'sine.out'},.83);
      matchFlightText(timeline,moving,source.current!, .48,.6);
    }else{
      timeline.call(()=>fadeCard(source.current,true,.3),[],.48)
        .to(moving,{opacity:0,duration:.3,ease:'sine.inOut'},.48);
    }
    timeline.to(element,{'--backdrop-strength':0,duration:.6,ease:'sine.inOut'},.48);
    motion.current=timeline;
  };
  const openProfile=(index:number,button:HTMLButtonElement)=>{
    if(closing.current||dialog.current?.open)return;
    source.current=button;setSelected(index);
  };
  const changeMember=(step:number)=>{
    const element=dialog.current;
    if(!element||closing.current||switching.current||selected===null)return;
    motion.current?.progress(1).kill();
    const next=(selected+step+count)%count;
    const commit=()=>{
      fadeCard(source.current,true);
      source.current=gallery.current?.querySelectorAll<HTMLButtonElement>('.team-portrait-trigger')[next]??null;
      if(source.current)settlePortrait(source.current);
      if(!reduced())fadeCard(source.current,false);
      direction.current=step;setSelected(next);
    };
    if(reduced()){commit();return}
    switching.current=true;phase('collapsing');removePrevious();
    const portrait=element.querySelector<HTMLElement>('.team-profile-portrait')!;
    const snapshot=clonePortrait(portrait.querySelector<HTMLElement>('.team-portrait')!);
    const styles=getComputedStyle(portrait);
    ['--portrait-base','--portrait-glow','--portrait-ink'].forEach(name=>snapshot.style.setProperty(name,styles.getPropertyValue(name)));
    snapshot.classList.add('team-profile-previous');snapshot.setAttribute('aria-hidden','true');
    portrait.appendChild(snapshot);previous.current=snapshot;
    const info=element.querySelector<HTMLElement>('.team-profile-info')!;
    const viewport=element.querySelector<HTMLElement>('.team-profile-info-viewport')!;
    const content=element.querySelector<HTMLElement>('.team-profile-content')!;
    const center=centered(portrait);
    motion.current=gsap.timeline({onComplete:commit})
      .to(info,{...tucked(),duration:.46,ease:'power3.inOut'},0)
      .to([portrait,viewport],{...center,duration:.46,ease:'power3.inOut'},0)
      .to(viewport,{clipPath:concealed(),duration:.46,ease:'power3.inOut'},0)
      .set(viewport,{autoAlpha:0},.46)
      .to(content,{scrollTop:0,duration:.35,ease:'power2.inOut'},0)
      .to(element.querySelector('.team-dialog-close'),{opacity:0,duration:.18},0)
      .call(()=>phase('centered'),[],.46)
      .to({},{duration:.04},.46);
  };
  const onClosed=()=>{
    // A queued native close event must not clear a profile reopened meanwhile.
    if(dialog.current?.open)return;
    motion.current?.kill();restoreCards();removeFlight();removePrevious();closing.current=false;switching.current=false;if(dialog.current)delete dialog.current.dataset.profilePhase;setSelected(null);
  };

  // Reserve the scrollbar width so the destination in the gallery never moves on open/close.
  useLayoutEffect(()=>{
    if(selected===null)return;
    const overflow=document.body.style.overflow,padding=document.body.style.paddingRight;
    const width=innerWidth-document.documentElement.clientWidth;
    if(width)document.body.style.paddingRight=`${parseFloat(getComputedStyle(document.body).paddingRight)+width}px`;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=overflow;document.body.style.paddingRight=padding};
  },[selected!==null]);
  useLayoutEffect(()=>{
    if(selected===null)return;
    const element=dialog.current;if(!element)return;
    motion.current?.kill();removeFlight();
    const opening=!element.open;
    if(opening)element.showModal();
    const portrait=element.querySelector<HTMLElement>('.team-profile-portrait')!;
    const picture=portrait.querySelector<HTMLElement>('.team-portrait:not(.team-profile-previous)')!;
    const viewport=element.querySelector<HTMLElement>('.team-profile-info-viewport')!;
    const info=element.querySelector<HTMLElement>('.team-profile-info')!;
    const details=info.querySelectorAll<HTMLElement>(':scope > *');
    const close=element.querySelector('.team-dialog-close');
    if(opening)(close as HTMLButtonElement|null)?.focus({preventScroll:true});
    const content=element.querySelector<HTMLElement>('.team-profile-content')!;
    content.scrollTop=0;
    gsap.set([portrait,picture,viewport,info,...details],{clearProps:'transform,opacity,visibility,clipPath'});gsap.set(close,{opacity:1});
    if(!opening)gsap.set(element,{'--backdrop-strength':1});
    if(reduced()||settleAfterResize.current){settleAfterResize.current=false;removePrevious();switching.current=false;phase('open');gsap.set(element,{'--backdrop-strength':1});return}
    const center=centered(portrait);
    gsap.set([portrait,viewport],center);gsap.set(info,tucked());
    gsap.set(viewport,{autoAlpha:0,clipPath:concealed()});
    const timeline=gsap.timeline({onComplete:()=>{switching.current=false;phase('open')}});
    let expandAt=.56;
    if(opening&&source.current){
      phase('arriving');
      const original=source.current.querySelector<HTMLElement>('.team-portrait')!;
      const from=original.getBoundingClientRect(),to=portrait.getBoundingClientRect();
      const moving=makeFlight(original,from);
      const sourceClip=getComputedStyle(source.current).clipPath;
      if(sourceClip!=='none')gsap.set(moving,{clipPath:sourceClip});
      settlePortrait(source.current);
      fadeCard(source.current,false,.32);gsap.set(portrait,{opacity:0});
      timeline.fromTo(element,{'--backdrop-strength':0},{'--backdrop-strength':1,duration:.5,ease:'sine.out'},0)
        .to(moving,{left:to.left,top:to.top,width:to.width,height:to.height,clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',duration:.6,ease:'power3.inOut'},0)
        .to(moving.querySelector('.team-member-portrait'),{'--portrait-shade':1,duration:.6,ease:'sine.inOut'},0)
        .call(()=>copyPortraitCurrent(moving,picture),[],.6)
        .set(portrait,{opacity:1},.6)
        .call(()=>phase('centered'),[],.6)
        .to(moving,{opacity:0,duration:.04,onComplete:removeFlight},.6);
      matchFlightText(timeline,moving,picture,0,.6);
      const badge=moving.querySelector('.team-flight-open');
      if(badge)timeline.to(badge,{opacity:0,y:8,duration:.32,ease:'sine.out'},.08);
      expandAt=.66;
    }else{
      phase('changing');
      if(previous.current)timeline.to(previous.current,{xPercent:-100*direction.current,duration:.52,ease:'power3.inOut',onComplete:removePrevious},0);
      timeline.fromTo(picture,{xPercent:100*direction.current},{xPercent:0,duration:.52,ease:'power3.inOut'},0)
        .call(()=>phase('centered'),[],.52);
    }
    timeline.call(()=>phase('expanding'),[],expandAt)
      .set(viewport,{autoAlpha:1},expandAt)
      .to([portrait,viewport],{x:0,y:0,duration:.68,ease:'power3.inOut'},expandAt)
      .to(viewport,{clipPath:'inset(0% 0% 0% 0%)',duration:.68,ease:'power3.inOut'},expandAt)
      .to(info,{xPercent:0,yPercent:0,duration:.68,ease:'power3.inOut'},expandAt)
      .fromTo(details,{y:6,opacity:0},{y:0,opacity:1,duration:.32,stagger:.02,ease:'sine.out'},expandAt+.3)
      .fromTo(close,{opacity:0},{opacity:1,duration:.22},expandAt+.4);
    motion.current=timeline;
    return()=>{timeline.kill()};
  },[selected,dialog]);
  useLayoutEffect(()=>{
    const resize=()=>{
      if(!dialog.current?.open)return;
      // Finishing the collapse commits the next member. Its layout effect
      // should settle immediately at the new size rather than replay entry.
      settleAfterResize.current=dialog.current.dataset.profilePhase==='collapsing';
      motion.current?.progress(1);
      if(closing.current||!dialog.current?.open)return;
      const elements=dialog.current.querySelectorAll('.team-profile-portrait,.team-profile-info-viewport,.team-profile-info');
      gsap.set(elements,{clearProps:'transform'});
      gsap.set(dialog.current.querySelector('.team-profile-info-viewport'),{autoAlpha:1,clipPath:'inset(0% 0% 0% 0%)'});
    };
    window.addEventListener('resize',resize);
    return()=>{window.removeEventListener('resize',resize);motion.current?.kill();restoreCards();removeFlight();removePrevious()};
  },[]);
  return {openProfile,closeProfile,changeMember,onClosed};
}
