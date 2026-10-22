import {Children,cloneElement,isValidElement,useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import gsap from 'gsap';
import './heading.css';

function words(children:ReactNode):ReactNode{
  return Children.map(children,child=>{
    if(typeof child==='string'||typeof child==='number')return String(child).split(/(\s+)/).map((word,index)=>
      /\S/.test(word)?<span className="heading-word-mask" key={index}><span className="heading-word">{word}</span></span>:word);
    if(isValidElement<{children?:ReactNode}>(child)&&child.props.children!==undefined)return cloneElement(child,{},words(child.props.children));
    return child;
  });
}
function content(children:ReactNode):string{
  return Children.toArray(children).map(child=>isValidElement<{children?:ReactNode}>(child)?content(child.props.children):String(child??'')).join('');
}

export default function Heading({as:Tag='h2',children,className='',...props}:HTMLAttributes<HTMLHeadingElement>&{as?:'h1'|'h2'|'h3';children:ReactNode}){
  const host=useRef<HTMLHeadingElement>(null),text=content(children);
  useLayoutEffect(()=>{
    const node=host.current;if(!node||className.includes('sr-only'))return;
    const targets=node.querySelectorAll('.heading-word');
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const curtain=document.querySelector<HTMLElement>('.page-curtain'),stage=node.closest('.ocean-stage');
    const chapter=node.closest<HTMLElement>('[data-reader]')?.dataset.reader;
    let visible=false,played=false;
    const reset=()=>{gsap.killTweensOf(targets);gsap.set(targets,{yPercent:105,opacity:0});played=false};
    const show=()=>{
      if(media.matches){gsap.killTweensOf(targets);gsap.set(targets,{clearProps:'transform,opacity'});return}
      if(chapter&&!stage?.classList.contains(`is-${chapter}-ready`)){
        if(played)reset();return;
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
    media.addEventListener('change',show);
    return()=>{view.disconnect();state.disconnect();media.removeEventListener('change',show);gsap.killTweensOf(targets)};
  },[text,className]);
  return <Tag {...props} ref={host} className={`word-heading ${className}`.trim()}>{className.includes('sr-only')?children:words(children)}</Tag>;
}
