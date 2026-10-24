import {test,expect} from '@playwright/test';

declare global{
 interface Window{
  oceanStyle:{():{id:number;name:string;description:string}[];(id:number):{id:number;name:string;description:string}};
 }
}

test('all nine ocean shaders switch live without replacing the canvas or changing chapter',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))errors.push(message.text())});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 const canvas=page.locator('.ocean-hero canvas');
 await expect(canvas).toHaveAttribute('data-ocean-style','9');
 const original=await canvas.elementHandle();
 expect(await page.evaluate(()=>window.oceanStyle().map(style=>style.id))).toEqual([1,2,3,4,5,6,7,8,9]);
 const switchStyle=async(id:number)=>{
  expect((await page.evaluate(id=>window.oceanStyle(id),id)).id).toBe(id);
  await expect(canvas).toHaveAttribute('data-ocean-style',String(id));
  // Wait for actual draws: Three reports shader compilation errors at render time.
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  expect(await original!.evaluate(node=>node.isConnected)).toBe(true);
 };
 for(let id=1;id<=9;id++){
  await switchStyle(id);
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','surface');
  await page.screenshot({path:`test-results/ocean-style-${id}.png`});
 }
 await page.getByRole('link',{name:'Explore below the surface',exact:true}).click();
 await expect(page.locator('.ocean-stage.is-sensing-ready')).toBeVisible();
 for(const id of [1,4,9])await switchStyle(id);
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','sensing');
 await page.getByRole('link',{name:'Follow the signal',exact:true}).click();
 await expect(page.locator('.ocean-stage.is-signal-ready')).toBeVisible();
 for(const id of [2,8,9])await switchStyle(id);
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','signal');
 await page.setViewportSize({width:390,height:844});
 for(const id of [1,4,9])await switchStyle(id);
 expect(errors).toEqual([]);
});

test('the console command persists selection, works before 3D loads and rejects invalid input',async({page})=>{
 await page.goto('/about');
 expect((await page.evaluate(()=>window.oceanStyle(4))).name).toBe('Fine ripples');
 await page.goto('/');
 const canvas=page.locator('.ocean-hero canvas');
 await expect(canvas).toHaveAttribute('data-ocean-style','4');
 await page.reload();
 await expect(canvas).toHaveAttribute('data-ocean-style','4');
 const rejected=await page.evaluate(()=>{
  const values:unknown[]=[0,10,-1,1.5,NaN,Infinity,'2',null,undefined];
  return values.map(value=>{try{(window.oceanStyle as (value:unknown)=>unknown)(value);return false}catch(error){return error instanceof RangeError}});
 });
 expect(rejected).toEqual(Array(9).fill(true));
 await expect(canvas).toHaveAttribute('data-ocean-style','4');
 expect(await page.evaluate(()=>localStorage.getItem('aquanode:ocean-style'))).toBe('4');
 await page.evaluate(()=>{for(const id of [1,9,3,8,2,9])window.oceanStyle(id)});
 await expect(canvas).toHaveAttribute('data-ocean-style','9');
 await page.reload();
 await expect(canvas).toHaveAttribute('data-ocean-style','9');
});

test('invalid saved values and unavailable storage keep the command usable',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('aquanode:ocean-style','broken');
  Storage.prototype.setItem=()=>{throw new DOMException('Storage unavailable','SecurityError')};
 });
 await page.goto('/');
 const canvas=page.locator('.ocean-hero canvas');
 await expect(canvas).toHaveAttribute('data-ocean-style','9');
 await page.evaluate(()=>window.oceanStyle(3));
 await expect(canvas).toHaveAttribute('data-ocean-style','3');
});
