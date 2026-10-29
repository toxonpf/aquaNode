import fs from 'node:fs';
const copy={
 en:{title:'Water in. A record to study.',sub:'A freshwater bench design, step by step.',sensors:'01 / PLANNED INPUTS',ec:'Experimental EC estimate',tds:'TDS module under evaluation',temp:'Temperature input',controller:'02 / PROCESS',source:'Bench firmware source',calibration:'Acquisition + calibration logic',record:'03 / RECORD',records:'Planned bench capture',raw:'Raw records + test context',next:'NEXT / HARDWARE VALIDATION',pending:'ESP32 compilation, native CAD checks and independent bench measurements are pending.',scope:'Freshwater · Design illustration, not an electrical schematic',mobilePending:['Hardware validation pending.','No measured accuracy or field readings.']},
 ru:{title:'Вода. Сигнал. Запись.',sub:'Проект пресноводного стенда — по шагам.',sensors:'01 / ПРОЕКТИРУЕМЫЕ ВХОДЫ',ec:'Оценка EC · эксперимент',tds:'Исследуемый TDS-модуль',temp:'Температурный вход',controller:'02 / ОБРАБОТКА',source:'Стендовый исходный код',calibration:'Опрос датчиков и калибровка',record:'03 / ЗАПИСЬ',records:'Сбор на стенде · проект',raw:'Исходные записи и условия',next:'ДАЛЕЕ / АППАРАТНЫЕ ИСПЫТАНИЯ',pending:'Сборка ESP32, штатные проверки CAD и независимые измерения ещё предстоят.',scope:'Пресная вода · Проектная иллюстрация, не электрическая схема',mobilePending:['Аппаратные испытания предстоят.','Точность и полевые показания не подтверждены.']},
 'zh-TW':{title:'從水中輸入，到測試紀錄。',sub:'淡水測試平台的設計，逐步展開。',sensors:'01 / 規劃中的輸入',ec:'實驗性 EC 估算',tds:'研究中的 TDS 模組',temp:'溫度輸入',controller:'02 / 處理',source:'平台韌體原始碼',calibration:'資料擷取與校正邏輯',record:'03 / 記錄',records:'規劃中的平台擷取',raw:'原始紀錄與測試條件',next:'下一步 / 硬體驗證',pending:'ESP32 編譯、原生 CAD 檢查與獨立平台量測仍待完成。',scope:'淡水 · 設計示意，非電路圖',mobilePending:['硬體驗證尚待完成。','未提供實測準確度或實地讀值。']},
};
const xml=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,value,size=24,fill='#edf3e7',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${xml(value)}</text>`;
const wave=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="#c8dca9" stroke-width="1.5"><path d="M0 16c18-25 32 25 50 0s32-25 50 0M0 26c18-25 32 25 50 0s32-25 50 0"/></g>`;
function svg(lang,mobile){
 const c=copy[lang],w=mobile?760:1440,h=mobile?1160:900;
 const frame=`<defs><linearGradient id="sea" x2="1" y2="1"><stop stop-color="#0b303e"/><stop offset="1" stop-color="#174950"/></linearGradient><linearGradient id="card" x2="1" y2="1"><stop stop-color="#244e54" stop-opacity=".72"/><stop offset="1" stop-color="#0c3440" stop-opacity=".6"/></linearGradient><marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto"><path d="M2 2l8 4-8 4" fill="none" stroke="#c8dca9" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><rect width="${w}" height="${h}" fill="url(#sea)"/><g fill="none" stroke="#bcd5bd" opacity=".06">${Array.from({length:mobile?8:14},(_,i)=>`<path d="M${40+i*100} 0V${h}"/>`).join('')}<path d="M0 230H${w}M0 ${h-170}H${w}"/></g><g font-family="Arial,'Noto Sans TC','Microsoft JhengHei',sans-serif">`;
 const box=(x,y,bw,bh,label,name,lines,kind='sensor')=>{
  const major=kind==='controller';
  return `<g><rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${mobile?8:6}" fill="url(#card)" stroke="${major?'#c8dca9':'#6d9691'}" stroke-opacity="${major?'.8':'.55'}"/>${text(x+24,y+32,label,mobile?18:16,'#b7cca9','letter-spacing="1.2"')}${text(x+24,y+79,name,mobile?30:30,'#f0f5e9','font-weight="500"')}${lines.map((line,i)=>text(x+24,y+116+i*29,line,mobile?22:21,'#b8cfca')).join('')}${major?`<path d="M${x+bw-48} ${y+35}v25m-12-13h25" stroke="#c8dca9" stroke-width="1.4"/>`:''}</g>`;
 };
 let body='';
 if(mobile){
  body+=text(40,52,'AQUANODE / EC-revB',18,'#bdd0b3','letter-spacing="1.5"');
  body+=text(40,119,c.title,34,'#f1f5e8','letter-spacing="-1"');body+=text(40,160,c.sub,23,'#a9c6c3');
  body+=text(40,225,c.sensors,19,'#c8dca9','letter-spacing="1"');
  body+=box(40,250,326,174,'SEN0244 / TDS','SEN0244',[c.ec]);
  body+=box(394,250,326,174,'DS18B20 / °C','DS18B20',[c.temp]);
  body+=`<g fill="none" stroke="#c8dca9" stroke-width="1.7"><path d="M203 424v28q0 24 24 24h306q24 0 24-24v-28"/><path d="M380 476v59" marker-end="url(#arrow)"/><circle cx="380" cy="476" r="4" fill="#c8dca9"/></g>`;
  body+=box(40,535,680,190,c.controller,'XIAO ESP32S3',[c.calibration,c.source],'controller');
  body+=`<path d="M380 725v60" fill="none" stroke="#c8dca9" stroke-width="1.7" marker-end="url(#arrow)"/>`;
  body+=box(40,795,680,160,c.record,'USB / JSONL',[c.records]);
  body+=`<path d="M40 995h680" stroke="#a8c0aa" stroke-opacity=".3"/>`;
  body+=text(40,1038,c.mobilePending[0],24,'#dce8c9');body+=text(40,1073,c.mobilePending[1],22,'#adc9c4');
  body+=text(40,1128,'AquaNode · CC BY 4.0 · R0.3-EC-revB',17,'#91b1aa');
 }else{
  body+=text(64,63,'AQUANODE / ENGINEERING SERIES',16,'#b8cca9','letter-spacing="2"');body+=text(1175,63,'R0.3-EC-revB',17,'#b8cca9');
  body+=text(64,145,c.title,48,'#f2f5e8','letter-spacing="-1.3"');body+=text(64,195,c.sub,25,'#a9c6c3');
  body+=text(64,266,c.sensors,16,'#b7cca9','letter-spacing="1.5"');
  body+=box(64,290,350,165,'01.1 / EC','SEN0244',[c.ec,c.tds]);
  body+=box(64,490,350,165,'01.2 / °C','DS18B20',[c.temp]);
  body+=box(545,360,350,250,c.controller,'XIAO ESP32S3',[c.calibration,c.source],'controller');
  body+=box(1050,390,326,200,c.record,'USB / JSONL',[c.records,c.raw]);
  body+=`<g fill="none" stroke="#c8dca9" stroke-width="1.6"><path d="M414 372c64 0 66 68 131 68" marker-end="url(#arrow)"/><path d="M414 572c66 0 65-37 131-37" marker-end="url(#arrow)"/><path d="M895 485c70-20 86 20 155 0" marker-end="url(#arrow)"/></g>`;
  body+=`<g fill="#c8dca9">${[[414,372],[414,572],[895,485]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`;
  body+=`<path d="M64 716H1376" stroke="#a7c0b0" stroke-opacity=".3"/>`+wave(1210,744,.9);
  body+=text(64,760,c.next,17,'#c8dca9','letter-spacing="1.1"');body+=text(64,801,c.pending,22,'#bed0c7');body+=text(64,854,c.scope,17,'#91b1aa');body+=text(1160,854,'AquaNode · CC BY 4.0',16,'#91b1aa');
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">AquaNode R0.3-EC-revB</title><desc id="desc">${xml(c.scope+'. '+c.pending)}</desc>${frame}${body}</g></svg>`;
}
for(const locale of Object.keys(copy))for(const mobile of [false,true])fs.writeFileSync(`public/assets/engineering/ec-revb-architecture-${locale}${mobile?'-mobile':''}.svg`,svg(locale,mobile));
console.log('Created six editable architecture illustrations; original handoff image preserved.');
