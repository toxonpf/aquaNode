import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {DoubleSide,type ShaderMaterial} from 'three';
import {OCEAN_LEVEL,oceanWaveShader} from './ocean';
import {useOceanStyle} from './oceanStyle';
import type {OceanStyle} from './oceanStyles';
import {createOceanGeometry} from './oceanGeometry';

// Only the selected variant is compiled. Historical styles add no per-pixel
// branching or additional rendering passes to the current ocean.
function surfaceParts({appearance}:OceanStyle){
  const original=appearance==='original',legacy=original||appearance==='smooth';
  if(legacy)return {
    normal:`
      float rippleA=${original?'sin(p.x*19.5+p.y*12.4-t*1.9+sin(p.y*2.2+t*.3))':'sin(p.x*5.2+p.y*3.6-t*.55+sin(p.y*1.15+t*.12))'};
      float rippleB=${original?'sin(p.y*24.2-p.x*9.7-t*1.5+sin(p.x*3.1-t*.2))':'sin(p.y*7.1-p.x*2.8-t*.42+sin(p.x*.8-t*.08))'};
      vec3 normal=normalize(vec3(-slope.x+rippleA*${original?'.055':'.014'},1.0,-slope.y+rippleB*${original?'.045':'.011'}));
      float current=sin(p.x*.43+p.y*.58+t*.08)*.5+.5;`,
    color:`vec3 color=mix(vec3(.018,.145,.19),vec3(.028,.295,.33),.45+height*.9+current*.16);`,
    diffuse:'.68+diffuse*.45',
    shine:'color+=vec3(.86,.96,.94)*(pow(sun,320.0)*.72+pow(sun,32.0)*.035);',
    crests:'',overhead:false,original,
  };
  const fine=appearance==='ripples';
  if(appearance==='depth'||fine)return {
    normal:`
      float current=oceanNoise(p*.19+vec2(t*.012,-t*.008));
      float detail=oceanNoise(p*.58+current*1.8+vec2(-t*.018,t*.01));
      float rippleA=sin(p.x*5.2+p.y*3.6-t*.55+sin(p.y*1.15+t*.12)+detail*2.2);
      float rippleB=sin(p.y*7.1-p.x*2.8-t*.42+sin(p.x*.8-t*.08)+current*2.8);
      ${fine?`
      float rippleFade=1.0-smoothstep(.08,.3,length(fwidth(p)));
      float wind=dot(p,vec2(.76,.65));
      float capillary=(sin(wind*12.0+detail*5.0-t*1.2)+sin(wind*18.5+current*6.0-t*1.55)*.35)*rippleFade;
      vec3 normal=normalize(vec3(-slope.x+rippleA*.045+capillary*.055,1.0,-slope.y+rippleB*.035+capillary*.047));
      `:`vec3 normal=normalize(vec3(-slope.x+rippleA*.035,1.0,-slope.y+rippleB*.028));`}`,
    color:'vec3 color=mix(vec3(.012,.12,.165),vec3(.035,.34,.355),clamp(.18+current*.7+detail*.12+height*.7,0.0,1.0));',
    diffuse:fine?'.48+diffuse*.66':'.68+diffuse*.45',
    shine:fine?'color+=vec3(.86,.96,.94)*(pow(sun,320.0)*.32+pow(sun,32.0)*.04);':'color+=vec3(.86,.96,.94)*(pow(sun,192.0)*.4+pow(sun,24.0)*.045);',
    crests:'color+=vec3(.045,.09,.085)*smoothstep(.06,.32,height)*(.55+detail*.45);',
    overhead:true,original:false,
  };
  const soft=appearance==='swell-soft',broad=appearance==='swell-foam',textured=appearance==='swell-textured';
  return {
    normal:`
      float current=oceanNoise(p*.095+vec2(t*.006,-t*.004));
      float detail=oceanNoise(p*.32+current*1.8+vec2(-t*.01,t*.006));
      float wind=dot(p,vec2(.94,.342));
      float across=dot(p,vec2(-.342,.94));
      float rippleFade=1.0-smoothstep(.12,.4,length(fwidth(p)));
      ${soft?`
      float ripple=sin(wind*3.2+detail*3.0-t*.8)*rippleFade;
      vec3 normal=normalize(vec3(-slope.x+ripple*.014,1.0,-slope.y+ripple*.005));
      `:broad?`
      float ripple=(sin(wind*3.2+detail*3.0-t*.8)+sin(wind*4.7+current*4.0-t*1.05)*.3)*rippleFade;
      vec3 normal=normalize(vec3(-slope.x+ripple*.032,1.0,-slope.y+ripple*.012));
      `:`
      float ripple=(sin(wind*2.4+sin(across*.6)*1.3-t*.8)*.06+sin(wind*3.8+sin(across*.9)*.7-t*1.05)*.018)*rippleFade;
      vec3 normal=normalize(vec3(-slope.x+ripple*.94,1.0,-slope.y+ripple*.342));
      `}`,
    color:`
      vec3 deep=${textured?'vec3(.008,.065,.12)':'vec3(.008,.075,.12)'};
      vec3 turquoise=${textured?'vec3(.022,.20,.255)':'vec3(.022,.24,.28)'};
      vec3 color=mix(deep,turquoise,clamp(${soft?'.42+current*.22+detail*.06+height*.38':'.48+current*.08+height*.55'},0.0,1.0));`,
    diffuse:'.35+diffuse*.8',
    shine:soft?'color+=vec3(.68,.85,.88)*(pow(sun,96.0)*.13+pow(sun,18.0)*.035);'
      :broad?'color+=vec3(.68,.85,.88)*(pow(sun,180.0)*.2+pow(sun,24.0)*.025);'
      :textured?'color+=vec3(.68,.85,.88)*(pow(sun,180.0)*.12+pow(sun,32.0)*.012);'
      :'color+=vec3(.68,.85,.88)*(pow(sun,180.0)*.16+pow(sun,32.0)*.02);',
    crests:`
      color+=vec3(.025,.065,.075)*smoothstep(.1,.5,height);
      ${soft?`
      float whitecaps=smoothstep(.38,.64,height)*smoothstep(.42,.72,detail);
      color=mix(color,vec3(.48,.67,.68),whitecaps*.22);
      `:broad?`
      float foamBreakup=oceanNoise(vec2(wind*1.4,across*.45)+vec2(-t*.12,t*.025));
      float whitecaps=smoothstep(.36,.55,height)*smoothstep(.4,.64,foamBreakup+detail*.1);
      color=mix(color,vec3(.64,.78,.76),whitecaps*.55);
      `:`
      float foamBreakup=oceanNoise(vec2(wind*2.5,across*.7)+vec2(-t*.12,t*.025));
      ${textured?'float foamGrain=oceanNoise(p*5.5+vec2(-t*.16,t*.04));':''}
      float crestEdge=smoothstep(.43,.46,height)*(1.0-smoothstep(.49,.53,height${textured?'+foamGrain*.025':''}));
      float whitecaps=crestEdge*smoothstep(.04,.16,dot(slope,vec2(.94,.342)))*smoothstep(.46,.66,foamBreakup);
      color=mix(color,vec3(.58,.73,.72),whitecaps*${textured?'smoothstep(.28,.7,foamGrain)*.38':'.32'});
      `}`,
    overhead:true,original:false,
  };
}

function makeShaders(style:OceanStyle){
  const waves=oceanWaveShader(style),parts=surfaceParts(style);
  return {
    vertexShader:`
      uniform float uTime;
      varying vec3 vWorld;
      ${waves}
      void main(){
        vec2 p=vec2(position.x,-position.y);
        float height;vec2 slope;sampleWaves(p,uTime,height,slope);
        vWorld=(modelMatrix*vec4(p.x,height+${OCEAN_LEVEL.toFixed(3)},p.y,1.0)).xyz;
        gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.0);
      }`,
    fragmentShader:`
      uniform float uTime;
      varying vec3 vWorld;
      ${waves}
      float oceanNoise(vec2 p){
        vec2 cell=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        vec4 corners=vec4(dot(cell,vec2(127.1,311.7)),dot(cell+vec2(1,0),vec2(127.1,311.7)),dot(cell+vec2(0,1),vec2(127.1,311.7)),dot(cell+vec2(1,1),vec2(127.1,311.7)));
        corners=fract(sin(corners)*43758.5453);
        return mix(mix(corners.x,corners.y,f.x),mix(corners.z,corners.w,f.x),f.y);
      }
      void main(){
        vec2 p=vWorld.xz;float t=uTime;
        float height;vec2 slope;sampleWaves(p,t,height,slope);
        ${parts.normal}
        vec3 viewDirection=normalize(cameraPosition-vWorld);
        vec3 lightDirection=normalize(vec3(-.48,1.0,-.58));
        float fresnel=.025+.975*pow(1.0-max(dot(normal,viewDirection),0.0),5.0);
        ${parts.color}
        float diffuse=max(dot(normal,lightDirection),0.0);
        color*=${parts.diffuse};
        vec3 reflected=reflect(-viewDirection,normal);
        vec3 sky=mix(vec3(.28,.52,.60),vec3(.69,.83,.85),smoothstep(0.0,1.0,reflected.y));
        color=mix(color,sky,fresnel*.75);
        float sun=max(dot(reflect(-lightDirection,normal),viewDirection),0.0);
        ${parts.shine}
        ${parts.crests}
        float distanceToBuoy=length(p);
        color*=1.0-.22*exp(-distanceToBuoy*distanceToBuoy*1.1);
        ${parts.original?`float waterline=exp(-pow((distanceToBuoy-1.27)/.10,2.0));`:`
        vec2 edge=abs(p)-vec2(1.10,.75);
        float floatEdge=length(max(edge,0.0))+min(max(edge.x,edge.y),0.0)-.18;
        float waterline=exp(-pow(floatEdge/.07,2.0));`}
        float foam=waterline*(.3+.3*sin(atan(p.y,p.x)*17.0+t*1.5));
        color=mix(color,vec3(.65,.84,.81),max(foam,0.0)*.25);
        float haze=smoothstep(14.0,43.0,length(cameraPosition-vWorld));
        ${parts.overhead?'haze*=mix(1.0,.18,smoothstep(.45,.9,viewDirection.y));':''}
        color=mix(color,vec3(.254,.423,.48),haze);
        if(cameraPosition.y<-.2){
          float underside=.5+.5*sin(p.x*1.3+p.y*.9+t*.3);
          color=mix(vec3(.025,.18,.21),vec3(.15,.39,.40),underside*.45);
          color=mix(color,vec3(.024,.18,.22),smoothstep(5.0,24.0,length(cameraPosition-vWorld)));
        }
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  };
}

export default function OceanSurface(){
  const style=useOceanStyle();
  const material=useRef<ShaderMaterial>(null);
  const {gl,invalidate}=useThree();
  const uniforms=useMemo(()=>({uTime:{value:0}}),[]);
  const geometry=useMemo(createOceanGeometry,[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const shaders=useMemo(()=>makeShaders(style),[style]);
  useEffect(()=>{gl.domElement.dataset.oceanStyle=String(style.id);invalidate()},[style,gl,invalidate]);
  useFrame(({clock})=>{if(material.current)material.current.uniforms.uTime.value=clock.elapsedTime});
  return <mesh geometry={geometry} frustumCulled={false} name="ocean-surface">
    <shaderMaterial key={style.id} ref={material} uniforms={uniforms} side={DoubleSide} {...shaders}/>
  </mesh>;
}
