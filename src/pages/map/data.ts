import csv from '../../../stations_data_en.csv?raw';
import csvUrl from '../../../stations_data_en.csv?url';
import {aktauCoast,hawaiiCoasts,offshorePoint} from './shoreline';

export {csvUrl};
export const datasetUrl='https://data.gov.tw/dataset/155934';
export type RegionId='hawaii'|'aktau'|'taiwan';
export type Coordinates=[number,number];
export type Station={id:string;name:string;position:Coordinates;type:string;kmFromTaipei:number};
export const stations:Station[]=[
  {id:'5131',name:'Bali / Tamsui estuary',position:[25.222617,121.400770],type:'estuary',kmFromTaipei:27},
  {id:'5127',name:'Keelung / Heping Island',position:[25.166219,121.764830],type:'port',kmFromTaipei:25},
  {id:'5138',name:'Xinnankan river mouth',position:[25.122370,121.245769],type:'river_mouth',kmFromTaipei:34},
  {id:'5136',name:'Shen-ao coast',position:[25.131742,121.829123],type:'coast',kmFromTaipei:29},
];
export function nearestStation(position:Coordinates){
  const radians=Math.PI/180;
  const distance=(station:Station)=>{
    const a=Math.sin((station.position[0]-position[0])*radians/2)**2+
      Math.cos(position[0]*radians)*Math.cos(station.position[0]*radians)*Math.sin((station.position[1]-position[1])*radians/2)**2;
    return Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  };
  return [...stations].sort((a,b)=>distance(a)-distance(b))[0];
}
export type Buoy={id:string;region:RegionId;position:Coordinates;stationId?:string;kind?:'buoy'|'station'};
// These are illustrative locations within the areas supplied by the team,
// not surveyed GPS positions. Keep this distinction visible in the UI.
const hawaii:Buoy[]=[
  {id:'HPU-001',region:'hawaii',position:offshorePoint(hawaiiCoasts[0],.65,14)},
  {id:'HPU-002',region:'hawaii',position:offshorePoint(hawaiiCoasts[1],.55,14)},
  {id:'HPU-003',region:'hawaii',position:offshorePoint(hawaiiCoasts[2],.46,14)},
];
const aktau:Buoy[]=Array.from({length:97},(_,index)=>({
  id:`AKT-${String(index+1).padStart(3,'0')}`,region:'aktau',
  position:offshorePoint(aktauCoast,(index+.5)/97,15+3.5*Math.sin(index*2.13)+2*Math.sin(index*.73)),
}));
const taiwan:Buoy[]=stations.map((station,index)=>{
  const position:Coordinates=[station.position[0]+.00065,station.position[1]-.00065];
  return {id:`TWN-${String(index+1).padStart(3,'0')}`,region:'taiwan',stationId:nearestStation(position).id,position};
});
export const buoys:Buoy[]=[...hawaii,...aktau,...taiwan];
export const stationLocations:Buoy[]=stations.map(station=>({id:`station-${station.id}`,region:'taiwan',kind:'station',stationId:station.id,position:station.position}));
export const mapLocations=[...buoys,...stationLocations];
export const regionIds:RegionId[]=['hawaii','aktau','taiwan'];
export const regionPoints=(region:RegionId)=>mapLocations.filter(buoy=>buoy.region===region).map(buoy=>buoy.position);

export type Sample={stationId:string;date:string;period:string;values:string[]};
export const samples:Sample[]=csv.trim().split(/\r?\n/).slice(1).map(line=>{
  const [stationId,,date,...values]=line.split(',');
  return {stationId,date,period:`${date.slice(0,4)}-Q${Math.ceil(Number(date.slice(5,7))/3)}`,values};
}).filter(sample=>stations.some(station=>station.id===sample.stationId)&&/^\d{4}-\d{2}-\d{2}$/.test(sample.date));
export const periods=[...new Set(samples.map(sample=>sample.period))].sort().reverse();
const sampleDates=samples.map(sample=>sample.date).sort();
/** Labels describe the supplied CSV extract, never the entire external dataset. */
export const archiveSummary={count:samples.length,stationCount:new Set(samples.map(sample=>sample.stationId)).size,firstDate:sampleDates[0],lastDate:sampleDates.at(-1),years:`${sampleDates[0]?.slice(0,4)??'—'}–${sampleDates.at(-1)?.slice(0,4)??'—'}`};
export function sampleFor(stationId:string,period:string){
  return samples.filter(sample=>sample.stationId===stationId&&sample.period===period).sort((a,b)=>b.date.localeCompare(a.date))[0];
}
// A reproducible design preview, never a measurement or evidence of accuracy.
// Synthetic examples preserve the original source date and missing/censored values.
export type ExampleReading={key:'temperature'|'ph';value:string;reference:string;unit:'°C'|'pH';deviation:number};
function modelReading(key:ExampleReading['key'],raw:string,seed:string,precision:number):ExampleReading|null{
  // Missing/censored observations cannot become exact synthetic measurements.
  if(!/^-?\d+(\.\d+)?$/.test(raw))return null;
  const reference=Number(raw),scale=10**precision;
  let hash=2166136261;
  for(const char of seed+key)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
  const offset=((hash%9401)/100000)-.047;
  const low=Math.ceil((reference-Math.abs(reference)*.05)*scale),high=Math.floor((reference+Math.abs(reference)*.05)*scale);
  const units=Math.max(low,Math.min(high,Math.round(reference*(1+offset)*scale))),value=units/scale;
  return {key,unit:key==='temperature'?'°C':'pH',value:value.toFixed(precision),reference:raw,deviation:reference?(value-reference)/Math.abs(reference)*100:0};
}
export function exampleFor(buoy:Buoy,period:string){
 const station=stations.find(item=>item.id===buoy.stationId);
 const sample=station?sampleFor(station.id,period):undefined;
 const regional=buoy.region==='hawaii'?{
  label:'Hawaiʻi Department of Health · West Maui / North Reference Area',
  url:'https://health.hawaii.gov/environmental-data/coastal-waters/',
  observation:'2022-08-01 – 2023-08-07 · Table 1 average',temperature:'26.3',ph:'8.17',
 }:buoy.region==='aktau'?{
  label:'Kostianoy et al. (2024) · Aktau / station K4',
  url:'https://doi.org/10.37828/em.2024.76.4',
  observation:'2023-09-13 · Table 4',temperature:'',ph:'8.12',
 }:undefined;
 const source=regional??{label:station?`${station.id} · ${station.name}`:'',url:datasetUrl,observation:sample?.date??period};
 // Regional aggregates retain their original observation period. Changing the
 // Taiwan archive quarter must not fabricate a new sample date in other regions.
 const seed=buoy.id+(regional?source.observation:period);
 const readings=[modelReading('temperature',regional?.temperature??sample?.values[1]??'',seed,1),modelReading('ph',regional?.ph??sample?.values[3]??'',seed,2)].filter((value):value is ExampleReading=>value!==null);
 return {station,sample,source,kind:regional?'regional' as const:'station' as const,readings};
}
/** Downloadable records retain simulated status, original references and map IDs. */
export const buoyRecords=buoys.map(buoy=>{
 const example=exampleFor(buoy,periods[0]);
 return {id:buoy.id,region:buoy.region,position:buoy.position,positionType:'illustrative',dataType:'calculation-example',source:example.source,readings:example.readings};
});
export const buoyRecordsUrl=`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(buoyRecords,null,2))}`;
