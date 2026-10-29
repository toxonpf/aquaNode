import statusSource from './revisions/ec-revb.json?raw';
import {locale,subscribeLocale,type Locale} from '../features/i18n/i18n';

/** Supplied web_handoff/status.json. Unknown measured outcomes remain null. */
export const projectStatus=JSON.parse(statusSource) as {
 revision:string;as_of:string;stage:string;freshwater_only:boolean;
 hardware_tested:boolean;firmware_compiled:boolean;native_erc_run:boolean;native_drc_run:boolean;
 fabrication_ready:boolean;radio_verified:boolean;mesh_verified:boolean;ph_verified:boolean;
 accuracy:number|null;battery_life:number|null;field_pilots_verified:number|null;
 software_tests:{type:string;result:string;count:number};
};
export const revision=projectStatus.revision;
export const revisionDate=projectStatus.as_of;
export const originalArchitectureUrl='/assets/engineering/ec-revb-architecture.svg';
export const architectureForLocale=(value:Locale)=>`/assets/engineering/ec-revb-architecture-${value}.svg`;
export let architectureUrl=architectureForLocale(locale);
subscribeLocale(()=>{architectureUrl=architectureForLocale(locale)});
export const revisionResources='/resources/ec-revb';
