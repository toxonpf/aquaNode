import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Group,PerspectiveCamera} from 'three';
import gsap from 'gsap';
import {Vector3} from 'three';
import {BUOY_ARROW_ANCHOR,type BuoyAnchorHandler} from './buoyAnchors';
import {ProbeFocus,StoryAtmosphere,WaterParticles} from './Underwater';
import type {SceneShot,SensorKind} from './sceneTypes';
import Model from './BuoyModel';
import SignalPulse from './SignalPulse';
import BuoyNetwork from './BuoyNetwork';
import {sampleOcean,oceanImmersion} from './ocean';
import Ocean from './OceanSurface';

type Props={hero:boolean;active:number;angle:number;expanded:boolean;onUnavailable:()=>void;onReady?:()=>void;onProgress?:(progress:number)=>void;shot?:SceneShot;showInside?:boolean;sensor?:SensorKind;onSensorChange?:(sensor:SensorKind)=>void;onShotSettled?:(shot:SceneShot)=>void;onBuoyAnchor?:BuoyAnchorHandler;onImmersionChange?:(value:number)=>void};


function RubberDuck(){
  const {scene}=useGLTF('/models/rubber-duck/scene.gltf');
  const model=useMemo(()=>scene.clone(),[scene]);
  // The duck rests on the forward-left corner of the float, clear of the mast.
  return <primitive object={model} position={[-.82,.47,.29]} rotation={[0,-.45,0]} scale={.42}/>;
}

useGLTF.preload('/models/rubber-duck/scene.gltf');

function FloatingBuoy({visible,shot,showInside=false,sensor='ph',onSensorChange,onBuoyAnchor}:{visible:boolean;shot?:SceneShot;showInside?:boolean;sensor?:SensorKind;onSensorChange?:(sensor:SensorKind)=>void;onBuoyAnchor?:BuoyAnchorHandler}){
  const group=useRef<Group>(null);
  const anchor=useMemo(()=>new Vector3(),[]);
  const outward=useMemo(()=>new Vector3(),[]);
  useFrame(({clock,camera,size},delta)=>{
    if(!group.current||!visible)return;
    const wave=sampleOcean(0,0,clock.elapsedTime);
    const response=1-Math.exp(-Math.min(delta,.1)*5);
    group.current.position.y+=(wave.height-group.current.position.y)*response;
    group.current.rotation.x+=(Math.atan(wave.dz)*.8-group.current.rotation.x)*response;
    group.current.rotation.z+=(-Math.atan(wave.dx)*.8-group.current.rotation.z)*response;
    group.current.rotation.y=.25+Math.sin(clock.elapsedTime*.16)*.035;
    if(shot==='surface'&&onBuoyAnchor){
      group.current.updateWorldMatrix(true,false);camera.updateMatrixWorld();
      anchor.set(...BUOY_ARROW_ANCHOR);group.current.localToWorld(anchor);anchor.project(camera);
      outward.set(BUOY_ARROW_ANCHOR[0]+.4,BUOY_ARROW_ANCHOR[1],BUOY_ARROW_ANCHOR[2]);
      group.current.localToWorld(outward);outward.project(camera);
      onBuoyAnchor((anchor.x*.5+.5)*size.width,(-anchor.y*.5+.5)*size.height,delta,(outward.x-anchor.x)*size.width*.5,-(outward.y-anchor.y)*size.height*.5);
    }
  });
  return <group ref={group}><Model hero active={0} angle={0} expanded={false} sensing={shot==='sensing'} inside={showInside} sensor={sensor}/><RubberDuck/><SignalPulse active={shot==='signal'}/>{shot==='sensing'&&<ProbeFocus sensor={sensor} onChange={onSensorChange}/>}</group>;
}

function CameraShot({shot='surface',onSettled}:{shot?:SceneShot;onSettled?:Props['onShotSettled']}){
  const {camera:sceneCamera,invalidate,size}=useThree();
  const camera=sceneCamera as PerspectiveCamera;
  const target=useRef({x:0,y:0,z:0});
  const first=useRef(true);
  const mobile=size.width<=760;
  const compactMobile=mobile&&size.height<780;
  useEffect(()=>{
    const detail=shot==='detail';
    // Reserve the reading column while keeping the outer buoys inside narrow viewports.
    const signalDistance=Math.max(1,2/(size.width/size.height))*(size.width<1600?1.1:1);
    const signalLookX=size.width<1600?8.5:4.3;
    const insideDistance=Math.max(1,1.5/(size.width/size.height));
    const insideLookX=size.width<1050?-1.9:-1.55;
    const destination=shot==='signal'
      ?mobile?{x:0,y:75,z:35,tx:0,ty:-75,tz:0,fov:48}:{x:2,y:25*signalDistance,z:15*signalDistance,tx:signalLookX,ty:0,tz:0,fov:43}
      :shot==='inside'
      ?mobile?{x:1.8,y:1.2,z:10.5,tx:-.35,ty:-.55,tz:0,fov:48}:{x:3.25*insideDistance,y:1.25+.9*insideDistance,z:5.2*insideDistance,tx:insideLookX,ty:1.25,tz:0,fov:42}
      :shot==='sensing'
      ?mobile?{x:.8,y:-1.8,z:compactMobile?8:7.5,tx:0,ty:compactMobile?-3.55:-3,tz:0,fov:48}:{x:-3.1,y:-1.7,z:6.1,tx:-1.6,ty:-1.35,tz:0,fov:43}
      :detail
      ?mobile?{x:1,y:2.65,z:10.4,tx:0,ty:-1.1,tz:0,fov:48}:{x:2.8,y:3.15,z:7.2,tx:1.95,ty:.6,tz:0,fov:42}
      :{x:0,y:12.8,z:7.2,tx:0,ty:0,tz:0,fov:42};
    const rig={x:camera.position.x,y:camera.position.y,z:camera.position.z,tx:target.current.x,ty:target.current.y,tz:target.current.z,fov:camera.fov};
    const apply=()=>{
      camera.position.set(rig.x,rig.y,rig.z);
      target.current={x:rig.tx,y:rig.ty,z:rig.tz};
      camera.lookAt(rig.tx,rig.ty,rig.tz);
      camera.fov=rig.fov;
      camera.updateProjectionMatrix();
      invalidate();
    };
    if(first.current&&shot==='surface'){
      first.current=false;Object.assign(rig,destination);apply();onSettled?.(shot);return;
    }
    first.current=false;
    const tween=gsap.to(rig,{...destination,duration:shot==='sensing'?2.2:1.8,ease:'power3.inOut',onUpdate:apply,onComplete:()=>onSettled?.(shot)});
    return()=>{tween.kill()};
  },[shot,mobile,compactMobile,size.width,size.height,camera,invalidate,onSettled]);
  return null;
}

function FirstFrame({onReady}:{onReady?:()=>void}){
  const signalled=useRef(false);
  useFrame(()=>{if(!signalled.current){signalled.current=true;requestAnimationFrame(()=>onReady?.())}});
  return null;
}

function WaterSound({onChange}:{onChange?:Props['onImmersionChange']}){
  const previous=useRef(-1);
  useFrame(({camera})=>{
    const value=oceanImmersion(camera.position.y);
    if(Math.abs(value-previous.current)>.01){previous.current=value;onChange?.(value)}
  });
  return null;
}

function ModelFraming({expanded}:{expanded:boolean}){
  const {camera,invalidate}=useThree();
  useEffect(()=>{
    const tween=gsap.to(camera,{zoom:expanded ? .62 : 1,duration:.65,ease:'power2.inOut',onUpdate:()=>{camera.updateProjectionMatrix();invalidate()}});
    return()=>{tween.kill()};
  },[camera,expanded,invalidate]);
  return null;
}

export default function Scene(props:Props){
  const wrapper=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    let intersecting=false;
    const update=()=>setVisible(intersecting&&!document.hidden);
    const observer=new IntersectionObserver(([entry])=>{intersecting=entry.isIntersecting;update()});
    if(wrapper.current)observer.observe(wrapper.current);
    document.addEventListener('visibilitychange',update);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)};
  },[]);
  return <div ref={wrapper} style={{width:'100%',height:'100%'}}><Canvas frameloop={props.hero&&visible?'always':'demand'} dpr={[1,1.5]} camera={{position:props.hero?[0,12.8,7.2]:[4,3.3,5],fov:42,near:.1,far:180}} gl={{antialias:true,alpha:true,powerPreference:'low-power'}} onCreated={({gl,camera})=>{camera.lookAt(0,0,0);props.onProgress?.(85);gl.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();props.onUnavailable()})}}>
    <ambientLight intensity={.75}/><hemisphereLight args={['#e7f3ef','#35616c',1.1]}/><directionalLight position={[-4,9,-5]} intensity={3.4} color="#fff4d9"/><directionalLight position={[3,4,6]} color="#a1d5e4" intensity={1.3}/>
    {props.hero?<><color attach="background" args={['#8aaeb8']}/><StoryAtmosphere shot={props.shot||'surface'}/><Ocean/><WaterParticles active={props.shot==='sensing'}/><FloatingBuoy visible={visible} shot={props.shot} showInside={props.showInside} sensor={props.sensor} onSensorChange={props.onSensorChange} onBuoyAnchor={props.onBuoyAnchor}/><BuoyNetwork active={props.shot==='signal'} visible={visible}/><CameraShot shot={props.shot} onSettled={props.onShotSettled}/></>:<><Model {...props}/><ModelFraming expanded={props.expanded}/></>}
    {!props.hero&&[1.7,2.3,3.1].map(r=><mesh key={r} rotation={[-Math.PI/2,0,0]} position={[0,-.22,0]}><ringGeometry args={[r,r+.008,96]}/><meshBasicMaterial color="#76afb5" transparent opacity={.2}/></mesh>)}
    <FirstFrame onReady={props.onReady}/>{props.hero&&<WaterSound onChange={props.onImmersionChange}/>}{!props.hero&&<OrbitControls makeDefault enablePan={false} enableDamping={false} minDistance={4} maxDistance={9} minPolarAngle={.2} maxPolarAngle={Math.PI*.8}/>}
  </Canvas></div>;
}
