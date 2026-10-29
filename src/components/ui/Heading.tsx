import {Children,cloneElement,isValidElement,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import gsap from 'gsap';
function wordSegments(text:string){
 if(!/[\u3400-\u9fff]/.test(text))return text.split(/(\s+)/);
 const segments=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('zh-TW',{granularity:'word'}).segment(text)].map(item=>item.segment):Array.from(text);
 const result:string[]=[];
 for(const segment of segments){
  if(/^[，。！？、；：）】」』]+$/.test(segment)&&result.length)result[result.length-1]+=segment;
  else result.push(segment);
 }
 return result;
}
function words(children:ReactNode):ReactNode{
  return Children.map(children,child=>{
    // Editorial breaks must not force three rows after translation or resizing.
    if(isValidElement(child)&&child.type==='br')return ' ';
    if(typeof child==='string'||typeof child==='number')return wordSegments(String(child)).map((word,index)=>
      /\S/.test(word)?<span className="heading-word-mask" key={index}><span className="heading-word">{word}</span></span>:word);
    if(isValidElement<{children?:ReactNode}>(child)&&child.props.children!==undefined)return cloneElement(child,{},words(child.props.children));
    return child;
  });
}
function content(children:ReactNode):string{
  return Children.toArray(children).map(child=>isValidElement<{children?:ReactNode}>(child)?content(child.props.children):String(child??'')).join('');
}

export default function Heading({as:Tag='h2',children,className='',...props}:HTMLAttributes<HTMLHeadingElement>&{as?:'h1'|'h2'|'h3'|'span';children:ReactNode}){
  const host=useRef<HTMLHeadingElement>(null),text=content(children);
  useLayoutEffect(()=>{
    const node=host.current,limit=Number(node?.closest('[data-heading-lines]')?.getAttribute('data-heading-lines')??2);
    if(!node||!limit||className.includes('sr-only'))return;
    let width=-1,alive=true;
    const fit=(force=false)=>{
      if(!alive||!node.clientWidth||!force&&Math.abs(width-node.clientWidth)<.5)return;
      width=node.clientWidth;node.style.removeProperty('font-size');
      let upper=parseFloat(getComputedStyle(node).fontSize),lower=Math.min(12,upper);
      const fits=()=>{
        // A grid cell can stretch beyond its text. Count word rows rather than
        // shrinking a heading in response to empty space inside that cell.
        const rows:number[]=[];
        node.querySelectorAll('.heading-word-mask').forEach(word=>{
          const top=word.getBoundingClientRect().top;
          if(!rows.some(row=>Math.abs(row-top)<1))rows.push(top);
        });
        return rows.length<=limit&&node.scrollWidth<=node.clientWidth+1;
      };
      if(fits())return;
      for(let step=0;step<10;step++){
        const size=(lower+upper)/2;node.style.fontSize=`${size}px`;
        if(fits())lower=size;else upper=size;
      }
      node.style.fontSize=`${Math.floor(lower*10)/10}px`;
    };
    const observer=new ResizeObserver(()=>fit());observer.observe(node.parentElement!);
    const resize=()=>fit(true);window.addEventListener('resize',resize);
    document.fonts.ready.then(()=>fit(true));fit(true);
    return()=>{alive=false;observer.disconnect();window.removeEventListener('resize',resize);node.style.removeProperty('font-size')};
  },[text,className]);
  useLayoutEffect(()=>{
    const node=host.current;if(!node||className.includes('sr-only'))return;
    const targets=node.querySelectorAll('.heading-word');
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const curtain=document.querySelector<HTMLElement>('.page-curtain'),stage=node.closest('.ocean-stage');
    const panel=node.closest<HTMLElement>('[data-reader]');
    const chapter=panel?.dataset.reader;
    const reader=panel?.querySelector<HTMLElement>('[data-story-scroll]');
    let visible=false,played=false;
    const reset=()=>{gsap.killTweensOf(targets);gsap.set(targets,{yPercent:105,opacity:0});played=false};
    const show=()=>{
      if(media.matches){gsap.killTweensOf(targets);gsap.set(targets,{clearProps:'transform,opacity'});return}
      if(chapter&&!stage?.classList.contains(`is-${chapter}-ready`)){
        if(played)reset();return;
      }
      if(played)return;
      // Hidden chapters share one sticky viewport. Their intersection entry
      // can stay unchanged while the camera makes the chapter visible.
      // Recheck the reader's clipping bounds when it opens or scrolls.
      if(chapter&&reader){
        const bounds=node.getBoundingClientRect(),clip=reader.getBoundingClientRect();
        visible=Math.min(bounds.bottom,clip.bottom,innerHeight)>Math.max(bounds.top,clip.top,0)&&
          Math.min(bounds.right,clip.right,innerWidth)>Math.max(bounds.left,clip.left,0);
      }
      // The cover is still opaque when the reveal phase begins, which makes
      // it the right moment to start the heading without leaving an empty
      // destination page after the loading state.
      if(!visible||played||(curtain?.hasAttribute('data-active')&&curtain.dataset.phase!=='revealing'))return;
      played=true;
      gsap.to(targets,{yPercent:0,opacity:1,duration:.8,stagger:Math.min(.055,.45/Math.max(1,targets.length-1)),ease:'power3.out',overwrite:true});
    };
    if(!media.matches)reset();
    const view=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;show()},{threshold:.1});
    view.observe(node);
    const state=new MutationObserver(show);
    if(stage)state.observe(stage,{attributes:true,attributeFilter:['class','data-shot']});
    if(curtain)state.observe(curtain,{attributes:true,attributeFilter:['data-active','data-phase']});
    const resize=chapter?new ResizeObserver(show):null;
    if(resize&&reader){resize.observe(node);resize.observe(reader)}
    reader?.addEventListener('scroll',show,{passive:true});
    media.addEventListener('change',show);
    show();
    return()=>{view.disconnect();state.disconnect();resize?.disconnect();reader?.removeEventListener('scroll',show);media.removeEventListener('change',show);gsap.killTweensOf(targets)};
  },[text,className]);
  return <Tag {...props} ref={host} className={`word-heading ${className}`.trim()}>{className.includes('sr-only')?children:words(children)}</Tag>;
}
