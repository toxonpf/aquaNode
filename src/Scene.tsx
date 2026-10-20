import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {useEffect,useRef} from 'react';
import type {Group} from 'three';
import gsap from 'gsap';
type Props={hero:boolean;active:number;angle:number;expanded:boolean;onUnavailable:()=>void};
function Model({hero,active,angle,expanded}:Props){const ref=useRef<Group>(null);const {invalidate}=useThree();useEffect(()=>{if(ref.current){ref.current.rotation.y=angle;invalidate()}},[angle,invalidate]);const color=(n:number)=>!hero&&active===n?'#c5ee87':'#e6e9df';return <group ref={ref} rotation={[0,angle,0]}>
<mesh position={[0,0,0]}><cylinderGeometry args={[1.35,1.2,.48,64]}/><meshStandardMaterial color={color(0)} roughness={.55} metalness={.1}/></mesh>
<mesh position={[0,.25,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.03,.14,12,64]}/><meshStandardMaterial color="#b8e48c" roughness={.6}/></mesh>
<group position={[0,expanded?1.25:.56,0]}><mesh><cylinderGeometry args={[.57,.65,.62,48]}/><meshStandardMaterial color={color(1)} roughness={.4}/></mesh><mesh position={[0,.34,0]}><cylinderGeometry args={[.58,.58,.08,48]}/><meshStandardMaterial color="#385768" roughness={.5}/></mesh><mesh position={[.18,.85,0]}><cylinderGeometry args={[.025,.035,1,12]}/><meshStandardMaterial color="#243a44"/></mesh><mesh position={[.18,1.36,0]}><sphereGeometry args={[.045,12,12]}/><meshStandardMaterial color="#c5ee87"/></mesh></group>
<group position={[0,expanded?-1.4:-.5,0]}>{[-.35,.35].map((x,i)=><mesh key={x} position={[x,-.25-i*.12,0]}><cylinderGeometry args={[.07,.07,.95+i*.24,16]}/><meshStandardMaterial color={color(2)} metalness={.7} roughness={.3}/></mesh>)}</group>
</group>}
function CameraStory({hero}:{hero:boolean}){const {camera,invalidate}=useThree();useEffect(()=>{if(!hero)return;const tween=gsap.to(camera.position,{y:4,z:6,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1},onUpdate:()=>{camera.lookAt(0,0,0);invalidate()}});return()=>{tween.scrollTrigger?.kill();tween.kill()}},[hero,camera,invalidate]);return null}
export default function Scene(props:Props){return <Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:props.hero?[0,7,4]:[4,3.3,5],fov:42}} gl={{antialias:true,alpha:true,powerPreference:'low-power'}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();props.onUnavailable()})}}><ambientLight intensity={1.5}/><directionalLight position={[4,8,5]} intensity={3}/><directionalLight position={[-4,2,-3]} color="#56b7dd" intensity={2}/><Model {...props}/>{[2,2.8,3.8].map(r=><mesh key={r} rotation={[-Math.PI/2,0,0]} position={[0,-.28,0]}><ringGeometry args={[r,r+.012,100]}/><meshBasicMaterial color="#8ad6de" transparent opacity={.22}/></mesh>)}<CameraStory hero={props.hero}/>{!props.hero&&<OrbitControls makeDefault enablePan={false} enableDamping={false} minDistance={4} maxDistance={9} minPolarAngle={.2} maxPolarAngle={Math.PI*.8}/>}</Canvas>}

