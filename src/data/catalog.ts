export const nav = [['/','Overview'],['/about','The project'],['/technology','The buoy'],['/build','Build & resources'],['/journal','Journal'],['/team','The team']] as const;
export type TeamContact={label:string;url:string|null;kind:'email'|'telegram'|'github'|'website'|'linkedin'|'instagram'|'spotify'};
export type TeamMember={slug:string;name:string;role:string;photo:string|null;profilePhoto?:string|null;links:TeamContact[]};
const timurProfilePhoto='/assets/team/timur-kuandykov-portrait.webp';
const romanProfilePhoto='/assets/team/roman-benzler-portrait.webp';
const ayanProfilePhoto='/assets/team/ayan-kuandyk-portrait.webp';
export const team:TeamMember[]=[
  {slug:'timur-kuandykov',name:'Timur Kuandykov',role:'Co-founder',photo:timurProfilePhoto,profilePhoto:timurProfilePhoto,links:[
  {
    "kind": "linkedin",
    "label": "LinkedIn",
    "url": "https://www.linkedin.com/in/timur-kuandykov-4a4416386/"
  },
  {
    "kind": "telegram",
    "label": "Telegram",
    "url": "https://t.me/JohnyScript"
  }
]},
  {slug:'roman-benzler',name:'Roman Benzler',role:'Co-founder',photo:romanProfilePhoto,profilePhoto:romanProfilePhoto,links:[
  {
    "kind": "linkedin",
    "label": "LinkedIn",
    "url": "https://www.linkedin.com/in/roman-benzler-2848a034b/"
  },
  {
    "kind": "telegram",
    "label": "Telegram",
    "url": "https://t.me/Pomelonka"
  }
]},
  // Public contact links supplied by the team. See docs/team-contacts.md.
  {slug:'kirill-dubinin',name:'Kirill Dubinin',role:'Engineering & outreach',photo:null,links:[
  {
    "kind": "telegram",
    "label": "Telegram",
    "url": "https://t.me/toxonpf"
  },
  {
    "kind": "github",
    "label": "GitHub",
    "url": "https://github.com/toxonpf"
  },
  {
    "kind": "linkedin",
    "label": "LinkedIn",
    "url": "https://www.linkedin.com/in/kirill-dubinin-47248b35a/"
  }
]},
  {slug:'artur-kanyshev',name:'Artur Kanyshev',role:'Engineering',photo:null,links:[]},
  {slug:'ayan-kuandyk',name:'Ayan Kuandyk',role:'Helper',photo:ayanProfilePhoto,profilePhoto:ayanProfilePhoto,links:[
  {
    "kind": "instagram",
    "label": "Instagram",
    "url": "https://www.instagram.com/justurfrenlydud/"
  },
  {
    "kind": "spotify",
    "label": "Spotify",
    "url": "https://open.spotify.com/user/31owrkexrl2dj3x7usfdri2ejglq"
  },
  {
    "kind": "linkedin",
    "label": "LinkedIn",
    "url": "https://www.linkedin.com/in/ayan-kuandyk-ab9837448/"
  },
  {
    "kind": "telegram",
    "label": "Telegram",
    "url": "https://t.me/Lighter_yin"
  }
]},
];
export const awardUrl='https://thegeep.org/programs/youth-innovation-challenge/aquanode-team';
export const awardCertificate={preview:'/assets/awards/geep-yic-2026-winner.webp',original:'/resources/awards/geep-yic-2026-winner.png'};
export type Resource={name:string;detail:string;url:string;urlRu?:string;urlZh?:string};
export const resources:Resource[]=[
  {
    "name": "Project overview",
    "detail": "R0.3-EC-pH-revC · Markdown · Current scope and limitations",
    "url": "/resources/ec-ph-revc/copy_en.md",
    "urlRu": "/resources/ec-ph-revc/copy_ru.md",
    "urlZh": "/resources/ec-ph-revc/copy_zh-TW.md"
  },
  {
    "name": "Revision status",
    "detail": "2 November 2026 · JSON · Scope, checks and open tasks",
    "url": "/resources/ec-ph-revc/status.json"
  },
  {
    "name": "Checks & sources",
    "detail": "R0.3-EC-pH-revC · Markdown · Sources and evidence limits",
    "url": "/resources/ec-ph-revc/evidence.md"
  },
  {
    "name": "System architecture",
    "detail": "R0.3-EC-pH-revC · SVG · Design illustration, not a schematic",
    "url": "/assets/engineering/ec-ph-revc-architecture-en.svg",
    "urlRu": "/assets/engineering/ec-ph-revc-architecture-ru.svg",
    "urlZh": "/assets/engineering/ec-ph-revc-architecture-zh-TW.svg"
  },
  {
    "name": "Attribution & licences",
    "detail": "CC BY 4.0 · Sources and reuse conditions",
    "url": "/resources/ec-ph-revc/ATTRIBUTION.md"
  }
];
export const updates=[
  {
    "date": "2 November 2026 · Engineering review",
    "title": "R0.3-EC-pH-revC: an isolated pH bench configuration",
    "body": "revC adds SEN0169-V2 pH through DFR0504 isolation and ADS1115, alongside SEN0244 EC and DS18B20 temperature. pH needs a separate regulated bench supply; hardware validation is pending.",
    "status": "Engineering development"
  },
  {
    "date": "2 November 2026 · Synthetic and static checks",
    "title": "revC code and project-file checks",
    "body": "The documented checks cover a host-side software model and agreement between project files. The journal separates these two kinds of source-level evidence from the hardware work still ahead.",
    "status": "Synthetic checks"
  },
  {
    "date": "2 November 2026 · Release blockers",
    "title": "Before revC hardware testing",
    "body": "The ESP32 build attempt stopped at a dependency download. Native ERC/DRC, power checks, full-chain pH calibration, independent EC validation and joint-water tests remain ahead.",
    "status": "Validation pending"
  },
  {
    "date": "20 October 2026 · Historical R0.3 baseline",
    "title": "R0.3 checks · 20 October 2026",
    "body": "The historical baseline reports zero ERC/DRC findings and a comparison of 130 named pads. Those results belong to the earlier R0.3 design; they do not validate EC+pH-revC.",
    "status": "Historical baseline"
  }
];
export const parts=[{name:'Floating body',text:'Keeps the buoy at the water surface.'},{name:'Electronics enclosure',text:'Contains the controller, power and sensor connections.'},{name:'Water probes',text:"The 3D model shows the main parts of a buoy. The layout depends on the device revision."}];
export const steps=[
  [
    "Review the revision",
    "Read the revC scope, status and evidence register. It is a freshwater bench configuration with isolated pH, not a fabrication release. Historical revB instructions do not describe the new pH wiring."
  ],
  [
    "Run native CAD checks",
    "Run native ERC and DRC, resolve findings and produce a current schematic export. Source-level connection comparisons do not replace these checks. No new manufacturing files are released by revC."
  ],
  [
    "Compile the bench source",
    "Build for the intended ESP32 target, then verify USB acquisition on the actual device. The supplied source has not been compiled or executed on ESP32 in the documented checks."
  ],
  [
    "Check power and ADC behaviour",
    "Follow the complete revC bench plan with suitable instruments. The pH isolator uses its own regulated supply; validate power behaviour and both ADC paths before interpreting sensor readings."
  ],
  [
    "Check sensor interaction",
    "Keep pH and EC connected in the same water and test their interaction. Isolation is part of the design, not proof that interference is eliminated. Radio remains a separate unverified task."
  ],
  [
    "Calibrate and document",
    "Calibrate the complete pH chain with real buffers, EC with independent standards, and temperature against a reference thermometer. Keep raw records and uncertainty; never load synthetic test coefficients."
  ],
  [
    "Validate the physical system",
    "After bench checks, assess enclosure performance, water exposure, radio communication and energy use. Long-term operation, field pilots and battery life are not established by revC."
  ]
];
