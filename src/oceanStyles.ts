export type OceanWave={x:number;z:number;amplitude:number;frequency:number;speed:number;crest?:number};
export type OceanAppearance='original'|'smooth'|'depth'|'ripples'|'swell-soft'|'swell-foam'|'swell-ribbon'|'swell-textured';
export type OceanStyle={
  id:number;name:string;description:string;appearance:OceanAppearance;
  waves:readonly OceanWave[];
  bend?:{frequency:number;speed:number;amplitude:number};
};

const originalWaves:readonly OceanWave[]=[
  {x:.94,z:.342,amplitude:.17,frequency:.85,speed:.72},
  {x:-.42,z:.9075,amplitude:.095,frequency:1.48,speed:1.04},
  {x:.685,z:-.7285,amplitude:.047,frequency:2.62,speed:1.38},
  {x:.2,z:.98,amplitude:.018,frequency:5.3,speed:1.8},
];
const depthWaves=originalWaves.map((wave,index)=>({...wave,amplitude:index===0?.21:index===1?.115:wave.amplitude}));
const swellWaves:readonly OceanWave[]=[
  {x:.94,z:.342,amplitude:.42,frequency:.5,speed:.55,crest:.28},
  {x:.82,z:.572,amplitude:.19,frequency:.84,speed:.76,crest:.2},
  {x:-.42,z:.9075,amplitude:.075,frequency:1.52,speed:1.03,crest:.12},
  {x:.685,z:-.7285,amplitude:.025,frequency:2.8,speed:1.28,crest:.08},
];
const texturedWaves=swellWaves.map((wave,index)=>({...wave,amplitude:index===2?.105:index===3?.035:wave.amplitude}));
const oceanWaves:readonly OceanWave[]=[...texturedWaves,
  {x:.3,z:.9539,amplitude:.055,frequency:2.2,speed:1.12,crest:.14},
  {x:.86,z:.5103,amplitude:.028,frequency:3.7,speed:1.46,crest:.1},
];
const bend={frequency:.22,speed:.045,amplitude:.4};

// Stable numbers preserve every iteration from the water refinements.
export const oceanStyles:readonly OceanStyle[]=[
  {id:1,name:'Original',description:'Исходная вода с частой блестящей рябью',appearance:'original',waves:originalWaves},
  {id:2,name:'Smooth',description:'Сглаженная вода с мягкими бликами',appearance:'smooth',waves:originalWaves},
  {id:3,name:'Soft depth',description:'Оттенки глубины и мягкая поверхность',appearance:'depth',waves:depthWaves},
  {id:4,name:'Fine ripples',description:'Мелкая направленная рябь — предыдущий озёрный вариант',appearance:'ripples',waves:depthWaves},
  {id:5,name:'Long swell',description:'Первая длинная океанская зыбь',appearance:'swell-soft',waves:swellWaves,bend},
  {id:6,name:'Broad foam',description:'Длинные волны с широкими участками пены',appearance:'swell-foam',waves:swellWaves,bend},
  {id:7,name:'Crest ribbons',description:'Зыбь с узкими полосами пены на гребнях',appearance:'swell-ribbon',waves:swellWaves,bend},
  {id:8,name:'Textured crests',description:'Четыре волны, глубокий цвет и разорванная пена',appearance:'swell-textured',waves:texturedWaves,bend},
  {id:9,name:'Ocean',description:'Текущий океан: шесть волн, крупная зыбь и редкая пена',appearance:'swell-textured',waves:oceanWaves,bend},
];
export const DEFAULT_OCEAN_STYLE=9;
