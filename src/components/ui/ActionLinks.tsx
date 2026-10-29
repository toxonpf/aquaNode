import {t} from '../../features/i18n/i18n';
import {useEffect,useRef,type ReactNode} from 'react';
export function ExternalIcon(){
  return <svg className="external-link-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path className="external-link-frame" d="M9 5H5v14h14v-4"/>
    <path className="external-link-frame-current" pathLength="44" d="M9 5H5v14h14v-4"/>
    <g className="external-link-arrow"><g transform="translate(10 14) rotate(-45)"><path className="external-link-shaft" d="M0 0C2.36 0 4.71 0 7.07 0C9.43 0 11.79 0 14.14 0"/></g><path d="M13 4h7v7"/></g>
  </svg>;
}

export function ExternalLink({href,children,className='',inline=false}:{href:string;children:ReactNode;className?:string;inline?:boolean}){
  const domain=new URL(href).hostname.replace(/^www\./,'');
  return <a className={`${inline?'external-inline':'action-external'} ${className}`.trim()} href={href} target="_blank" rel="noopener noreferrer">
    {inline?<span>{children}</span>:<span className="external-link-copy"><span className="external-link-source" aria-hidden="true">{t("EXTERNAL /")} {domain}</span><span className="external-link-label">{children}</span></span>}
    <ExternalIcon/><span className="sr-only"> {t("(opens in a new tab)")}</span>
  </a>;
}

export function DownloadLink({href,label,format,detail,className='',filename,showActionLabel=true}:{href:string;label:string;format:string;detail:string;className?:string;filename?:string;showActionLabel?:boolean}){
  const sheet=useRef<SVGSVGElement>(null),motion=useRef<Animation|null>(null);
  const rules=useRef<Animation[]>([]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion:reduce)');
    const stop=()=>{motion.current?.cancel();rules.current.forEach(animation=>animation.cancel())};
    const change=()=>{if(media.matches)stop()};
    media.addEventListener('change',change);
    return()=>{stop();media.removeEventListener('change',change)};
  },[]);
  const play=()=>{
    if(!sheet.current||matchMedia('(prefers-reduced-motion:reduce)').matches||motion.current?.playState==='running')return;
    motion.current=sheet.current.animate([{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(-3px) rotate(-3deg)',offset:.4},{transform:'translateY(0) rotate(1deg)',offset:.75},{transform:'translateY(0) rotate(0deg)'}],{duration:680,easing:'ease-in-out'});
    rules.current=Array.from(sheet.current.querySelectorAll('.download-file-rule'),(line,index)=>{
      const y=21+index*6,length=index?12:16;
      const wave=(amplitude:number)=>`path('M16 ${y}C${16+length/6} ${y-amplitude} ${16+length/3} ${y-amplitude} ${16+length/2} ${y}C${16+length*2/3} ${y+amplitude} ${16+length*5/6} ${y+amplitude} ${16+length} ${y}')`;
      return line.animate([
        {d:wave(1.6),opacity:.5},
        {d:wave(-2.8),opacity:.85,offset:.35},
        {d:wave(2.5),opacity:.7,offset:.7},
        {d:wave(1.6),opacity:.5},
      ],{duration:680,delay:index*70,easing:'ease-in-out',iterations:1});
    });
  };
  return <a className={`action-download ${className}`.trim()} href={href} download={filename??true} onPointerEnter={event=>{if(event.pointerType==='mouse')play()}} onFocus={play}>
    <span className="download-file" aria-hidden="true"><svg ref={sheet} viewBox="0 0 48 56" fill="none"><path className="download-file-outline" pathLength="100" d="M8 2H30L40 12V50H8Z"/><path className="download-file-fold" d="M30 2V12H40"/><path className="download-file-rule" d="M16 21C18.67 19.4 21.33 19.4 24 21C26.67 22.6 29.33 22.6 32 21"/><path className="download-file-rule" d="M16 27C18 25.4 20 25.4 22 27C24 28.6 26 28.6 28 27"/></svg><span className="download-file-format">{format}</span></span>
    <span className="download-copy"><span className="download-label">{label}</span><span className="download-detail">{detail}</span></span>
    <span className="download-action">{showActionLabel&&<span aria-hidden="true">{t("DOWNLOAD")}</span>}<svg className="download-link-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><g className="download-link-arrow"><path className="download-link-shaft" d="M12 3C12 6 12 6 12 9C12 12 12 12 12 15"/><path d="m7 10 5 5 5-5"/></g><path className="download-link-tray" d="M4 17v4h16v-4"/><path className="download-link-ripple" d="M9 21h6"/></svg></span>
  </a>;
}
