import fs from 'node:fs';
const copy={
 en:{title:'Three inputs. One bench record.',sub:'A freshwater design with an isolated pH path.',inputs:'01 / SENSOR INPUTS',ph:'ISOLATED pH',isolation:'DFR0504 · Power + signal isolation',power:'Separate regulated 5 V bench supply',adc:'pH / ANALOG ACQUISITION',cal:'Calibrate the entire pH chain',gate:'pH: null until validation',ec:'EXPERIMENTAL EC',ecNote:'TDS module under evaluation',ecShort:'Experimental EC estimate',temp:'TEMPERATURE',tempNote:'Temperature input',controller:'02 / COORDINATE',source:'Three inputs · USB source',build:'ESP32 build not complete',record:'03 / RECORD',records:'Planned USB capture',raw:'Raw values + calibration context',next:'NEXT / HARDWARE VALIDATION',pending:'Power, real calibration and shared-water tests are pending. Battery-powered pH is not complete.',scope:'Design illustration · Not an electrical schematic · No measured hardware accuracy',mobilePending:['Hardware validation pending.','Separate pH bench power required.','No measured accuracy or field readings.']},
 ru:{title:'EC. pH. Температура.',sub:'Пресноводный стенд с изолированной цепью pH.',inputs:'01 / ВХОДЫ ДАТЧИКОВ',ph:'ИЗОЛИРОВАННЫЙ pH',isolation:'DFR0504 · Развязка питания и сигнала',power:'Отдельный стендовый источник 5 В',adc:'pH / АНАЛОГОВЫЙ ВХОД',cal:'Калибровка всей цепи pH',gate:'pH: null до реального допуска',ec:'ЭКСПЕРИМЕНТАЛЬНАЯ EC',ecNote:'Исследуемый TDS-модуль',ecShort:'Оценка EC · эксперимент',temp:'ТЕМПЕРАТУРА',tempNote:'Температурный вход',controller:'02 / КООРДИНАЦИЯ',source:'Три входа · USB-исходники',build:'Сборка ESP32 не завершена',record:'03 / ЗАПИСЬ',records:'Проект USB-сбора',raw:'Исходные значения и контекст',next:'ДАЛЕЕ / АППАРАТНЫЕ ИСПЫТАНИЯ',pending:'Впереди питание, реальная калибровка и совместные тесты. Автономный pH не завершён.',scope:'Проектная иллюстрация · Не электрическая схема · Аппаратная точность не измерена',mobilePending:['Аппаратные испытания предстоят.','Для pH нужен отдельный источник.','Точность пока не подтверждена.']},
 'zh-TW':{title:'三種輸入，一份平台紀錄。',sub:'具隔離式 pH 路徑的淡水平台設計。',inputs:'01 / 感測器輸入',ph:'隔離式 pH',isolation:'DFR0504 · 電源與訊號隔離',power:'獨立 5 V 穩壓平台電源',adc:'pH / 類比擷取',cal:'校正完整 pH 鏈路',gate:'數值 pH：驗證前維持 null',ec:'實驗性 EC',ecNote:'研究中的 TDS 模組',ecShort:'實驗性 EC 估算',temp:'溫度',tempNote:'溫度輸入',controller:'02 / 協調',source:'三個輸入 · USB 平台原始碼',build:'ESP32 建置尚未完成',record:'03 / 記錄',records:'規劃中的 USB 擷取',raw:'原始值與校正條件',next:'下一步 / 硬體驗證',pending:'電源、真實校正與同一水樣測試仍待完成。電池供電 pH 尚未完成。',scope:'設計示意 · 非電路圖 · 尚無硬體實測準確度',mobilePending:['硬體驗證尚待完成。','pH 需要獨立平台電源。','未提供實測準確度或實地讀值。']},
};
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,value,size=24,color='#edf3e7',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escape(value)}</text>`;
function svg(locale,mobile){
 const c=copy[locale],w=mobile?760:1440,h=mobile?1600:1000;
 const defs='<defs><linearGradient id="sea" x2="1" y2="1"><stop stop-color="#0b303e"/><stop offset="1" stop-color="#174950"/></linearGradient><linearGradient id="card" x2="1" y2="1"><stop stop-color="#244e54" stop-opacity=".72"/><stop offset="1" stop-color="#0c3440" stop-opacity=".6"/></linearGradient><marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto"><path d="M2 2l8 4-8 4" fill="none" stroke="#c8dca9" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>';
 const card=(x,y,width,height,label,title,lines,accent=false)=>`<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="url(#card)" stroke="${accent?'#c8dca9':'#6d9691'}" stroke-opacity=".7"/>${text(x+24,y+31,label,mobile?26:17,'#c8dca9')}${text(x+24,y+77,title,mobile?38:31,'#f0f5e9','font-weight="500"')}${lines.map((line,i)=>text(x+24,y+116+i*38,line,mobile?32:22,'#b8cfca')).join('')}</g>`;
 const line=d=>`<path d="${d}" fill="none" stroke="#c8dca9" stroke-width="1.8" marker-end="url(#arrow)"/>`;
 let body=`<rect width="${w}" height="${h}" fill="url(#sea)"/><g fill="none" stroke="#bcd5bd" opacity=".05">${Array.from({length:mobile?8:14},(_,i)=>`<path d="M${40+i*100} 0V${h}"/>`).join('')}</g><g font-family="Arial,'Noto Sans TC','Microsoft JhengHei',sans-serif">`;
 if(mobile){
  body+=text(40,52,'AQUANODE / EC+pH-revC',20,'#bdd0b3');body+=text(40,119,c.title,34);body+=text(40,162,locale==='ru'?'Пресная вода · изолированный pH':locale==='en'?'Freshwater · isolated pH':c.sub,30,'#a9c6c3');body+=text(40,215,c.inputs,21,'#c8dca9');
  body+=card(40,240,680,210,c.ph,'SEN0169-V2',[c.isolation,c.power],true);
  body+=line('M380 450v43');body+=card(40,500,680,160,c.adc,'ADS1115',[c.gate]);
  body+=card(40,730,326,155,locale==='ru'?'EC / ЭКСПЕРИМЕНТ':locale==='en'?'EC / EXPERIMENT':c.ec,'SEN0244',[locale==='ru'?'Оценка EC':locale==='en'?'EC estimate':c.ecShort]);body+=card(394,730,326,155,c.temp,'DS18B20',[locale==='ru'?'Вход °C':c.tempNote]);
  body+=`<g fill="none" stroke="#c8dca9" stroke-width="1.8"><path d="M380 660v265M203 885v17q0 23 23 23h308q23 0 23-23v-17"/><circle cx="380" cy="925" r="4" fill="#c8dca9"/></g>`+line('M380 925v43');
  body+=card(40,975,680,220,c.controller,'XIAO ESP32S3',[c.source,c.build]);body+=line('M380 1195v63');body+=card(40,1265,680,160,c.record,'USB / JSONL',[c.records]);
  body+='<path d="M40 1460h680" stroke="#a8c0aa" stroke-opacity=".3"/>';
  c.mobilePending.forEach((v,i)=>body+=text(40,1498+i*32,v,24,i?'#adc9c4':'#dce8c9'));
  body+=text(40,1580,'AquaNode · CC BY 4.0 · 02.11.2026',18,'#91b1aa');
 }else{
  body+=text(64,63,'AQUANODE / ENGINEERING SERIES',17,'#b8cca9','letter-spacing="1.5"');body+=text(1140,63,'R0.3-EC-pH-revC',18,'#b8cca9');body+=text(64,145,c.title,48);body+=text(64,195,c.sub,25,'#a9c6c3');
  body+=card(64,250,480,200,c.ph,'SEN0169-V2',[c.isolation,c.power],true);body+=card(640,250,350,200,c.adc,'ADS1115',[c.cal,c.gate]);body+=line('M544 350h89');body+=line('M815 450v73');
  body+=card(64,510,480,135,c.ec,'SEN0244',[c.ecNote]);body+=card(64,695,480,135,c.temp,'DS18B20',[c.tempNote]);
  body+=card(640,530,350,300,c.controller,'XIAO ESP32S3',[c.source,c.build],true);body+=card(1070,570,306,220,c.record,'USB / JSONL',[c.records,locale==='ru'?'Сырые записи':locale==='en'?'Raw values + context':c.raw]);
  body+=line('M544 577c48 0 45 63 89 63')+line('M544 762c50 0 46-15 89-15')+line('M990 680c33-15 43 15 73 0');
  body+='<path d="M64 865H1376" stroke="#a7c0b0" stroke-opacity=".3"/>';body+=text(64,903,c.next,19,'#c8dca9');body+=text(64,940,c.pending,22,'#bed0c7');body+=text(64,978,c.scope,17,'#91b1aa');
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">AquaNode R0.3-EC-pH-revC</title><desc id="desc">${escape(c.scope+'. '+c.pending)}</desc>${defs}${body}</g></svg>`;
}
for(const locale of Object.keys(copy))for(const mobile of [false,true])fs.writeFileSync(`public/assets/engineering/ec-ph-revc-architecture-${locale}${mobile?'-mobile':''}.svg`,svg(locale,mobile));
console.log('Generated six localized revC architecture illustrations. Historical revB assets retained.');
