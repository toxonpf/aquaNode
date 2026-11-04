import {t} from '../features/i18n/i18n';
const pages:Record<string,[string,string]>={
 '/':['AquaNode — buoys and real water measurements','AquaNode combines hands-on buoy building with environmental education for school students. We have collected data with checked sensors and sent buoys to partners for collaborative work.'],
 '/about':['The project','How AquaNode connects practical engineering, water measurements and environmental education for school students.'],
 '/technology':['How the buoy works','AquaNode sensors, electronics and device revisions, with the scope and checks of the developing revC.'],
 '/build':['Build & documentation','Revision documents, components and the AquaNode revC development plan.'],
 '/journal':['Development & results','AquaNode team updates and engineering results, with dated revision records.'],
 '/map':['Buoy map','AquaNode cooperation regions, shipment status and a separate Taiwan station archive.'],
 '/team':['AquaNode team','AquaNode founders, engineering team and public contacts.'],
};
export function pageMetadata(path:string){const [title,description]=pages[path]??['Page not found','AquaNode'];return {title:path==='/'?t(title):`${t(title)} — AquaNode`,description:t(description)}}
