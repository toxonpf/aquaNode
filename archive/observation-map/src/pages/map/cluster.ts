import Supercluster from 'supercluster';
import type {Buoy,Coordinates,RegionId} from './data';

export type BuoyGroup={id:string;members:Buoy[];position:Coordinates;expansionZoom:number};
/** Stable geographic hierarchies. A chain of neighbours no longer collapses
 * an entire shoreline into one group at every intermediate zoom level. */
export function createBuoyClusters(buoys:Buoy[]){
  const regions=[...new Set(buoys.map(buoy=>buoy.region))];
  const indexes=new Map<RegionId,Supercluster<{buoy:Buoy}>>();
  for(const region of regions){
    const index=new Supercluster<{buoy:Buoy}>({radius:52,extent:256,maxZoom:19,minPoints:2});
    index.load(buoys.filter(buoy=>buoy.region===region).map(buoy=>({type:'Feature',properties:{buoy},geometry:{type:'Point',coordinates:[buoy.position[1],buoy.position[0]]}})));
    indexes.set(region,index);
  }
  return (zoom:number):BuoyGroup[]=>regions.flatMap(region=>{
    const index=indexes.get(region)!;
    return index.getClusters([-180,-85,180,85],Math.floor(zoom)).map(feature=>{
      const properties=feature.properties;
      if(!('cluster' in properties)){
        const buoy=properties.buoy;
        return {id:buoy.id,members:[buoy],position:buoy.position,expansionZoom:20};
      }
      const members=index.getLeaves(properties.cluster_id,Infinity).map(point=>point.properties.buoy);
      const [lon,lat]=feature.geometry.coordinates,k=Math.cos(lat*Math.PI/180);
      // Keep the group over a real water-side member, never an inland centroid.
      const representative=[...members].sort((a,b)=>
        Math.hypot(a.position[0]-lat,(a.position[1]-lon)*k)-Math.hypot(b.position[0]-lat,(b.position[1]-lon)*k))[0];
      return {id:`${region}:${properties.cluster_id}`,members,position:representative.position,expansionZoom:index.getClusterExpansionZoom(properties.cluster_id)};
    });
  });
}
