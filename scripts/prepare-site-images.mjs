import {chromium} from '@playwright/test';
import {access,mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const images=[
  {source:'20261022_180543.jpg',output:'public/assets/team/timur-kuandykov.webp',original:'assets-source/team/timur-kuandykov.jpg',type:'image/jpeg',width:1600,quality:.91},
  {source:'20261022_180722.jpg',output:'public/assets/team/roman-benzler.webp',original:'assets-source/team/roman-benzler.jpg',type:'image/jpeg',width:1600,quality:.91},
  {source:'2026 YIC Winner_AquaNode Team.png',output:'public/assets/awards/geep-yic-2026-winner.webp',original:'public/resources/awards/geep-yic-2026-winner.png',type:'image/png',width:1600,quality:.97},
];
// Convert supplied images locally. Keep source photographs outside the public
// bundle; preserve the unmodified certificate as the downloadable document.
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH??'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
try{
  const page=await browser.newPage();
  for(const item of images){
    const source=path.join(root,item.source),output=path.join(root,item.output),original=path.join(root,item.original);
    try{await access(source)}catch{console.log(`Already processed or missing: ${item.source}`);continue}
    for(const destination of [output,original]){
      try{await access(destination);throw new Error(`Refusing to overwrite ${destination}`)}catch(error){if(error.code!=='ENOENT')throw error}
    }
    const input=await readFile(source);
    const result=await page.evaluate(async({data,width,quality})=>{
      const image=new Image();image.src=data;await image.decode();
      const canvas=document.createElement('canvas'),ratio=Math.min(1,width/image.naturalWidth);
      canvas.width=Math.round(image.naturalWidth*ratio);canvas.height=Math.round(image.naturalHeight*ratio);
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      return {data:canvas.toDataURL('image/webp',quality),width:canvas.width,height:canvas.height};
    },{data:`data:${item.type};base64,${input.toString('base64')}`,width:item.width,quality:item.quality});
    if(!result.data.startsWith('data:image/webp;base64,'))throw new Error('WebP encoding unavailable');
    const converted=Buffer.from(result.data.split(',')[1],'base64');
    if(converted.subarray(8,12).toString()!=='WEBP')throw new Error('Invalid WebP');
    await mkdir(path.dirname(output),{recursive:true});await mkdir(path.dirname(original),{recursive:true});
    await writeFile(output,converted,{flag:'wx'});
    await rename(source,original);
    console.log(`${item.output}: ${result.width} × ${result.height}, ${input.length} → ${converted.length} bytes; original: ${item.original}`);
  }
}finally{await browser.close()}
