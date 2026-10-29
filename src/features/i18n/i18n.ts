import ru from './locales/ru';
import zh from './locales/zh-TW';
import {useSyncExternalStore} from 'react';

export type Locale='ru'|'en'|'zh-TW';
export const localeKey='aquanode.locale';
function readLocale():Locale{
  try{const saved=localStorage.getItem(localeKey);return saved==='en'||saved==='zh-TW'?saved:'ru'}catch{return 'ru'}
}
export let locale=readLocale();
const listeners=new Set<()=>void>();
export function subscribeLocale(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}}
export function useLocale(){return useSyncExternalStore(subscribeLocale,()=>locale)}
document.documentElement.lang=locale;

/** Translate before rendering so word reveals and accessible names use the same copy. */
export function t(english:string,values?:Record<string,string|number>):string{
  const text=locale==='ru'?(ru[english]??english):locale==='zh-TW'?(zh[english]??english):english;
  return values?text.replace(/\{(\w+)\}/g,(match,key)=>String(values[key]??match)):text;
}
export const localeFormat=(value:Locale)=>value==='ru'?'ru-RU':value==='zh-TW'?'zh-TW':'en-GB';

export function changeLocale(next:Locale){
  if(next===locale)return;
  locale=next;
  document.documentElement.lang=next;
  try{localStorage.setItem(localeKey,next)}catch{/* The current session can still switch languages. */}
  listeners.forEach(listener=>listener());
}
