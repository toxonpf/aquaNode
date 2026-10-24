import {useLayoutEffect,useRef,type HTMLAttributes,type ReactNode} from 'react';
import gsap from 'gsap';

/** Keep the previous block height while newly selected content is measured. */
export default function AnimatedHeight({children,className='',...props}:HTMLAttributes<HTMLDivElement>&{children:ReactNode}){
  const host=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    const outer=host.current!,inner=content.current!,media=matchMedia('(prefers-reduced-motion:reduce)');
    let previous=-1,motion:gsap.core.Tween|null=null;
    const measure=()=>{
      const style=getComputedStyle(outer);
      const height=inner.offsetHeight+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
      if(Math.abs(height-previous)<.5)return;
      const current=outer.getBoundingClientRect().height;
      motion?.kill();
      if(previous<0||media.matches||!current)outer.style.height=`${height}px`;
      else motion=gsap.fromTo(outer,{height:current},{height,duration:.42,ease:'power2.inOut',overwrite:'auto'});
      previous=height;
    };
    const preference=()=>{motion?.kill();previous=-1;measure()};
    const observer=new ResizeObserver(measure);observer.observe(inner);measure();
    media.addEventListener('change',preference);
    return()=>{motion?.kill();observer.disconnect();media.removeEventListener('change',preference)};
  },[]);
  return <div {...props} ref={host} className={`animated-height ${className}`.trim()}><div ref={content} className="animated-height-content">{children}</div></div>;
}
