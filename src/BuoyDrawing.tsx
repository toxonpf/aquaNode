import {useId} from 'react';
import {modelLogoUrl} from './brand';

export default function BuoyDrawing(){
  const id=useId();
  return <svg className="buoy-drawing" viewBox="0 0 600 620" role="img" aria-label="Conceptual AquaNode buoy with a rectangular float, upright enclosure and water probes">
    <defs>
      <linearGradient id={id+'shell'} x2="1" y2="1"><stop stopColor="#f5f6ec"/><stop offset="1" stopColor="#b4c7c0"/></linearGradient>
      <linearGradient id={id+'side'} x2="1" y2="1"><stop stopColor="#b7ccc3"/><stop offset="1" stopColor="#789c9e"/></linearGradient>
      <radialGradient id={id+'water'}><stop stopColor="#79b7bf" stopOpacity=".4"/><stop offset="1" stopColor="#8dc7cb" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="300" cy="380" rx="290" ry="170" fill={'url(#'+id+'water)'}/>
    <g fill="none" stroke="#8cbfbe" opacity=".3">{[0,1,2].map(i=><ellipse key={i} cx="300" cy="380" rx={170+i*42} ry={60+i*22}/>)}</g>
    <path d="M291 414h22v142h-22z" fill="#da8c57"/>
    <g fill="#244f5a"><rect x="285" y="424" width="34" height="18" rx="4"/><rect x="285" y="535" width="34" height="12" rx="3"/><rect x="287" y="544" width="5" height="42" rx="2"/><rect x="312" y="544" width="5" height="42" rx="2"/><rect x="285" y="582" width="34" height="8" rx="3"/></g>
    <path d="M298 549v29m9-29v26" stroke="#b5c5be" strokeWidth="5" strokeLinecap="round"/>
    <path d="m169 329 211-33 58 35v77q0 17-17 20l-225 33q-21 2-23-17z" fill={'url(#'+id+'side)'}/>
    <path d="m173 335 207-31 6 117-187 29q-21 2-22-15z" fill={'url(#'+id+'shell)'}/>
    <g stroke="#a1b7ac" strokeWidth="5" strokeLinecap="round">{[208,236,264,292,320,348].map(x=><path key={x} d={`M${x} ${382-(x-208)*.15}v45`}/>)}</g>
    <path d="m167 326 211-33 62 35-219 35q-14 2-25-5z" fill="#204854"/>
    <path d="m170 313 203-32q11-1 20 4l43 25q16 10 0 16l-216 34q-12 2-22-4l-28-17q-16-11 0-26" fill="#f1f3e8"/>
    <path d="m178 336 22 13q10 6 21 4l210-33" fill="none" stroke="#d9e3d8" strokeWidth="3"/>
    <g fill="#df8150"><path d="m187 307 24-4 11 8-25 4z"/><path d="m390 328 24-4 11 8-25 4z"/></g>
    <ellipse cx="301" cy="308" rx="23" ry="10" fill="#cfddd2"/>
    <path d="M291 217h21v85q-10 8-21 0z" fill="#df955e"/>
    <ellipse cx="301" cy="298" rx="16" ry="6" fill="#224c57"/>
    <path d="m253 115 92-14 24 16v113l-94 16-22-16z" fill={'url(#'+id+'side)'}/>
    <rect x="245" y="110" width="105" height="126" rx="10" fill="#244b55"/>
    <rect x="248" y="112" width="99" height="121" rx="9" fill={'url(#'+id+'shell)'}/>
    <g fill="#849b94">{[259,336].flatMap(x=>[123,221].map(y=><circle key={`${x}-${y}`} cx={x} cy={y} r="3"/>))}</g>
    <image href={modelLogoUrl} x="261" y="147" width="72" height="14"/>
    <path d="M264 173h66" stroke="#a3b7ac"/>
    <text x="264" y="189" fontFamily="Arial,sans-serif" fontSize="8" fill="#607c72">pH / °C</text>
    <rect x="285" y="205" width="23" height="5" rx="2" fill="#244b55"/><circle cx="290" cy="207" r="1.7" fill="#d8ed9c"/>
    <path d="M326 109V34" stroke="#1b3d47" strokeWidth="5" strokeLinecap="round"/>
    <path d="M326 113V99" stroke="#8c9f93" strokeWidth="9"/>
  </svg>;
}
