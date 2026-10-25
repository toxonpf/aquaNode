export const oceanDesign={width:1920,height:1080} as const;

/** Fit the reference shot without moving its viewpoint or changing perspective. */
export function desktopOceanFov(referenceFov:number,width:number,height:number){
  const fit=Math.max(1,(oceanDesign.width/oceanDesign.height)/(width/height));
  return Math.atan(Math.tan(referenceFov*Math.PI/360)*fit)*360/Math.PI;
}
