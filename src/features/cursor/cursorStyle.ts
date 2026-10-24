import {useSyncExternalStore} from 'react';

export type CursorStyle=0|1;
const storageKey='aquanode:cursor-style';
const listeners=new Set<()=>void>();
// Native pointer is the public default. The water cursor remains an explicit,
// remembered opt-in through cursorStyle(1).
const saved=(value:string|null):CursorStyle=>value==='1'?1:0;
let current:CursorStyle=0;
try{current=saved(localStorage.getItem(storageKey))}catch{/* Keep the default when storage is unavailable. */}

const apply=(next:CursorStyle)=>{
  document.documentElement.dataset.cursorStyle=String(next);
  if(next===0)delete document.documentElement.dataset.customCursor;
  if(current!==next){current=next;listeners.forEach(listener=>listener())}
};
apply(current);
const subscribe=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener)}};
export const useCursorStyle=()=>useSyncExternalStore(subscribe,()=>current,()=>0 as CursorStyle);

/** Console: 0 = native pointer, 1 = water trail; no argument reads the choice. */
export function cursorStyle():CursorStyle;
export function cursorStyle(id:number):CursorStyle;
export function cursorStyle(id?:number):CursorStyle{
  if(arguments.length===0)return current;
  if(id!==0&&id!==1)throw new RangeError('cursorStyle: 0 — обычный курсор, 1 — водный след. cursorStyle() возвращает выбранный номер.');
  try{localStorage.setItem(storageKey,String(id))}catch{/* Switching still works for this visit. */}
  apply(id);return current;
}

declare global{interface Window{cursorStyle:typeof cursorStyle}}
window.cursorStyle=cursorStyle;
window.addEventListener('storage',event=>{
  if(event.key===storageKey||event.key===null)apply(saved(event.key===null?null:event.newValue));
});
