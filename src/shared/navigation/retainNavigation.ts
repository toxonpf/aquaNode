const visualProperties=[
  'display','box-sizing','width','height','min-width','min-height','max-width','max-height',
  'padding','margin','gap','row-gap','column-gap','flex','flex-direction','flex-wrap','align-items','justify-content',
  // The copy leaves its layout ancestors, so retain both grid tracks and item placement.
  'grid-template-columns','grid-template-rows','grid-auto-columns','grid-auto-rows','grid-auto-flow',
  'grid-column','grid-row','align-self','justify-self','align-content','justify-items','order',
  'font-family','font-size','font-weight','font-style','line-height','letter-spacing','word-spacing','white-space','text-align','text-transform','text-decoration',
  'color','background','border-top','border-right','border-bottom','border-left','border-radius','box-shadow',
  'outline','outline-offset','opacity','transform','transform-origin','transform-box','vertical-align',
  'fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset','d',
];

function colour(value:string){
  const values=value.match(/[\d.]+/g)?.map(Number);
  if(!value.startsWith('rgb')||!values||values.length<3)return null;
  return {brightness:(values[0]*.2126+values[1]*.7152+values[2]*.0722)/255,alpha:values[3]??1};
}

/** A non-interactive visual copy stays at the original click position. */
export function retainNavigation(anchor:HTMLAnchorElement,curtain:HTMLElement){
  const rect=anchor.getBoundingClientRect();if(!rect.width||!rect.height)return null;
  const copy=anchor.cloneNode(true) as HTMLAnchorElement;
  const originals=[anchor,...anchor.querySelectorAll('*')],copies=[copy,...copy.querySelectorAll('*')];
  const anchorStyle=getComputedStyle(anchor),background=colour(anchorStyle.backgroundColor);
  const lighten=anchorStyle.backgroundImage==='none'&&(!background||background.alpha<.2)&&(colour(anchorStyle.color)?.brightness??1)<.65;
  originals.forEach((source,index)=>{
    const target=copies[index] as HTMLElement|SVGElement,style=getComputedStyle(source);
    for(const property of visualProperties){
      const value=style.getPropertyValue(property);if(value)target.style.setProperty(property,value);
    }
    // Text from a light page needs readable ink on the ocean-coloured cover.
    if(lighten){
      for(const property of ['color','fill','stroke','border-top-color','border-right-color','border-bottom-color','border-left-color']){
        const ink=colour(style.getPropertyValue(property));
        if(ink&&ink.alpha>.1&&ink.brightness<.75)target.style.setProperty(property,'#edf4df');
      }
    }
    target.style.setProperty('animation','none','important');
    target.style.setProperty('transition','none','important');
    target.removeAttribute('id');
  });
  copy.removeAttribute('href');copy.removeAttribute('aria-current');copy.removeAttribute('aria-label');
  copy.inert=true;copy.tabIndex=-1;copy.setAttribute('aria-hidden','true');copy.dataset.retainedNavigation='true';
  Object.assign(copy.style,{position:'absolute',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,minWidth:'0',maxWidth:'none',margin:'0',transform:'none',filter:'none',opacity:'1',pointerEvents:'none',zIndex:'3'});
  curtain.appendChild(copy);
  return copy;
}
