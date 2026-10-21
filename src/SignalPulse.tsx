import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {type Mesh,type MeshBasicMaterial} from 'three';

// Illustrative radio pulses, anchored to the buoy's antenna.
export default function SignalPulse({active}:{active:boolean}){
  const rings=useRef<(Mesh|null)[]>([]);
  const visibility=useRef(0),time=useRef(0);
  useFrame(({camera},delta)=>{
    visibility.current+=((active?1:0)-visibility.current)*(1-Math.exp(-delta*3));
    if(active)time.current+=delta;
    rings.current.forEach((ring,i)=>{
      if(!ring)return;
      const phase=(time.current*.3+i/3)%1;
      ring.quaternion.copy(camera.quaternion);
      ring.scale.setScalar(.18+phase*3.5);
      (ring.material as MeshBasicMaterial).opacity=Math.sin(phase*Math.PI)*(1-phase)*.7*visibility.current;
      ring.visible=visibility.current>.005;
    });
  });
  return <group position={[.26,2.665,0]}>{[0,1,2].map(i=><mesh key={i} ref={mesh=>{rings.current[i]=mesh}}>
    <ringGeometry args={[.98,1,96]}/><meshBasicMaterial color="#e2efb9" transparent opacity={0} depthWrite={false}/>
  </mesh>)}</group>;
}
