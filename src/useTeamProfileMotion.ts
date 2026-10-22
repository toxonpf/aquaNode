import {useLayoutEffect,useRef,type RefObject} from 'react';
import gsap from 'gsap';

export function useTeamProfileMotion({gallery,dialog,selected,setSelected,count}:{gallery:RefObject<HTMLElement|null>;dialog:RefObject<HTMLDialogElement|null>;selected:number|null;setSelected:(index:number|null)=>void;count:number}){
  const source=useRef<HTMLButtonElement|null>(null),flight=useRef<HTMLDivElement|null>(null),previous=useRef<HTMLElement|null>(null);
  const motion=useRef<gsap.core.Timeline|null>(null),closing=useRef(false),switching=useRef(false),direction=useRef(1);
  const cards=useRef(new Map<HTMLButtonElement,{opacity:string;visibility:string;tween?:gsap.core.Tween}>());
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tucked=()=>matchMedia('(max-width:760px)').matches?{xPercent:0,yPercent:-100}:{xPercent:-100,yPercent:0};
  const phase=(value:string)=>{if(dialog.current)dialog.current.dataset.profilePhase=value};
  const removeFlight=()=>{flight.current?.remove();flight.current=null};
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
  const centered=(portrait:HTMLElement)=>{
    const rect=portrait.getBoundingClientRect();
    const content=dialog.current!.querySelector<HTMLElement>('.team-profile-content')!;
    const x=Number(gsap.getProperty(portrait,'x')),y=Number(gsap.getProperty(portrait,'y'));
    return {x:(innerWidth-rect.width)/2-rect.left+x,y:(innerHeight-rect.height)/2-rect.top+y-content.scrollTop};
  };
  const makeFlight=(portrait:HTMLElement,rect:DOMRect)=>{
    removeFlight();
    const element=document.createElement('div');element.className='team-portrait-flight';element.setAttribute('aria-hidden','true');
    const styles=getComputedStyle(portrait);
    ['--portrait-base','--portrait-glow','--portrait-ink'].forEach(name=>element.style.setProperty(name,styles.getPropertyValue(name)));
    element.appendChild(portrait.cloneNode(true));dialog.current!.appendChild(element);
    ['.team-monogram','.team-portrait-label'].forEach(selector=>{
      const original=portrait.querySelector<HTMLElement>(selector),copy=element.querySelector<HTMLElement>(selector);
      if(!original||!copy)return;
      const style=getComputedStyle(original);
      gsap.set(copy,{fontSize:style.fontSize,left:style.left,...(selector==='.team-monogram'?{bottom:style.bottom}:{top:style.top})});
    });
    gsap.set(element,{left:rect.left,top:rect.top,width:rect.width,height:rect.height});flight.current=element;
    return element;
  };
  const matchFlightText=(timeline:gsap.core.Timeline,moving:HTMLElement,target:HTMLElement,start:number,duration:number)=>{
    ['.team-monogram','.team-portrait-label'].forEach(selector=>{
      const original=target.querySelector<HTMLElement>(selector),copy=moving.querySelector<HTMLElement>(selector);
      if(!original||!copy)return;
      const style=getComputedStyle(original);
      timeline.to(copy,{fontSize:style.fontSize,left:style.left,...(selector==='.team-monogram'?{bottom:style.bottom}:{top:style.top}),duration,ease:'power3.inOut'},start);
    });
  };
  const finishClose=()=>{
    const target=source.current,rect=target?.getBoundingClientRect();
    restoreCards();removeFlight();removePrevious();closing.current=false;switching.current=false;
    if(dialog.current)delete dialog.current.dataset.profilePhase;
    dialog.current?.close();
    if(rect&&rect.bottom>60&&rect.top<innerHeight-30)target?.focus({preventScroll:true});
  };
  const closeProfile=()=>{
    const element=dialog.current;
    if(!element?.open||closing.current)return;
    closing.current=true;switching.current=false;motion.current?.kill();removePrevious();
    if(reduced()){finishClose();return}
    phase('closing');
    const portrait=element.querySelector<HTMLElement>('.team-profile-portrait')!;
    const picture=portrait.querySelector<HTMLElement>('.team-portrait')!;
    gsap.set(picture,{clearProps:'transform,opacity'});
    const viewport=element.querySelector<HTMLElement>('.team-profile-info-viewport')!;
    const info=element.querySelector<HTMLElement>('.team-profile-info')!;
    const content=element.querySelector<HTMLElement>('.team-profile-content')!;
    const center=centered(portrait);
    const moving=flight.current??makeFlight(picture,portrait.getBoundingClientRect());
    const destination=source.current?.getBoundingClientRect();
    const onScreen=destination&&destination.bottom>60&&destination.top<innerHeight-30;
    const centerRect={left:(innerWidth-portrait.offsetWidth)/2,top:(innerHeight-portrait.offsetHeight)/2,width:portrait.offsetWidth,height:portrait.offsetHeight};
    gsap.set(moving,{opacity:1});gsap.set(portrait,{opacity:0});fadeCard(source.current,false,.2);
    const timeline=gsap.timeline({onComplete:finishClose})
      .to(info,{...tucked(),duration:.44,ease:'power3.inOut'},0)
      .to(viewport,{...center,duration:.44,ease:'power3.inOut'},0)
      .to(content,{scrollTop:0,duration:.35,ease:'power2.inOut'},0)
      .to(moving,{...centerRect,duration:.44,ease:'power3.inOut'},0)
      .to(element.querySelector('.team-dialog-close'),{opacity:0,duration:.18},0);
    matchFlightText(timeline,moving,picture,0,.44);
    if(onScreen&&destination){
      timeline.to(moving,{left:destination.left,top:destination.top,width:destination.width,height:destination.height,duration:.6,ease:'power3.inOut'},.48)
        .call(()=>fadeCard(source.current,true,.18),[],1.08)
        .to(moving,{opacity:0,duration:.18,ease:'sine.inOut'},1.08);
      matchFlightText(timeline,moving,source.current!, .48,.6);
    }else{
      timeline.call(()=>fadeCard(source.current,true,.3),[],.48)
        .to(moving,{opacity:0,duration:.3,ease:'sine.inOut'},.48);
    }
    timeline.to(element,{'--backdrop-strength':0,duration:.6,ease:'sine.inOut'},.48);
    motion.current=timeline;
  };
  const openProfile=(index:number,button:HTMLButtonElement)=>{
    if(closing.current)return;
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
      if(!reduced())fadeCard(source.current,false);
      direction.current=step;setSelected(next);
    };
    if(reduced()){commit();return}
    switching.current=true;phase('collapsing');removePrevious();
    const portrait=element.querySelector<HTMLElement>('.team-profile-portrait')!;
    const snapshot=portrait.querySelector<HTMLElement>('.team-portrait')!.cloneNode(true) as HTMLElement;
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
      .to(content,{scrollTop:0,duration:.35,ease:'power2.inOut'},0)
      .to(element.querySelector('.team-dialog-close'),{opacity:0,duration:.18},0)
      .call(()=>phase('centered'),[],.46)
      .to({},{duration:.04},.46);
  };
  const onClosed=()=>{motion.current?.kill();restoreCards();removeFlight();removePrevious();closing.current=false;switching.current=false;if(dialog.current)delete dialog.current.dataset.profilePhase;setSelected(null)};

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
    const fieldPhoto=info.querySelector<HTMLElement>('.team-profile-field-photo');
    const details=Array.from(info.querySelectorAll<HTMLElement>(':scope > *')).filter(detail=>detail!==fieldPhoto);
    const close=element.querySelector('.team-dialog-close');
    if(opening)(close as HTMLButtonElement|null)?.focus({preventScroll:true});
    const content=element.querySelector<HTMLElement>('.team-profile-content')!;
    content.scrollTop=0;
    gsap.set([portrait,picture,viewport,info,...details],{clearProps:'transform,opacity,clipPath'});gsap.set(close,{opacity:1});
    if(!opening)gsap.set(element,{'--backdrop-strength':1});
    if(reduced()){removePrevious();switching.current=false;phase('open');gsap.set(element,{'--backdrop-strength':1});return}
    const center=centered(portrait);
    gsap.set([portrait,viewport],center);gsap.set(info,tucked());
    const timeline=gsap.timeline({onComplete:()=>{switching.current=false;phase('open')}});
    let expandAt=.56;
    if(opening&&source.current){
      phase('arriving');
      const from=source.current.getBoundingClientRect(),to=portrait.getBoundingClientRect();
      const moving=makeFlight(source.current.querySelector<HTMLElement>('.team-portrait')!,from);
      fadeCard(source.current,false,.32);gsap.set(portrait,{opacity:0});
      timeline.fromTo(element,{'--backdrop-strength':0},{'--backdrop-strength':1,duration:.5,ease:'sine.out'},0)
        .to(moving,{left:to.left,top:to.top,width:to.width,height:to.height,duration:.6,ease:'power3.inOut'},0)
        .set(portrait,{opacity:1},.6)
        .call(()=>phase('centered'),[],.6)
        .to(moving,{opacity:0,duration:.04,onComplete:removeFlight},.6);
      matchFlightText(timeline,moving,picture,0,.6);
      expandAt=.66;
    }else{
      phase('changing');
      if(previous.current)timeline.to(previous.current,{xPercent:-100*direction.current,duration:.52,ease:'power3.inOut',onComplete:removePrevious},0);
      timeline.fromTo(picture,{xPercent:100*direction.current},{xPercent:0,duration:.52,ease:'power3.inOut'},0)
        .call(()=>phase('centered'),[],.52);
    }
    timeline.call(()=>phase('expanding'),[],expandAt)
      .to([portrait,viewport],{x:0,y:0,duration:.68,ease:'power3.inOut'},expandAt)
      .to(info,{xPercent:0,yPercent:0,duration:.68,ease:'power3.inOut'},expandAt)
      .fromTo(details,{y:6,opacity:0},{y:0,opacity:1,duration:.32,stagger:.02,ease:'sine.out'},expandAt+.3)
      .fromTo(close,{opacity:0},{opacity:1,duration:.22},expandAt+.4);
    if(fieldPhoto)timeline.fromTo(fieldPhoto,{x:26,opacity:0},{x:0,opacity:1,duration:.58,ease:'power3.out'},expandAt+.23);
    motion.current=timeline;
    return()=>{timeline.kill()};
  },[selected,dialog]);
  useLayoutEffect(()=>{
    const resize=()=>{
      if(!dialog.current?.open)return;
      motion.current?.progress(1);
      if(closing.current)return;
      const elements=dialog.current.querySelectorAll('.team-profile-portrait,.team-profile-info-viewport,.team-profile-info');
      gsap.set(elements,{clearProps:'transform'});
    };
    window.addEventListener('resize',resize);
    return()=>{window.removeEventListener('resize',resize);motion.current?.kill();restoreCards();removeFlight();removePrevious()};
  },[]);
  return {openProfile,closeProfile,changeMember,onClosed};
}
