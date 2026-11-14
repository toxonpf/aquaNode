import {t} from '../../i18n/i18n';
import {useId} from 'react';

export default function NetworkDrawing(){
  const id=useId();
  return <svg className="network-drawing" viewBox="0 0 720 620" role="img" aria-label={t('Second-version design illustration')}>
    <defs><g id={id}>
      <ellipse cy="30" rx="77" ry="27" fill="none" stroke="#bddfd1" strokeOpacity=".3"/>
      <path d="m-58 8 84-16 36 20v27l-87 15-33-19z" fill="#cbdad0"/>
      <path d="m-58 8 84-16 36 20-87 16z" fill="#f0f3e6"/>
      <path d="M-4-40h12v58H-4z" fill="#df8150"/>
      <path d="m-25-83 45-8 7 55-45 8z" fill="#f0f3e6" stroke="#244b54" strokeWidth="2"/>
      <path d="m11-88-3-36" stroke="#193e49" strokeWidth="4" strokeLinecap="round"/>
    </g></defs>
    <use href={'#'+id} transform="translate(300 365) scale(1.4)"/>
  </svg>;
}
