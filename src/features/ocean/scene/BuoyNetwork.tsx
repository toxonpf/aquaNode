import {RoundedBox} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {useEffect,useRef} from 'react';
import {type Group,type Material,type Mesh} from 'three';
import {sampleOcean} from './ocean';
import {networkNodes} from './networkLayout';

const nodeScale=.78;

function NetworkBuoy({x,z,index}:{x:number;z:number;index:number}){
  const group=useRef<Group>(null);
  useFrame(({clock})=>{
    if(!group.current)return;
    const wave=sampleOcean(x,z,clock.elapsedTime);
    group.current.position.set(x,wave.height,z);
    group.current.rotation.set(Math.atan(wave.dz)*.65,.25+index*.3,-Math.atan(wave.dx)*.65);
  });
  return <group ref={group} scale={nodeScale}>
    <RoundedBox args={[2.56,.8,1.86]} radius={.15} smoothness={2} position={[0,-.12,0]}><meshStandardMaterial color="#edf1e7" roughness={.4} transparent/></RoundedBox>
    <RoundedBox args={[2.58,.16,1.88]} radius={.07} smoothness={2} position={[0,.35,0]}><meshStandardMaterial color="#f3f4e9" roughness={.4} transparent/></RoundedBox>
    {[-1,1].map(side=><mesh key={side} position={[side*1.13,.47,0]} rotation={[Math.PI/2,0,0]} scale={[1,1.8,1]}><torusGeometry args={[.085,.025,6,16]}/><meshStandardMaterial color="#df8150" transparent/></mesh>)}
    <mesh position={[0,.65,0]}><cylinderGeometry args={[.12,.12,.4,12]}/><meshStandardMaterial color="#df8150" transparent/></mesh>
    <RoundedBox args={[.96,1.13,.43]} radius={.06} smoothness={2} position={[0,1.35,0]}><meshStandardMaterial color="#edf1e7" roughness={.38} transparent/></RoundedBox>
    <mesh position={[0,1.08,.225]}><boxGeometry args={[.28,.06,.015]}/><meshStandardMaterial color="#193e49" transparent/></mesh>
    <mesh position={[.26,2.25,0]}><cylinderGeometry args={[.014,.035,.75,10]}/><meshStandardMaterial color="#193e49" transparent/></mesh>
  </group>;
}

export default function BuoyNetwork({active,visible}:{active:boolean;visible:boolean}){
  const group=useRef<Group>(null),opacity=useRef(0);
  const materials=useRef<Material[]>([]);
  useEffect(()=>{
    group.current?.traverse(object=>{
      if((object as Mesh).isMesh){
        const material=(object as Mesh).material;
        const items=Array.isArray(material)?material:[material];
        materials.current.push(...items);
      }
    });
    return()=>{materials.current=[]};
  },[]);
  useFrame((_,delta)=>{
    opacity.current+=((active&&visible?1:0)-opacity.current)*(1-Math.exp(-delta*2.2));
    if(!group.current)return;
    group.current.visible=opacity.current>.005;
    materials.current.forEach(material=>{material.opacity=opacity.current});
  });
  return <group ref={group} visible={false} name="conceptual-buoy-network">
    {networkNodes.slice(1).map(([x,z],index)=><NetworkBuoy key={index} x={x} z={z} index={index}/>)}
  </group>;
}
