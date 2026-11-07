import gsap from 'gsap';
import {Flip} from 'gsap/Flip';

gsap.registerPlugin(Flip);

/** Match boxes by DOM position, including cards recreated with translated keys. */
function layoutKey(node:HTMLElement){
  const parts:string[]=[];
  for(let current:Element|null=node;current&&current!==document.body;current=current.parentElement){
    parts.push(`${current.tagName}:${current.parentElement?Array.from(current.parentElement.children).indexOf(current):0}`);
  }
  return `locale-${parts.reverse().join('/')}`;
}

export function captureLocaleLayout(copy:HTMLElement[],isVisible:(node:HTMLElement)=>boolean){
  const originals=new Map<HTMLElement,string|null>();
  const collect=(seeds:HTMLElement[])=>{
    const boxes=new Set<HTMLElement>();
    for(const seed of seeds)for(let node:HTMLElement|null=seed;node&&node!==document.body;node=node.parentElement){
      if(node.matches('main,.ocean-stage,.atlas-map-shell'))break;
      if(node.closest('.heading-word-mask,svg,.leaflet-pane,.language-dropdown,.page-curtain'))continue;
      if(getComputedStyle(node).display!=='inline'&&isVisible(node))boxes.add(node);
    }
    for(const node of boxes){
      if(!originals.has(node))originals.set(node,node.getAttribute('data-flip-id'));
      node.setAttribute('data-flip-id',layoutKey(node));
    }
    return [...boxes];
  };
  const headingBoxes=[...document.querySelectorAll<HTMLElement>('.word-heading')].filter(isVisible);
  const before=collect([...copy,...headingBoxes]);
  const state=Flip.getState(before);
  let current=new Set(before),motion:gsap.core.Timeline|null=null;
  const properties=['transform','translate','rotate','scale','transform-origin','width','height','min-width','max-width','min-height','max-height','position','top','left','z-index'];
  const styles=new Map<HTMLElement,{property:string;value:string;priority:string}[]>();
  let finished=false;
  return {
    owns:(node:HTMLElement)=>current.has(node),
    start(incoming:HTMLElement[]){
      // Hidden retained text is already represented by its old box. Visible
      // new text discovers replacement cards before the browser paints them.
      current=new Set([...before.filter(node=>node.isConnected),...collect(incoming)]);
      current.forEach(node=>styles.set(node,properties.map(property=>({property,value:node.style.getPropertyValue(property),priority:node.style.getPropertyPriority(property)}))));
      // Opacity belongs to the text entrance. Flip's default cleanup also
      // restores opacity, which would briefly hide text again at completion.
      motion=Flip.from(state,{targets:[...current],duration:.52,ease:'power2.inOut',scale:false,nested:true,prune:true,clearProps:false});
      return motion;
    },
    finish(){
      if(finished)return;finished=true;
      motion?.progress(1).kill();
      styles.forEach((values,node)=>values.forEach(({property,value,priority})=>value?node.style.setProperty(property,value,priority):node.style.removeProperty(property)));
      originals.forEach((value,node)=>value===null?node.removeAttribute('data-flip-id'):node.setAttribute('data-flip-id',value));
    },
  };
}
