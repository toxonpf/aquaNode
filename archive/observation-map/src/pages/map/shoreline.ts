import type {Coordinates} from './data';

// Local OSM coastline excerpts, ordered with land on the left and water on
// the right. These follow the waterfronts marked in the supplied screenshots.
// OSM contributors / ODbL: https://www.openstreetmap.org/copyright
// Aktau: way 22491858. Honolulu: way 456826902. Retrieved 2026-10-27.
export const aktauCoast:Coordinates[]=[
  [43.6629883,51.1317830],
  [43.6625915,51.1320323],
  [43.6623136,51.1321508],
  [43.6620505,51.1320074],
  [43.6617349,51.1322131],
  [43.6612399,51.1323654],
  [43.6603117,51.1331417],
  [43.6597887,51.1335780],
  [43.6592731,51.1339395],
];
export const hawaiiCoasts:Coordinates[][]=[
  [[21.3070912,-157.8665386],[21.3056504,-157.8663615]],
  [[21.3055921,-157.8663106],[21.3064302,-157.8648180]],
  [[21.3031413,-157.8642164],[21.3023299,-157.8649186]],
];
const metresPerDegree=111195;
/** Place a point a measured distance along the coast, offset to its water side. */
export function offshorePoint(path:Coordinates[],fraction:number,metres:number):Coordinates{
  const longitudeScale=Math.cos(path[0][0]*Math.PI/180)*metresPerDegree;
  const segments=path.slice(1).map((b,index)=>{
    const a=path[index],dx=(b[1]-a[1])*longitudeScale,dy=(b[0]-a[0])*metresPerDegree;
    return {a,b,dx,dy,length:Math.hypot(dx,dy)};
  });
  let remaining=segments.reduce((sum,segment)=>sum+segment.length,0)*Math.max(0,Math.min(1,fraction));
  for(const [index,segment] of segments.entries()){
    if(remaining>segment.length&&index<segments.length-1){remaining-=segment.length;continue}
    const {a,b,dx,dy,length}=segment,t=length?remaining/length:0;
    return [a[0]+(b[0]-a[0])*t-dx/length*metres/metresPerDegree,
      a[1]+(b[1]-a[1])*t+dy/length*metres/longitudeScale];
  }
  return path[0];
}
export function coastRelation(point:Coordinates,path:Coordinates[]){
  const longitudeScale=Math.cos(point[0]*Math.PI/180)*metresPerDegree;
  let distance=Infinity,water=false;
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],ax=(a[1]-point[1])*longitudeScale,ay=(a[0]-point[0])*metresPerDegree,
      dx=(b[1]-a[1])*longitudeScale,dy=(b[0]-a[0])*metresPerDegree,length2=dx*dx+dy*dy;
    if(!length2)continue;
    const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/length2));
    const next=Math.hypot(ax+t*dx,ay+t*dy);
    if(next<distance){distance=next;water=dx*(-ay)-dy*(-ax)<0}
  }
  return {distance,water};
}
