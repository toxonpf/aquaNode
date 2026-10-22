export const nav = [['/','Overview'],['/about','The project'],['/technology','The buoy'],['/build','Build & resources'],['/journal','Journal'],['/team','The team']] as const;
export type TeamContact={label:string;url:string|null;kind:'email'|'telegram'|'github'|'website'|'linkedin'};
export type TeamMember={slug:string;name:string;role:string;photo:string|null;profilePhoto?:string|null;links:TeamContact[]};
const timurProfilePhoto=new URL('../../20261022_180543.jpg',import.meta.url).href;
const romanProfilePhoto=new URL('../../20261022_180722.jpg',import.meta.url).href;
export const team:TeamMember[]=[
  {slug:'timur-kuandykov',name:'Timur Kuandykov',role:'Co-founder',photo:null,profilePhoto:timurProfilePhoto,links:[]},
  {slug:'roman-benzler',name:'Roman Benzler',role:'Co-founder',photo:null,profilePhoto:romanProfilePhoto,links:[]},
  // Replace each null with a real address to enable that contact. See docs/team-contacts.md.
  {slug:'kirill-dubinin',name:'Kirill Dubinin',role:'Engineering & outreach',photo:null,links:[
    {kind:'email',label:'Email',url:null},
    {kind:'telegram',label:'Telegram',url:null},
    {kind:'website',label:'Website',url:null},
  ]},
  {slug:'artur-kanyshev',name:'Artur Kanyshev',role:'Engineering',photo:null,links:[]},
  {slug:'ayan-kuandyk',name:'Ayan Kuandyk',role:'Sponsor',photo:null,links:[]},
];
export const awardUrl='https://thegeep.org/programs/youth-innovation-challenge/aquanode-team';
export const resources=[{name:'Assembly drawing',detail:'R0.3 · SVG · Original engineering drawing',url:'/resources/Assembly.svg'},{name:'Bill of materials',detail:'R0.3 · Markdown · Russian source',url:'/resources/BOM_ru.md'},{name:'Attribution & licences',detail:'Markdown · Sources and reuse conditions',url:'/resources/ATTRIBUTION.md'}];
export const updates=[
 {date:'Current status · Team report',title:'One working prototype',body:'The team reports a working buoy measuring pH and temperature, with an update transmitted once an hour. The next documentation step is to identify its hardware revision and publish a traceable measurement record.',status:'Working now'},
 {date:'20 October 2026 · Engineering package',title:'R0.3 carrier design reviewed',body:'The release verification records zero ERC and DRC findings in KiCad 8.0.9 and no mismatches across 130 named pads in the schematic-to-PCB comparison. These results verify the digital design; physical performance remains to be tested.',status:'In development'},
 {date:'20 October 2026 · Revision notes',title:'Clearance and power routing revised',body:'C17 and C18 were moved outside the module footprint, leaving a 4 mm access zone below it. The power components were regrouped, with 0.6 mm power tracks except for a documented short neck-down, and 71 ground stitching vias were added.',status:'Design revision'},
 {date:'Next steps · Undated',title:'Move from CAD checks to bench evidence',body:'The release lists module fit, analog loading, power transitions, sleep current, calibration and sealing as unverified. These checks need recorded conditions and results before the revision can be treated as physically validated.',status:'Planned'},
];
export const parts=[{name:'Floating body',text:'Keeps the device at the water surface. The shape shown here is an illustration; actual housing dimensions are not confirmed.'},{name:'Electronics enclosure',text:'Represents the protected measurement and transmission electronics. The illustration does not show an exact internal assembly.'},{name:'Water probes',text:'The working prototype measures pH and temperature. Probe shapes and placement here are conceptual.'}];
export const locales={en:{label:'English',complete:true},ru:{label:'Русский',complete:false},'zh-TW':{label:'繁體中文',complete:false}};
export const steps=[
['Review the design','Start with the assembly drawing and bill of materials. R0.3 is a CAD revision awaiting physical validation, not a proven reproduction of the working buoy. Confirm the purchased module revision and enclosure fit before ordering a board.'],
['Check the mechanical fit','The R0.3 carrier is 80 × 60 mm, with two copper layers. Check stack height, USB access and battery lead clearance with the actual modules. Connect XIAO and Wio using their intended board-to-board connector; do not solder the Wio left row through to XIAO D0–D5.'],
['Inspect before applying power','With power disconnected, inspect connector orientation, diode and transistor polarity, solder joints and shorts. Confirm the pH front end and its documented supply and output ranges. The source design defaults JP1 to pins 2–3.'],
['Bring up the measurement paths','Initially leave the pH module and battery disconnected. Power the controller from USB and check the 3.3 V supply. Check the ADC and temperature sensor separately. Sensor error codes and startup values are not measurements.'],
['Validate the power system','Use known, permitted input voltages to verify ADC scaling. Check the pH power rail with a dummy load before connecting the front end. Verify USB, battery and switch transitions. The battery switch does not turn off USB power; disconnect USB for a complete shutdown.'],
['Calibrate and document','Calibrate pH with fresh reference buffers and check against an independent buffer. Compare temperature readings with a reference thermometer. Record instruments, configuration, raw readings, failures and uncertainty. The supplied package has no completed physical test report.'],
['Test the enclosure, then the system','Test the empty enclosure for leaks before a short, secured water test. Validate the complete measurement and transmission path under controlled conditions. Radio operation requires the applicable local checks. Firmware and a complete reproducible buoy build are not included in R0.3.']
];
