import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Group,PerspectiveCamera,ShaderMaterial} from 'three';
import gsap from 'gsap';
import {OCEAN_LEVEL,oceanWaveShader,sampleOcean} from './ocean';

type Props={hero:boolean;active:number;angle:number;expanded:boolean;onUnavailable:()=>void;onReady?:()=>void;onProgress?:(progress:number)=>void;shot?:'surface'|'detail';onShotSettled?:(shot:'surface'|'detail')=>void};

function Model({hero,active,angle,expanded}:Props){
  const ref=useRef<Group>(null);
  const electronics=useRef<Group>(null);
  const probes=useRef<Group>(null);
  const {invalidate}=useThree();
  useEffect(()=>{if(ref.current){ref.current.rotation.y=angle;invalidate()}},[angle,invalidate]);
  useEffect(()=>{
    if(!electronics.current||!probes.current)return;
    const tween=gsap.to(electronics.current.position,{y:expanded?1.7:.54,duration:.65,ease:'power2.inOut',onUpdate:invalidate});
    const lower=gsap.to(probes.current.position,{y:expanded?-1.5:-.5,duration:.65,ease:'power2.inOut',onUpdate:invalidate});
    return()=>{tween.kill();lower.kill()};
  },[expanded,invalidate]);
  const color=(n:number)=>!hero&&active===n?'#d9ef9f':'#edf1e6';
  return <group ref={ref} rotation={[0,angle,0]}>
    <mesh><cylinderGeometry args={[1.32,1.15,.43,64]}/><meshStandardMaterial color={color(0)} roughness={.48}/></mesh>
    <mesh position={[0,-.13,0]}><cylinderGeometry args={[1.28,1.16,.22,64]}/><meshStandardMaterial color="#174757" roughness={.5}/></mesh>
    <mesh position={[0,.2,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.16,.105,12,64]}/><meshStandardMaterial color="#ed764f" roughness={.5}/></mesh>
    {[0,1,2,3].map(i=><mesh key={i} position={[Math.sin(i*Math.PI/2)*.94,.229,Math.cos(i*Math.PI/2)*.94]} rotation={[0,-i*Math.PI/2,0]}><boxGeometry args={[.35,.025,.28]}/><meshStandardMaterial color="#214552" roughness={.35} metalness={.35}/></mesh>)}
    <group ref={electronics} position={[0,.54,0]}>
      <mesh><cylinderGeometry args={[.54,.63,.59,48]}/><meshStandardMaterial color={color(1)} roughness={.35}/></mesh>
      <mesh position={[0,.31,0]}><cylinderGeometry args={[.55,.55,.06,48]}/><meshStandardMaterial color="#193e4d" roughness={.45}/></mesh>
      <mesh position={[0,.352,0]}><cylinderGeometry args={[.4,.4,.025,48]}/><meshStandardMaterial color="#244d5e" metalness={.4} roughness={.3}/></mesh>
      {[-.2,0,.2].map(x=><mesh key={x} position={[x,.368,0]}><boxGeometry args={[.008,.008,.6]}/><meshStandardMaterial color="#567d86"/></mesh>)}
      <mesh position={[.22,.8,.05]}><cylinderGeometry args={[.018,.03,.94,12]}/><meshStandardMaterial color="#123543"/></mesh>
      <mesh position={[.22,1.28,.05]}><sphereGeometry args={[.035,12,12]}/><meshStandardMaterial color="#ed764f"/></mesh>
      <mesh position={[0,.04,.567]}><boxGeometry args={[.21,.09,.028]}/><meshStandardMaterial color="#193e4d"/></mesh>
      <mesh position={[.15,.05,.55]}><sphereGeometry args={[.026,12,12]}/><meshStandardMaterial color="#c6eb84" emissive="#779a34" emissiveIntensity={.4}/></mesh>
    </group>
    <group ref={probes} position={[0,-.5,0]}>{[-.32,.32].map((x,i)=><group key={x} position={[x,-.22-i*.12,0]}><mesh><cylinderGeometry args={[.065,.065,.9+i*.22,16]}/><meshStandardMaterial color={color(2)} metalness={.65} roughness={.32}/></mesh><mesh position={[0,-.5-i*.1,0]}><cylinderGeometry args={[.07,.04,.17,16]}/><meshStandardMaterial color={i?'#8bbdca':'#dc9168'} metalness={.3} roughness={.3}/></mesh></group>)}</group>
  </group>;
}

// A displaced surface with analytic normals, sky reflection and small wind ripples.
// No external textures or post-processing are needed.
function Ocean(){
  const material=useRef<ShaderMaterial>(null);
  const uniforms=useMemo(()=>({uTime:{value:0}}),[]);
  useFrame(({clock})=>{if(material.current)material.current.uniforms.uTime.value=clock.elapsedTime});
  return <mesh frustumCulled={false}>
    <planeGeometry args={[80,80,256,256]}/>
    <shaderMaterial ref={material} uniforms={uniforms}
      vertexShader={`
        uniform float uTime;
        varying vec3 vWorld;
        varying vec3 vNormal;
        varying float vHeight;
        ${oceanWaveShader}
        void main(){
          vec2 p=vec2(position.x,-position.y);
          float height; vec2 slope;
          sampleWaves(p,uTime,height,slope);
          vec3 displaced=vec3(p.x,height+${OCEAN_LEVEL.toFixed(3)},p.y);
          vWorld=(modelMatrix*vec4(displaced,1.0)).xyz;
          vNormal=normalize(vec3(-slope.x,1.0,-slope.y));
          vHeight=height;
          gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.0);
        }
      `}
      fragmentShader={`
        uniform float uTime;
        varying vec3 vWorld;
        varying vec3 vNormal;
        varying float vHeight;
        ${oceanWaveShader}
        void main(){
          vec2 p=vWorld.xz;
          float t=uTime;
          // Fine wind ripples break up the reflected light without displacing the mesh.
          float rippleA=sin(p.x*19.5+p.y*12.4-t*1.9+sin(p.y*2.2+t*.3));
          float rippleB=sin(p.y*24.2-p.x*9.7-t*1.5+sin(p.x*3.1-t*.2));
          float height; vec2 slope;
          sampleWaves(p,t,height,slope);
          vec3 normal=normalize(vec3(-slope.x+rippleA*.055,1.0,-slope.y+rippleB*.045));
          vec3 viewDirection=normalize(cameraPosition-vWorld);
          vec3 lightDirection=normalize(vec3(-.48,1.0,-.58));
          float fresnel=.025+.975*pow(1.0-max(dot(normal,viewDirection),0.0),5.0);
          float current=sin(p.x*.43+p.y*.58+t*.08)*.5+.5;
          vec3 deep=vec3(.018,.145,.19);
          vec3 turquoise=vec3(.028,.295,.33);
          vec3 color=mix(deep,turquoise,.45+height*.9+current*.16);
          float diffuse=max(dot(normal,lightDirection),0.0);
          color*=.68+diffuse*.45;
          vec3 reflected=reflect(-viewDirection,normal);
          vec3 sky=mix(vec3(.28,.52,.60),vec3(.69,.83,.85),smoothstep(0.0,1.0,reflected.y));
          color=mix(color,sky,fresnel*.75);
          float sun=max(dot(reflect(-lightDirection,normal),viewDirection),0.0);
          color+=vec3(.86,.96,.94)*(pow(sun,320.0)*.72+pow(sun,32.0)*.035);
          // A soft contact shadow and broken waterline tie the buoy to the surface.
          float distanceToBuoy=length(p);
          color*=1.0-.22*exp(-distanceToBuoy*distanceToBuoy*1.1);
          float waterline=exp(-pow((distanceToBuoy-1.27)/.10,2.0));
          float foam=waterline*(.3+.3*sin(atan(p.y,p.x)*17.0+t*1.5));
          color=mix(color,vec3(.65,.84,.81),max(foam,0.0)*.25);
          // The low camera sees a distant horizon; blend it into the sky.
          float haze=smoothstep(14.0,43.0,length(cameraPosition-vWorld));
          color=mix(color,vec3(.254,.423,.48),haze);
          gl_FragColor=vec4(color,1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `}/>
  </mesh>;
}

function FloatingBuoy({visible}:{visible:boolean}){
  const group=useRef<Group>(null);
  useFrame(({clock},delta)=>{
    if(!group.current||!visible)return;
    const wave=sampleOcean(0,0,clock.elapsedTime);
    const response=1-Math.exp(-Math.min(delta,.1)*5);
    group.current.position.y+=(wave.height-group.current.position.y)*response;
    group.current.rotation.x+=(Math.atan(wave.dz)*.8-group.current.rotation.x)*response;
    group.current.rotation.z+=(-Math.atan(wave.dx)*.8-group.current.rotation.z)*response;
    group.current.rotation.y=.25+Math.sin(clock.elapsedTime*.16)*.035;
  });
  return <group ref={group}><Model hero active={0} angle={0} expanded={false} onUnavailable={()=>{}}/></group>;
}

function CameraShot({shot='surface',onSettled}:{shot?:'surface'|'detail';onSettled?:Props['onShotSettled']}){
  const {camera:sceneCamera,invalidate,size}=useThree();
  const camera=sceneCamera as PerspectiveCamera;
  const target=useRef({x:0,y:0,z:0});
  const first=useRef(true);
  const mobile=size.width<=760;
  useEffect(()=>{
    const detail=shot==='detail';
    const destination=detail
      ?mobile?{x:1,y:1.6,z:9.8,tx:0,ty:-1.25,tz:0,fov:48}:{x:2.8,y:1.75,z:6.2,tx:1.75,ty:.3,tz:0,fov:42}
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
    const tween=gsap.to(rig,{...destination,duration:1.8,ease:'power3.inOut',onUpdate:apply,onComplete:()=>onSettled?.(shot)});
    return()=>{tween.kill()};
  },[shot,mobile,camera,invalidate,onSettled]);
  return null;
}

function FirstFrame({onReady}:{onReady?:()=>void}){
  const signalled=useRef(false);
  useFrame(()=>{if(!signalled.current){signalled.current=true;requestAnimationFrame(()=>onReady?.())}});
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
    <ambientLight intensity={1.4}/><directionalLight position={[-4,9,-5]} intensity={3.4} color="#fff4d9"/><directionalLight position={[3,4,6]} color="#a1d5e4" intensity={1.3}/>
    {props.hero?<><color attach="background" args={['#8aaeb8']}/><Ocean/><FloatingBuoy visible={visible}/><CameraShot shot={props.shot} onSettled={props.onShotSettled}/></>:<Model {...props}/>}
    {!props.hero&&[1.7,2.3,3.1].map(r=><mesh key={r} rotation={[-Math.PI/2,0,0]} position={[0,-.22,0]}><ringGeometry args={[r,r+.008,96]}/><meshBasicMaterial color="#76afb5" transparent opacity={.2}/></mesh>)}
    <FirstFrame onReady={props.onReady}/>{!props.hero&&<OrbitControls makeDefault enablePan={false} enableDamping={false} minDistance={4} maxDistance={9} minPolarAngle={.2} maxPolarAngle={Math.PI*.8}/>}
  </Canvas></div>;
}
