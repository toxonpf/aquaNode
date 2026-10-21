import {RoundedBox} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {useEffect,useMemo,useRef} from 'react';
import {CanvasTexture,SRGBColorSpace,type Group,type Mesh} from 'three';
import gsap from 'gsap';
import type {SensorKind} from './sceneTypes';
import {modelLogoUrl} from './brand';

type Props={hero:boolean;active:number;angle:number;expanded:boolean;sensing?:boolean;sensor?:SensorKind;inside?:boolean};

// Lightweight reconstruction from the reference photographs and STEP assembly.
// The housing, mast and float proportions are illustrative, not fabrication data.
function useHousingLabel(){
  const invalidate=useThree(state=>state.invalidate);
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=768;canvas.height=384;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#edf1e7';ctx.fillRect(0,0,768,384);
    ctx.fillStyle='#748980';ctx.font='24px Arial';ctx.fillText('WATER OBSERVATION',49,225);
    ctx.fillStyle='#b9c7bd';ctx.fillRect(49,265,668,2);
    ctx.fillStyle='#204853';ctx.font='28px Arial';ctx.fillText('pH  /  °C',49,329);
    ctx.fillStyle='#71877e';ctx.font='22px Arial';ctx.fillText('NODE 01',596,329);
    const label=new CanvasTexture(canvas);label.colorSpace=SRGBColorSpace;
    label.anisotropy=4;
    return label;
  },[]);
  useEffect(()=>{
    let alive=true;
    const image=new Image();
    image.onload=()=>{
      if(!alive)return;
      const canvas=texture.image as HTMLCanvasElement;
      canvas.getContext('2d')!.drawImage(image,49,55,668,668*134/738);
      texture.needsUpdate=true;invalidate();
    };
    image.src=modelLogoUrl;
    return()=>{alive=false;texture.dispose()};
  },[texture,invalidate]);
  return texture;
}

export default function BuoyModel({hero,active,angle,expanded,sensing=false,sensor='ph',inside=false}:Props){
  const root=useRef<Group>(null),electronics=useRef<Group>(null),probes=useRef<Group>(null),enclosure=useRef<(Mesh|null)[]>([]);
  const {invalidate}=useThree();
  const label=useHousingLabel();
  const ivory='#edf1e7',navy='#183e49',orange='#df8150';
  const shell=(part:number)=>!hero&&active===part?'#dfedb5':ivory;
  useEffect(()=>{if(root.current){root.current.rotation.y=angle;invalidate()}},[angle,invalidate]);
  useEffect(()=>{
    if(!electronics.current||!probes.current)return;
    // The electronics enclosure remains on its mast in the cutaway view.
    // Only its material and the visibility of its contents change.
    const upper=gsap.to(electronics.current.position,{y:expanded?2.3:1.35,duration:.65,ease:'power2.inOut',onUpdate:invalidate});
    const lower=gsap.to(probes.current.position,{y:expanded?-1.5:-.7,duration:.65,ease:'power2.inOut',onUpdate:invalidate});
    return()=>{upper.kill();lower.kill()};
  },[expanded,invalidate]);
  useEffect(()=>{
    const tweens=enclosure.current.flatMap(mesh=>{
      if(!mesh)return [];
      const material=mesh.material as {transparent:boolean;opacity:number};
      material.transparent=true;
      return [gsap.to(material,{opacity:inside?.1:1,duration:.9,ease:'power2.inOut',onUpdate:invalidate})];
    });
    return()=>{tweens.forEach(tween=>tween.kill())};
  },[inside,invalidate]);
  return <group ref={root} rotation={[0,angle,0]}>
    {/* A moulded rectangular float, with a separate lid and a fine gasket. */}
    <RoundedBox args={[2.56,.93,1.86]} radius={.18} smoothness={4} position={[0,-.15,0]}>
      <meshPhysicalMaterial color={shell(0)} roughness={.48} clearcoat={.22} clearcoatRoughness={.38}/>
    </RoundedBox>
    <RoundedBox args={[2.52,.035,1.82]} radius={.016} smoothness={2} position={[0,.267,0]}>
      <meshStandardMaterial color={navy} roughness={.7}/>
    </RoundedBox>
    <RoundedBox args={[2.59,.19,1.89]} radius={.085} smoothness={4} position={[0,.37,0]}>
      <meshPhysicalMaterial color={shell(0)} roughness={.36} clearcoat={.35}/>
    </RoundedBox>
    {/* Shallow moulding ribs along the float's long faces. */}
    {[-1,1].flatMap(side=>[-.91,-.61,-.31,0,.31,.61,.91].map(x=><RoundedBox key={`${side}-${x}`} args={[.045,.34,.025]} radius={.012} smoothness={2} position={[x,-.19,side*.926]}>
      <meshStandardMaterial color="#d2ddd3" roughness={.65}/>
    </RoundedBox>))}
    {[-1,1].map(side=><group key={side} position={[side*1.16,.48,0]}>
      <RoundedBox args={[.12,.045,.55]} radius={.02} smoothness={2}><meshStandardMaterial color={navy} roughness={.6}/></RoundedBox>
      <mesh position={[0,.055,0]} rotation={[Math.PI/2,0,0]} scale={[1,1.9,1]}>
        <torusGeometry args={[.085,.023,8,24]}/><meshStandardMaterial color={orange} roughness={.35} metalness={.15}/>
      </mesh>
    </group>)}
    {/* The central service mast and weatherproof union. */}
    <mesh position={[0,.48,0]}><cylinderGeometry args={[.23,.27,.08,32]}/><meshStandardMaterial color={ivory} roughness={.42}/></mesh>
    <mesh position={[0,.66,0]}><cylinderGeometry args={[.115,.115,.34,32]}/><meshStandardMaterial color={orange} roughness={.42}/></mesh>
    <mesh position={[0,.78,0]}><cylinderGeometry args={[.17,.17,.105,32]}/><meshStandardMaterial color={navy} roughness={.52}/></mesh>
    <group ref={electronics} position={[0,1.35,0]}>
      <RoundedBox ref={mesh=>{enclosure.current[0]=mesh}} args={[.96,1.13,.43]} radius={.075} smoothness={4}>
        <meshPhysicalMaterial color={shell(1)} roughness={.34} clearcoat={.3} transparent opacity={1}/>
      </RoundedBox>
      <RoundedBox ref={mesh=>{enclosure.current[1]=mesh}} args={[.93,1.10,.025]} radius={.012} smoothness={2} position={[0,0,.22]}><meshStandardMaterial color={navy} roughness={.6} transparent opacity={1}/></RoundedBox>
      <RoundedBox ref={mesh=>{enclosure.current[2]=mesh}} args={[.925,1.095,.075]} radius={.035} smoothness={4} position={[0,0,.26]}>
        <meshPhysicalMaterial color={shell(1)} roughness={.3} clearcoat={.4} transparent opacity={1}/>
      </RoundedBox>
      <mesh ref={mesh=>{enclosure.current[3]=mesh}} position={[0,.07,.299]}><planeGeometry args={[.75,.375]}/><meshStandardMaterial map={label} roughness={.7} transparent opacity={1}/></mesh>
      {!inside&&[-1,1].flatMap(x=>[-1,1].map(y=><group key={`${x}-${y}`} position={[x*.375,y*.455,.305]}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.035,.035,.012,16]}/><meshStandardMaterial color="#9aa8a1" metalness={.75} roughness={.28}/></mesh>
        <mesh position={[0,0,.008]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.035,.007,.003]}/><meshStandardMaterial color="#485e5b"/></mesh>
      </group>))}
      {!inside&&<><RoundedBox args={[.28,.065,.012]} radius={.006} smoothness={2} position={[0,-.315,.302]}><meshStandardMaterial color={navy} roughness={.5}/></RoundedBox>
      <mesh position={[-.085,-.315,.316]}><sphereGeometry args={[.013,12,12]}/><meshStandardMaterial color="#cfebb1" emissive="#83ae49" emissiveIntensity={.6}/></mesh></>}
      <group>
        {/* Open-front, translucent enclosure: the board stays mounted in place. */}
        <RoundedBox args={[.96,1.13,.43]} radius={.075} smoothness={4} position={[0,0,0]}>
          <meshPhysicalMaterial color="#b9d6cf" roughness={.24} transparent opacity={.16} depthWrite={false}/>
        </RoundedBox>
        {[-1,1].map(side=><RoundedBox key={side} args={[.045,1.04,.43]} radius={.018} smoothness={2} position={[side*.43,0,0]}><meshStandardMaterial color="#cad9cf" roughness={.44}/></RoundedBox>)}
        <RoundedBox args={[.76,.96,.045]} radius={.02} smoothness={3} position={[0,-.02,.02]}><meshStandardMaterial color="#18525a" roughness={.42} metalness={.2}/></RoundedBox>
        <mesh position={[0,-.02,.045]}><planeGeometry args={[.66,.82]}/><meshBasicMaterial color="#276a70"/></mesh>
        <RoundedBox args={[.28,.18,.09]} radius={.025} smoothness={3} position={[-.14,.2,.1]}><meshStandardMaterial color="#d9ef9f" roughness={.5}/></RoundedBox>
        <RoundedBox args={[.23,.13,.08]} radius={.022} smoothness={3} position={[.19,.25,.1]}><meshStandardMaterial color="#244b57" roughness={.46}/></RoundedBox>
        <mesh position={[.19,.25,.145]}><boxGeometry args={[.14,.02,.055]}/><meshBasicMaterial color="#9bd5d1"/></mesh>
        <mesh position={[-.22,-.2,.08]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.095,.095,.1,20]}/><meshStandardMaterial color="#df8150" roughness={.42} metalness={.12}/></mesh>
        <RoundedBox args={[.31,.14,.1]} radius={.022} smoothness={3} position={[.16,-.22,.09]}><meshStandardMaterial color="#354d53" roughness={.5}/></RoundedBox>
        {[-.27,-.09,.09,.27].map(x=><mesh key={x} position={[x,-.39,.09]}><boxGeometry args={[.05,.1,.065]}/><meshStandardMaterial color="#d7c476" metalness={.3} roughness={.38}/></mesh>)}
        {[-.31,.31].map(x=><mesh key={x} position={[x,.43,.08]}><cylinderGeometry args={[.027,.027,.035,12]}/><meshStandardMaterial color="#a9aaa0" metalness={.75} roughness={.3}/></mesh>)}
        <mesh position={[0,-.59,0]}><cylinderGeometry args={[.16,.2,.09,24]}/><meshStandardMaterial color="#183e49" roughness={.5}/></mesh>
      </group>
      {/* A sealed antenna connector, collar and tapered whip. */}
      <mesh position={[.26,.602,0]}><cylinderGeometry args={[.052,.062,.09,24]}/><meshStandardMaterial color="#a5a58d" roughness={.3} metalness={.8}/></mesh>
      <mesh position={[.26,.68,0]}><cylinderGeometry args={[.042,.052,.095,24]}/><meshStandardMaterial color={navy} roughness={.4}/></mesh>
      <mesh position={[.26,1.01,0]}><cylinderGeometry args={[.015,.037,.6,24]}/><meshPhysicalMaterial color="#19343b" roughness={.36} clearcoat={.3}/></mesh>
      <mesh position={[.26,1.315,0]}><sphereGeometry args={[.016,12,12]}/><meshStandardMaterial color={navy}/></mesh>
    </group>
    {/* A slotted probe guard, two sensor tips and service collars. */}
    <group ref={probes} visible={!inside} position={[0,-.7,0]}>
      <mesh><cylinderGeometry args={[.19,.19,.22,32]}/><meshStandardMaterial color={ivory} roughness={.4}/></mesh>
      <mesh position={[0,-.2,0]}><cylinderGeometry args={[.14,.14,.22,32]}/><meshStandardMaterial color={navy} roughness={.45}/></mesh>
      <mesh position={[0,-.77,0]}><cylinderGeometry args={[.115,.115,1.1,24]}/><meshStandardMaterial color={orange} roughness={.45}/></mesh>
      <mesh position={[0,-1.38,0]}><cylinderGeometry args={[.19,.19,.14,32]}/><meshStandardMaterial color={navy} roughness={.4}/></mesh>
      {[0,1,2,3,4,5].map(i=><mesh key={i} position={[Math.sin(i*Math.PI/3)*.15,-1.64,Math.cos(i*Math.PI/3)*.15]}>
        <cylinderGeometry args={[.017,.017,.44,8]}/><meshStandardMaterial color={navy} roughness={.4}/>
      </mesh>)}
      {[-1,1].map((side,i)=><group key={side} position={[side*.058,-1.58,0]}>
        <mesh><cylinderGeometry args={[.036,.036,.4,16]}/><meshStandardMaterial color={sensing?(i===0&&sensor==='ph'?'#d9ef9f':i===1&&sensor==='temperature'?'#9edbe5':ivory):shell(2)} emissive={sensing?(i===0&&sensor==='ph'?'#84a948':i===1&&sensor==='temperature'?'#4bafba':'#000000'):'#000000'} emissiveIntensity={.5} metalness={.35} roughness={.25}/></mesh>
        <mesh position={[0,-.215,0]}><sphereGeometry args={[.035,16,12]}/><meshPhysicalMaterial color={i?'#8eafac':'#c4b89c'} roughness={.2} metalness={.25}/></mesh>
      </group>)}
      <mesh position={[0,-1.9,0]}><cylinderGeometry args={[.18,.13,.08,32]}/><meshStandardMaterial color={navy} roughness={.4}/></mesh>
    </group>
  </group>;
}
