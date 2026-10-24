import {PlaneGeometry} from 'three';

// Keep the original 80-unit / 256-cell resolution near the buoy. Sixteen
// progressively wider cells on each edge extend the water for aerial shots.
export function createOceanGeometry(){
  const geometry=new PlaneGeometry(288,288,288,288);
  const positions=geometry.attributes.position;
  const stretch=(value:number)=>{
    const distance=Math.abs(value);
    return Math.sign(value)*(distance<=128?distance*80/256:40+120*((distance-128)/16)**1.7);
  };
  for(let i=0;i<positions.count;i++)positions.setXY(i,stretch(positions.getX(i)),stretch(positions.getY(i)));
  positions.needsUpdate=true;
  geometry.computeBoundingSphere();
  return geometry;
}
