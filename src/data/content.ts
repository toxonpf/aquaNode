import * as english from './catalog';
import {subscribeLocale,t} from '../features/i18n/i18n';
export type {TeamMember,TeamContact} from './catalog';

// Translate shared editorial records before React builds headings and text reveals.
function localized<T>(value:T):T{
  if(typeof value==='string')return t(value) as T;
  if(Array.isArray(value))return value.map(localized) as T;
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,localized(item)])) as T;
  return value;
}
export let nav=localized(english.nav);
export let team=localized(english.team);
export let resources=localized(english.resources);
export let updates=localized(english.updates);
export let parts=localized(english.parts);
export let steps=localized(english.steps);
// Rebuild from the English source, keeping mounted pages and their state.
subscribeLocale(()=>{
  nav=localized(english.nav);team=localized(english.team);
  resources=localized(english.resources);updates=localized(english.updates);
  parts=localized(english.parts);steps=localized(english.steps);
});
export const awardUrl=english.awardUrl;
export const awardCertificate=english.awardCertificate;
export const locales={en:{label:'English',complete:true},ru:{label:'Русский',complete:true}};
