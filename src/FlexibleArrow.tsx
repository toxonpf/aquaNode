import './flexible-arrow.css';

const straightLine='M4 22C8.56 22 13.11 22 17.67 22C22.22 22 26.78 22 31.33 22C35.89 22 40.44 22 45 22C49.56 22 54.11 22 58.67 22C63.22 22 67.78 22 72.33 22C76.89 22 81.44 22 86 22L94 22';

export default function FlexibleArrow({direction='right',active=false,showHead=true,trail=false}:{direction?:'right'|'up-right'|'down';active?:boolean;showHead?:boolean;trail?:boolean}){
  const down=direction==='down';
  return <svg className={'flexible-arrow flexible-arrow--'+direction} data-wave={active?'active':undefined} viewBox={down?'0 0 40 100':'0 0 100 40'} fill="none" aria-hidden="true" focusable="false">
    <g transform={down?'translate(40 0) rotate(90)':undefined}>
      <path className="flexible-arrow-line" pathLength="100" d={straightLine}/>
      {trail&&<path className="flexible-arrow-line flexible-arrow-trail" pathLength="100" d={straightLine}/>}
      {showHead&&<path className="flexible-arrow-head" d="M85 16L94 22L85 28"/>}
    </g>
  </svg>;
}
