import {useEffect,useId,useRef,useState} from 'react';
import {changeLocale,useLocale,t,type Locale} from './i18n';
import FlexibleArrow from '../../components/ui/FlexibleArrow';
const languages:{id:Locale;name:string;caption:string;short:string}[]=[
 {id:'ru',name:'Русский',caption:'Russian',short:'RU'},
 {id:'en',name:'English',caption:'English',short:'EN'},
 {id:'zh-TW',name:'繁體中文',caption:'台灣 · Taiwan',short:'繁'},
];
export default function LanguageSwitch(){
 const locale=useLocale(),[open,setOpen]=useState(false),[side,setSide]=useState<'top'|'bottom'>('bottom'),[shift,setShift]=useState(0);
 const host=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),options=useRef<(HTMLButtonElement|null)[]>([]),id=useId();
 const selected=languages.find(item=>item.id===locale)!;
 const close=(focus=false)=>{setOpen(false);if(focus)trigger.current?.focus()};
 const show=()=>{const bounds=host.current!.getBoundingClientRect();const width=Math.min(238,innerWidth-32),left=bounds.right-width;setShift(Math.min(Math.max(16,left),innerWidth-16-width)-left);setSide(innerHeight-bounds.bottom<250&&bounds.top>250?'top':'bottom');setOpen(true)};
 useEffect(()=>{
  if(!open)return;
  options.current[languages.findIndex(item=>item.id===locale)]?.focus();
  const outside=(event:PointerEvent)=>{if(!host.current?.contains(event.target as Node))close()};
  const resize=()=>close();
  document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);window.addEventListener('scroll',resize,{passive:true});
  return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);window.removeEventListener('scroll',resize)};
 },[open]);
 return <div ref={host} className="language-switch" data-locale={locale} data-open={open} data-side={side} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))close()}} onKeyDown={event=>{
  if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();close(true)}
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();if(!open){show();return}
   const current=options.current.findIndex(item=>item===document.activeElement),next=event.key==='Home'?0:event.key==='End'?languages.length-1:(current+(event.key==='ArrowDown'?1:-1)+languages.length)%languages.length;
   options.current[next]?.focus();
  }
 }}>
  <button ref={trigger} className="language-trigger" type="button" aria-label={t('Site language')} aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={()=>open?close():show()}>
   <svg className="language-globe" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18ZM5 7.5c4 2 10 2 14 0M5 16.5c4-2 10-2 14 0"/></svg><span>{selected.short}</span><svg className="language-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>
  </button>
  <div className="language-dropdown" style={{right:-shift}} id={id} role="menu" aria-label={t('Site language')} hidden={!open}>
   <span className="language-dropdown-title">{t('Choose language')}</span>
   {languages.map((item,index)=><button ref={node=>{options.current[index]=node}} key={item.id} type="button" role="menuitemradio" aria-label={item.name} aria-checked={locale===item.id} lang={item.id} onClick={()=>{changeLocale(item.id);close(true)}}>
    <span><b>{item.name}</b><small>{item.caption}</small></span><FlexibleArrow direction="up-right"/>
   </button>)}
  </div>
 </div>;
}
