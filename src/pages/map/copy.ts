import {useLocale,t} from '../../features/i18n/i18n';
export function useMapCopy(){
  const locale=useLocale(),ru=locale==='ru';
  const text=(en:string,russian:string,chinese?:string)=>ru?russian:locale==='zh-TW'?(chinese??t(en)):en;
  return {locale,ru,text,region:{hawaii:text('Hawaiʻi','Гавайи'),aktau:text('Aktau','Актау'),taiwan:text('Taiwan','Тайвань')},
    water:{hawaii:text('Pacific Ocean · Honolulu','Тихий океан · Гонолулу'),aktau:text('Caspian Sea · Kazakhstan','Каспийское море · Казахстан'),taiwan:text('Northern coast · near Taipei','Северное побережье · у Тайбэя')}};
}
