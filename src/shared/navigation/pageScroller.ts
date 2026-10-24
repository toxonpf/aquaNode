import gsap from 'gsap';

// One tween owns page scrolling. Reversing discards the previous momentum.
export function createPageScroller(bounds:()=>{min:number;max:number},onSettle=()=>{}){
  let motion:gsap.core.Tween|null=null;
  let destination=scrollY,applied=scrollY,direction=0;
  const point={y:scrollY};
  const stop=()=>{motion?.kill();motion=null;direction=0;destination=scrollY};
  const add=(delta:number,animate=true)=>{
    const {min,max}=bounds(),sign=Math.sign(delta);
    if(!motion||Math.abs(scrollY-applied)>2||sign!==direction)destination=scrollY;
    destination=Math.max(min,Math.min(max,destination+delta));
    direction=sign;
    motion?.kill();motion=null;
    if(!animate||Math.abs(destination-scrollY)<.5){
      applied=destination;window.scrollTo({top:applied,behavior:'instant'});onSettle();return;
    }
    point.y=scrollY;
    motion=gsap.to(point,{y:destination,duration:.42,ease:'power2.out',onUpdate:()=>{
      const limits=bounds();
      applied=Math.max(limits.min,Math.min(limits.max,point.y));
      window.scrollTo({top:applied,behavior:'instant'});
    },onComplete:()=>{motion=null;onSettle()}});
  };
  return {add,stop,get target(){return motion?destination:scrollY},get moving(){return motion!==null}};
}
