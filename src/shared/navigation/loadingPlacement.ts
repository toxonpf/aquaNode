type Rect={left:number;right:number;top:number;bottom:number};

/** Prefer a clear position nearest the viewport centre, above or below the link. */
export function loadingWordmarkOffset(logo:Rect,button:Rect,viewportHeight:number){
  const gap=32,height=logo.bottom-logo.top;
  if(button.right+gap<=logo.left||button.left-gap>=logo.right)return 0;
  const minimum=24,maximum=Math.max(minimum,viewportHeight-height-24);
  const candidates=[logo.top,button.top-gap-height,button.bottom+gap].map(top=>{
    top=Math.max(minimum,Math.min(maximum,top));
    const overlap=Math.max(0,Math.min(top+height,button.bottom+gap)-Math.max(top,button.top-gap));
    return {top,overlap,distance:Math.abs(top+height/2-viewportHeight/2)};
  });
  candidates.sort((a,b)=>a.overlap-b.overlap||a.distance-b.distance);
  return candidates[0].top-logo.top;
}
