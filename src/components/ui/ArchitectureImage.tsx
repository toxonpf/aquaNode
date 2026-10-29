import type {ImgHTMLAttributes} from 'react';
import {useLocale} from '../../features/i18n/i18n';
import {architectureForLocale} from '../../data/project';

export default function ArchitectureImage(props:Omit<ImgHTMLAttributes<HTMLImageElement>,'src'>){
 const locale=useLocale(),url=architectureForLocale(locale);
 return <picture className="architecture-picture"><source media="(max-width:760px)" srcSet={url.replace('.svg','-mobile.svg')}/><img {...props} src={url} width="1440" height="900"/></picture>;
}
