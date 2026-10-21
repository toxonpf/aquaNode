import {useSyncExternalStore} from 'react';
import {DEFAULT_OCEAN_STYLE,oceanStyles} from './oceanStyles';

const storageKey='aquanode:ocean-style';
const listeners=new Set<()=>void>();
const defaultStyle=oceanStyles.find(style=>style.id===DEFAULT_OCEAN_STYLE)!;
let current=defaultStyle;
try{
  if(typeof window!=='undefined')current=oceanStyles.find(style=>style.id===Number(localStorage.getItem(storageKey)))??defaultStyle;
}catch{/* Storage can be unavailable; switching still works for this visit. */}

export const getOceanStyle=()=>current;
export const subscribeOceanStyle=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener)}};
export const useOceanStyle=()=>useSyncExternalStore(subscribeOceanStyle,getOceanStyle,()=>defaultStyle);
const info=(style:typeof current)=>({id:style.id,name:style.name,description:style.description});

export function oceanStyle():ReturnType<typeof info>[];
export function oceanStyle(id:number):ReturnType<typeof info>;
export function oceanStyle(id?:number){
  if(arguments.length===0)return oceanStyles.map(info);
  const next=typeof id==='number'&&Number.isInteger(id)?oceanStyles.find(style=>style.id===id):undefined;
  if(!next)throw new RangeError(`oceanStyle: укажите целое число от 1 до ${oceanStyles.length}. oceanStyle() покажет список вариантов.`);
  try{localStorage.setItem(storageKey,String(next.id))}catch{/* Keep the in-memory selection when storage is blocked. */}
  if(current!==next){current=next;listeners.forEach(listener=>listener())}
  return info(current);
}

declare global{interface Window{oceanStyle:typeof oceanStyle}}
if(typeof window!=='undefined'){
  window.oceanStyle=oceanStyle;
  window.addEventListener('storage',event=>{
    if(event.key!==storageKey&&event.key!==null)return;
    const next=oceanStyles.find(style=>style.id===Number(event.newValue))??defaultStyle;
    if(current!==next){current=next;listeners.forEach(listener=>listener())}
  });
}
