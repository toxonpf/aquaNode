import {Html} from '@react-three/drei';
import {useFrame,useThree} from '@react-three/fiber';
import {useEffect,useMemo,useRef} from 'react';
import {Color,type Group,type Mesh,type MeshBasicMaterial,type PointsMaterial} from 'three';
import gsap from 'gsap';
import type {SceneShot,SensorKind} from './sceneTypes';

export function StoryAtmosphere({shot}:{shot:SceneShot}){
  const {scene,invalidate}=useThree();
  useEffect(()=>{
    const color=new Color(shot==='sensing'?'#062e39':'#8aaeb8');
    if(!scene.background||!('r' in scene.background))return;
    const tween=gsap.to(scene.background,{r:color.r,g:color.g,b:color.b,duration:1.8,ease:'power2.inOut',onUpdate:invalidate});
    return()=>{tween.kill()};
  },[shot,scene,invalidate]);
  return null;
}

export function WaterParticles({active}:{active:boolean}){
  const group=useRef<Group>(null),material=useRef<PointsMaterial>(null);
  const positions=useMemo(()=>{
    const values=new Float32Array(84*3);
    for(let i=0;i<84;i++){
      values[i*3]=Math.sin(i*127.1)*8;
      values[i*3+1]=-Math.abs(Math.sin(i*311.7))*7;
      values[i*3+2]=Math.sin(i*74.7)*7;
    }
    return values;
  },[]);
  useFrame(({clock},delta)=>{
    if(group.current){group.current.position.y=Math.sin(clock.elapsedTime*.12)*.22;group.current.rotation.y=Math.sin(clock.elapsedTime*.035)*.07}
    if(material.current)material.current.opacity+=((active ? .4 : 0)-material.current.opacity)*(1-Math.exp(-delta*2));
  });
  return <group ref={group}><points frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry>
    <pointsMaterial ref={material} color="#a5d5c5" size={.025} transparent opacity={0} depthWrite={false} sizeAttenuation/>
  </points></group>;
}

export function ProbeFocus({sensor,onChange}:{sensor:SensorKind;onChange?:(sensor:SensorKind)=>void}){
  const rings=useRef<(Mesh|null)[]>([]);
  const color=sensor==='ph'?'#d9ef9f':'#9edbe5';
  useFrame(({clock,camera})=>{
    rings.current.forEach((ring,i)=>{
      if(!ring)return;
      const phase=(clock.elapsedTime*.33+i*.5)%1;
      ring.quaternion.copy(camera.quaternion);
      ring.scale.setScalar(.65+phase*1.1);
      (ring.material as MeshBasicMaterial).opacity=(1-phase)*.3;
    });
  });
  return <group>
    <pointLight position={[0,-2.25,.5]} color={color} intensity={1.3} distance={2.3}/>
    {[0,1].map(i=><mesh key={i} ref={el=>{rings.current[i]=el}} position={[0,-2.32,.2]}>
      <ringGeometry args={[.29,.295,64]}/><meshBasicMaterial color={color} transparent opacity={0} depthWrite={false}/>
    </mesh>)}
    {(['ph','temperature'] as SensorKind[]).map((kind,i)=><Html key={kind} position={[i===0?-.67:.67,-2.25-i*.35,.35]} center zIndexRange={[3,1]}>
      <button className={'sensor-hotspot'+(sensor===kind?' is-active':'')} type="button" tabIndex={-1} aria-hidden="true" onPointerDown={event=>event.preventDefault()} onClick={()=>onChange?.(kind)} aria-pressed={sensor===kind} data-sensor={kind}><i/><span>{kind==='ph'?'pH':'°C'}</span></button>
    </Html>)}
  </group>;
}
