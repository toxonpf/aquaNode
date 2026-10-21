import {forwardRef,useEffect,useImperativeHandle,useLayoutEffect,useRef,type MouseEventHandler} from 'react';
import {DRAWING_ARROW_ANCHOR,type BuoyAnchorHandler} from './buoyAnchors';

export type BuoyAnnotationHandle={updateAnchor:BuoyAnchorHandler};
type Props={visible:boolean;active:boolean;staticScene:boolean;onClick:MouseEventHandler<HTMLAnchorElement>};

export default forwardRef<BuoyAnnotationHandle,Props>(function BuoyAnnotation({visible,active,staticScene,onClick},ref){
  const link=useRef<HTMLAnchorElement>(null),svg=useRef<SVGSVGElement>(null);
  const curve=useRef<SVGPathElement>(null),head=useRef<SVGPathElement>(null);
  const spring=useRef<{rest:number;slack:number;velocity:number}|null>(null);
  const draw=useRef<BuoyAnchorHandler>(()=>{});
  draw.current=(screenX,screenY,delta,outwardX,outwardY)=>{
    const matrix=svg.current?.getScreenCTM();
    if(!matrix||!curve.current||!head.current)return;
    const det=matrix.a*matrix.d-matrix.b*matrix.c;
    if(Math.abs(det)<1e-6)return;
    // Convert the projected buoy point into this SVG's coordinates. This also
    // cancels the label's entrance transform, so the tip never slides off the lid.
    const px=screenX-matrix.e,py=screenY-matrix.f;
    const x=(matrix.d*px-matrix.c*py)/det,y=(-matrix.b*px+matrix.a*py)/det;
    const sx=177,sy=12,dx=x-sx,dy=y-sy,distance=Math.max(1,Math.hypot(dx,dy));
    if(!Number.isFinite(distance))return;
    let ox=(matrix.d*outwardX-matrix.c*outwardY)/det,oy=(-matrix.b*outwardX+matrix.a*outwardY)/det;
    const outwardLength=Math.hypot(ox,oy);
    if(outwardLength>.0001){ox/=outwardLength;oy/=outwardLength}else{ox=-dx/distance;oy=-dy/distance}
    if(!spring.current)spring.current={rest:distance,slack:distance*.23,velocity:0};
    const state=spring.current;
    const target=Math.max(6,Math.min(state.rest*.45,state.rest*.23-(distance-state.rest)*1.8));
    const dt=Math.min(Math.max(delta,0),.05);
    // Only the bend has inertia. The actual attachment point follows the buoy exactly.
    state.velocity+=(target-state.slack)*80*dt;
    state.velocity*=Math.exp(-12*dt);
    state.slack+=state.velocity*dt;
    // Reserve a straight approach outside the float. Neither the spring bend
    // nor its control points can enter the arrowhead's two wings.
    const lead=26,ex=x+ox*lead,ey=y+oy*lead,cx=ex-sx,cy=ey-sy;
    const curveLength=Math.max(1,Math.hypot(cx,cy)),nx=cy/curveLength,ny=-cx/curveLength;
    const slack=Math.max(0,Math.min(state.slack,curveLength*.32));
    let mx=sx+cx*.52+nx*slack*.25,my=sy+cy*.52+ny*slack*.25;
    const vx=cx*.18-nx*slack*.65,vy=cy*.18-ny*slack*.65;
    const clearance=Math.max(0,lead+Math.abs(vx*ox+vy*oy)-((mx-x)*ox+(my-y)*oy));
    mx+=ox*clearance;my+=oy*clearance;
    let c1x=sx+cx*.12+nx*slack*.95,c1y=sy+cy*.12+ny*slack*.95;
    const firstClearance=Math.max(0,lead-((c1x-x)*ox+(c1y-y)*oy));
    c1x+=ox*firstClearance;c1y+=oy*firstClearance;
    const c2x=mx-vx,c2y=my-vy,c3x=mx+vx,c3y=my+vy;
    const handle=Math.max(18,Math.min(36,curveLength*.22)),c4x=ex+ox*handle,c4y=ey+oy*handle;
    const n=(value:number)=>value.toFixed(2);
    curve.current.setAttribute('d',`M${sx} ${sy}C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(mx)} ${n(my)}C${n(c3x)} ${n(c3y)} ${n(c4x)} ${n(c4y)} ${n(ex)} ${n(ey)}L${n(x)} ${n(y)}`);
    const tx=-ox,ty=-oy;
    const bx=x-tx*16,by=y-ty*16;
    head.current.setAttribute('d',`M${n(bx-ty*6.5)} ${n(by+tx*6.5)}L${n(x)} ${n(y)}L${n(bx+ty*6.5)} ${n(by-tx*6.5)}`);
  };
  useImperativeHandle(ref,()=>({updateAnchor:(x,y,delta,outwardX,outwardY)=>{
    const element=link.current?.closest<HTMLElement>('.ocean-stage');
    if(!element||element.dataset.cameraState==='moving'){spring.current=null;return}
    const stage=element.getBoundingClientRect();
    draw.current(x+stage.left,y+stage.top,delta,outwardX,outwardY);
  }}),[]);
  useEffect(()=>{
    const reset=()=>{spring.current=null};
    window.addEventListener('resize',reset);
    return()=>window.removeEventListener('resize',reset);
  },[]);
  useLayoutEffect(()=>{
    spring.current=null;
    if(!staticScene||!active)return;
    const drawing=link.current?.closest('.ocean-stage')?.querySelector<SVGSVGElement>('.buoy-drawing');
    if(!drawing)return;
    let frame=0,until=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update=()=>{
      const matrix=drawing.getScreenCTM();
      if(!matrix)return;
      const {x,y}=DRAWING_ARROW_ANCHOR;
      draw.current(matrix.a*x+matrix.c*y+matrix.e,matrix.b*x+matrix.d*y+matrix.f,1/60,matrix.a,matrix.b);
    };
    const tick=(now:number)=>{update();frame=now<until?requestAnimationFrame(tick):0};
    const refresh=()=>{
      spring.current=null;update();
      if(!reduced){until=performance.now()+1100;if(!frame)frame=requestAnimationFrame(tick)}
    };
    const observer=new ResizeObserver(refresh);
    observer.observe(drawing);if(svg.current)observer.observe(svg.current);
    window.addEventListener('resize',refresh);refresh();
    return()=>{observer.disconnect();window.removeEventListener('resize',refresh);cancelAnimationFrame(frame)};
  },[staticScene,active,visible]);

  return <a ref={link} href="#buoy-intro" onClick={onClick} className={'buoy-annotation'+(visible?' is-visible':'')} aria-label="What is this? Discover AquaNode" tabIndex={visible?0:-1}>
    <span>what is this?</span>
    <svg ref={svg} viewBox="0 0 200 120" fill="none" aria-hidden="true">
      <path ref={curve} className="annotation-curve" pathLength={1} d="M177 12C164 53 104 15 83 43 65 66 68 89 25 100"/>
      <path ref={head} className="annotation-head" d="m37 86-14 15 21 2"/>
    </svg>
  </a>;
});
