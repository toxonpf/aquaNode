import type {ReactNode} from 'react';
import './action-links.css';

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
    {inline?<span>{children}</span>:<span className="external-link-copy"><span className="external-link-source" aria-hidden="true">EXTERNAL / {domain}</span><span className="external-link-label">{children}</span></span>}
    <ExternalIcon/><span className="sr-only"> (opens in a new tab)</span>
  </a>;
}

export function DownloadLink({href,label,format,detail,className=''}:{href:string;label:string;format:string;detail:string;className?:string}){
  return <a className={`action-download ${className}`.trim()} href={href} download>
    <span className="download-file" aria-hidden="true"><svg viewBox="0 0 32 38" fill="none"><path d="M5 1h14l8 8v27H5zM19 1v9h8"/></svg><span>{format}</span></span>
    <span className="download-copy"><span className="download-label">{label}</span><span className="download-detail">{detail}</span></span>
    <span className="download-action"><span aria-hidden="true">DOWNLOAD</span><svg className="download-link-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><g className="download-link-arrow"><path className="download-link-shaft" d="M12 3C12 6 12 6 12 9C12 12 12 12 12 15"/><path d="m7 10 5 5 5-5"/></g><path className="download-link-tray" d="M4 17v4h16v-4"/><path className="download-link-ripple" d="M9 21h6"/></svg></span>
  </a>;
}
