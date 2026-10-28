import type {HTMLAttributes} from 'react';

export type SectionTheme=
 |'buoy'|'water'|'idea'|'learning'|'map'|'circuit'|'drawing'|'tools'
 |'journal'|'people'|'signal'|'progress'|'check'|'future'|'resources'|'compass'
 |'waves'|'probe'|'layers'|'connections'|'blueprint'|'assembly'|'calibration'
 |'battery'|'network'|'globe'|'award'|'search'|'notebook'|'route'|'cycle'|'shield'|'portrait';

const artwork:Record<SectionTheme,string>={
 buoy:'M5 20c4-5 7-5 11 0s7 5 11 0M5 25c4-5 7-5 11 0s7 5 11 0M16 3v10m-5-5h10M22 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0',
 water:'M16 3c-3 5-9 11-9 16a9 9 0 0 0 18 0c0-5-6-11-9-16ZM8 20c3-3 5 3 8 0s5-3 8 0M12 24c2 2 5 2 7 0',
 idea:'M11 22c0-4-5-5-5-11a10 10 0 0 1 20 0c0 6-5 7-5 11M11 22h10m-10 4h10m-8 4h6M12 14l4 4 4-4m-4 4v4',
 learning:'M16 8c-4-3-8-4-13-3v21c5-1 9 0 13 3 4-3 8-4 13-3V5c-5-1-9 0-13 3Zm0 0v21M7 12c2 0 3 1 5 2m-5 4c2 0 3 1 5 2m8-6c2-1 3-2 5-2m-5 8c2-1 3-2 5-2',
 map:'M11 12 3 9v19l8-3 10 3 8-3V11l-5 2M11 12v13m10-8v11M25 8c0 4-6 10-6 10S13 12 13 8a6 6 0 0 1 12 0ZM21 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0',
 circuit:'M8 8h16v16H8ZM12 12h8v8h-8ZM12 3v5m8-5v5M12 24v5m8-5v5M3 12h5m-5 8h5m16-8h5m-5 8h5',
 drawing:'M7 3h14l6 6v20H7ZM21 3v6h6M11 14h12m-12 5h8m-8 5h12M3 8v16m-2-14 2-2 2 2m-4 12 2 2 2-2',
 tools:'M19 4a8 8 0 0 0-9 10L3 24a3 3 0 0 0 5 4l9-8a8 8 0 0 0 10-9l-6 6-6-6 6-6ZM6 25l1 1',
 journal:'M7 3h20v26H7a4 4 0 0 1 0-8h20M7 3a4 4 0 0 0-4 4v18m9-17h10m-10 5h7M7 25h15',
 people:'M20 10a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM7 27v-2a9 9 0 0 1 18 0v2M8 8a4 4 0 0 0-3 7m22-7a4 4 0 0 1 0 7M3 20a7 7 0 0 0-2 5m28-5a7 7 0 0 1 2 5',
 signal:'M16 17v12m-4 0h8M18 14a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 8a8 8 0 0 0 0 12m12-12a8 8 0 0 1 0 12M6 4a14 14 0 0 0 0 20M26 4a14 14 0 0 1 0 20',
 progress:'M4 26h7v-7h7v-7h10M4 6c7 0 8 4 11 4s5-6 13-6m-4-2 4 2-2 4',
 check:'M27 15a12 12 0 1 1-7-11M9 15l5 5L28 5',
 future:'M3 21h26M8 21a8 8 0 0 1 16 0M16 3v5M5 8l4 4m14 0 4-4M3 27c4-4 9 4 13 0s9-4 13 0',
 resources:'M3 9V6h10l3 3h13v19H3ZM3 13h26M8 19c3-3 5 3 8 0s5-3 8 0m-16 5h10',
 compass:'M29 16a13 13 0 1 0-26 0 13 13 0 0 0 26 0ZM21 11l-3 7-7 3 3-7ZM16 3v3m0 20v3M3 16h3m20 0h3',
 waves:'M3 8c4-5 9 5 13 0s9-5 13 0M3 16c4-5 9 5 13 0s9-5 13 0M3 24c4-5 9 5 13 0s9-5 13 0',
 probe:'M13 3h6v20a3 3 0 0 1-6 0ZM13 9h6m-6 10h6m-3 3v2M3 13c2-2 4 2 6 0m14 0c2-2 4 2 6 0M3 20c2-2 4 2 6 0m14 0c2-2 4 2 6 0',
 layers:'M16 3 29 10 16 17 3 10ZM3 16l13 7 13-7M3 22l13 7 13-7',
 connections:'M19 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM9 25a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM29 25a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM16 9v5c0 3-10 2-10 6v2m10-8c0 3 10 2 10 6v2',
 blueprint:'M3 4h22v20H3ZM8 4v20M3 10h22M12 14h8v6h-8ZM29 5v18m-2-16 2-2 2 2m-4 14 2 2 2-2M4 29h20m-18-2-2 2 2 2m16-4 2 2-2 2',
 assembly:'M16 3 27 9v14l-11 6L5 23V9ZM21 16a5 5 0 1 0-10 0 5 5 0 0 0 10 0',
 calibration:'M3 7h8m6 0h12M3 16h3m6 0h17M3 25h16m6 0h4M17 7a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM12 16a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM25 25a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
 battery:'M12 6V3h8v3M8 6h16v23H8ZM12 14h8m-4-4v8m-4 6h8',
 network:'M16 6 6 12m-1 5 4 8m5 2h6m5-2 3-8m-1-5L18 6M9 14h15M8 17l13 9M24 17 12 26M18 4a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM8 14a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM30 14a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM14 27a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM26 27a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
 globe:'M29 16a13 13 0 1 0-26 0 13 13 0 0 0 26 0ZM22 16c0 7-3 13-6 13s-6-6-6-13S13 3 16 3s6 6 6 13ZM4 11c7 2 17 2 24 0M4 21c7-2 17-2 24 0',
 award:'M9 3h14v8a7 7 0 0 1-14 0ZM9 6H4v5a6 6 0 0 0 6 6m13-11h5v5a6 6 0 0 1-6 6M16 18v7m-6 4v-4h12v4Z',
 search:'M24 14a10 10 0 1 0-20 0 10 10 0 0 0 20 0ZM21 21l8 8M7 15c3-3 4 3 7 0s4-3 7 0',
 notebook:'M7 4h22v25H7ZM3 8h7m-7 7h7m-7 7h7M15 10h9m-9 6h9m-9 6h5',
 route:'M8 25a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM30 7a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM8 25h8c9 0 10-9 1-9S7 7 16 7h8',
 cycle:'M5 11a12 12 0 0 1 21-3m-5 0h5V3M27 21A12 12 0 0 1 6 24m5 0H6v5M10 16c3-3 3 3 6 0s3-3 6 0',
 shield:'M16 3c-4 3-8 4-12 4v9c0 6 5 10 12 13 7-3 12-7 12-13V7c-4 0-8-1-12-4ZM9 16c3-3 4 3 7 0s4-3 7 0',
 portrait:'M5 3h22v26H5ZM20 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM9 25v-1a7 7 0 0 1 14 0v1',
};

export function SectionIcon({theme}:{theme:SectionTheme}){
 return <svg className="section-icon" data-section-icon={theme} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false"><path d={artwork[theme]}/></svg>;
}

/** Strip only editorial section ordinals; navigation and ordered instructions keep theirs. */
export default function SectionLabel({icon,as:Tag='p',children,className='',...props}:Omit<HTMLAttributes<HTMLElement>,'children'>&{icon:SectionTheme;as?:'p'|'span';children:string}){
 const label=children.replace(/^\s*\d{1,2}\s*\/\s*/,'');
 return <Tag {...props} className={`kicker section-label ${className}`.trim()}><SectionIcon theme={icon}/><span className="section-label-text">{label}</span></Tag>;
}
