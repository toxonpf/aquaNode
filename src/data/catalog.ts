export const nav = [['/','Overview'],['/about','The project'],['/technology','The buoy'],['/build','Build & resources'],['/journal','Journal'],['/team','The team']] as const;
export type TeamContact={label:string;url:string|null;kind:'email'|'telegram'|'github'|'website'|'linkedin'};
export type TeamMember={slug:string;name:string;role:string;photo:string|null;profilePhoto?:string|null;links:TeamContact[]};
const timurProfilePhoto='/assets/team/timur-kuandykov.webp';
const romanProfilePhoto='/assets/team/roman-benzler.webp';
export const team:TeamMember[]=[
  {slug:'timur-kuandykov',name:'Timur Kuandykov',role:'Co-founder',photo:timurProfilePhoto,profilePhoto:timurProfilePhoto,links:[]},
  {slug:'roman-benzler',name:'Roman Benzler',role:'Co-founder',photo:romanProfilePhoto,profilePhoto:romanProfilePhoto,links:[]},
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
export const awardCertificate={preview:'/assets/awards/geep-yic-2026-winner.webp',original:'/resources/awards/geep-yic-2026-winner.png'};
export type Resource={name:string;detail:string;url:string;urlRu?:string;urlZh?:string};
export const resources:Resource[]=[
  {
    "name": "Project overview",
    "detail": "R0.3-EC-revB · Markdown · Current scope and limitations",
    "url": "/resources/ec-revb/copy_en.md",
    "urlRu": "/resources/ec-revb/copy_ru.md",
    "urlZh": "/resources/ec-revb/copy_zh-TW.md"
  },
  {
    "name": "Revision status",
    "detail": "29 October 2026 · JSON · Scope, checks and open tasks",
    "url": "/resources/ec-revb/status.json"
  },
  {
    "name": "Checks & sources",
    "detail": "R0.3-EC-revB · Markdown · Sources and evidence limits",
    "url": "/resources/ec-revb/evidence.md"
  },
  {
    "name": "System architecture",
    "detail": "R0.3-EC-revB · SVG · Design illustration, not a schematic",
    "url": "/assets/engineering/ec-revb-architecture-en.svg",
    "urlRu": "/assets/engineering/ec-revb-architecture-ru.svg",
    "urlZh": "/assets/engineering/ec-revb-architecture-zh-TW.svg"
  },
  {
    "name": "Attribution & licences",
    "detail": "CC BY 4.0 · Sources and reuse conditions",
    "url": "/resources/ec-revb/ATTRIBUTION.md"
  }
];
export const updates=[
  {
    "date": "29 October 2026 · Engineering review",
    "title": "R0.3-EC-revB: a freshwater bench design",
    "body": "The current revision prepares SEN0244 for an experimental EC estimate, DS18B20 temperature sensing and USB bench source code. Firmware compilation, native ERC/DRC and hardware validation are pending.",
    "status": "Engineering development"
  },
  {
    "date": "29 October 2026 · Synthetic and static checks",
    "title": "Software evidence, with clear limits",
    "body": "The documented checks cover a host-side software model and agreement between project files. The journal separates these two kinds of source-level evidence from the hardware work still ahead.",
    "status": "Synthetic checks"
  },
  {
    "date": "29 October 2026 · Release blockers",
    "title": "The next release needs bench evidence",
    "body": "An ESP32 build, native CAD checks and independent EC bench measurements are the main blockers before a new release. The test plan also covers sensor interaction and physical validation.",
    "status": "Validation pending"
  },
  {
    "date": "20 October 2026 · Historical R0.3 baseline",
    "title": "Earlier R0.3 design checks",
    "body": "The historical baseline reports zero ERC/DRC findings and a comparison of 130 named pads. Those results belong to the earlier R0.3 design; they do not validate EC-revB.",
    "status": "Historical baseline"
  }
];
export const parts=[{name:'Floating body',text:'Keeps the device at the water surface. The shape shown here is an illustration; actual housing dimensions are not confirmed.'},{name:'Electronics enclosure',text:'Represents the protected measurement and transmission electronics. The illustration does not show an exact internal assembly.'},{name:'Water probes',text:"The current design explores an EC estimate with SEN0244 and temperature with DS18B20. Probe shapes are conceptual; hardware operation is not yet validated."}];
export const steps=[
  [
    "Review the revision",
    "Read the revB scope, status and evidence register. This is a freshwater engineering design, not a fabrication release or a validated buoy build. Historical R0.3 and revA files are not current instructions."
  ],
  [
    "Run native CAD checks",
    "Run native ERC and DRC, resolve findings and produce a current schematic export. The separate connection-review PDF is not that export. Manufacturing files are not released by this package."
  ],
  [
    "Compile the bench source",
    "Build for the intended ESP32 target, then verify USB acquisition on the actual device. The supplied source has not been compiled or executed on ESP32 in the documented checks."
  ],
  [
    "Check power and ADC behaviour",
    "Follow the full engineering bench plan with suitable instruments. Record startup, supply behaviour and ADC response under known conditions before interpreting sensor readings."
  ],
  [
    "Check sensor interaction",
    "The EC bench does not verify pH or radio operation. Investigate sensor interaction as a separate test, and keep its setup and limitations with the results."
  ],
  [
    "Calibrate and document",
    "Use independent EC standards and a reference thermometer. Keep raw readings, calibration records, temperature conditions, failures and uncertainty. Synthetic test inputs must not become device calibration."
  ],
  [
    "Validate the physical system",
    "After bench checks, assess enclosure performance, water exposure, radio communication and energy use. Long-term operation, field pilots and battery life are not established by revB."
  ]
];
