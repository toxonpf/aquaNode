export const STORY_HOME_EVENT='aquanode:story-home';

export function scrollToPageStart(){
  // The pinned story handles its own return so scrolling past chapter anchors
  // does not briefly select every camera shot on the way to the top.
  const event=new Event(STORY_HOME_EVENT,{cancelable:true});
  if(window.dispatchEvent(event))window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
