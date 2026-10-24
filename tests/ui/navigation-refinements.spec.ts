import {test,expect} from '@playwright/test';

test('current-page header links return to the top without remounting the page',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [path,label] of [['/about','The project'],['/technology','The buoy'],['/build','Build & resources'],['/journal','Journal'],['/team','The team']]){
  await page.goto(path);
  const main=await page.locator('main').elementHandle();
  await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(100);
  await page.locator('.site-header nav').getByRole('link',{name:label,exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  expect(await main!.evaluate(node=>node.isConnected)).toBe(true);
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto('/about');
 await page.evaluate(()=>scrollTo({top:700,behavior:'instant'}));
 await page.getByRole('button',{name:'Menu +'}).click();
 await page.locator('.site-header nav').getByRole('link',{name:'The project',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 await expect(page.getByRole('button',{name:'Menu +'})).toHaveAttribute('aria-expanded','false');
});

test('skip leaves the story and the home logo returns directly to the surface',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'See inside the buoy',exact:true}).click();
 await expect(page.locator('.ocean-stage.is-inside-ready')).toBeVisible();
 const canvas=await page.locator('.ocean-hero canvas').elementHandle();
 await page.getByRole('link',{name:'Skip buoy story',exact:true}).click();
 await expect.poll(()=>page.locator('.award').evaluate(node=>Math.round(node.getBoundingClientRect().top))).toBe(64);
 await expect(page.locator('.site-header')).toHaveClass(/is-solid/);
 await page.evaluate(()=>{
  (window as any).homeShots=[];
  new MutationObserver(()=>{(window as any).homeShots.push(document.querySelector('.ocean-stage')?.getAttribute('data-shot'))})
   .observe(document.querySelector('.ocean-stage')!,{attributes:true,attributeFilter:['data-shot']});
 });
 await page.getByRole('banner').getByRole('link',{name:'AquaNode home',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','surface');
 expect(await page.evaluate(()=>(window as any).homeShots.every((shot:string)=>shot==='surface'))).toBe(true);
 expect(await canvas!.evaluate(node=>node.isConnected)).toBe(true);
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 expect(errors).toEqual([]);
});

test('skip fits phones and the active Overview link resets the story',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});await page.goto('/');
  await expect(page.getByRole('link',{name:'Skip buoy story',exact:true})).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('link',{name:'Skip buoy story',exact:true}).focus();await page.keyboard.press('Enter');
  await expect.poll(()=>page.locator('.award').evaluate(node=>Math.round(node.getBoundingClientRect().top))).toBe(56);
  await page.getByRole('button',{name:'Menu +'}).click();
  await page.locator('.site-header nav').getByRole('link',{name:'Overview',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','surface');
 }
});

test('continued fast scrolling advances only after the text really reaches its end',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
 const stage=page.locator('.ocean-stage'),panel=page.locator('[data-reader=detail]'),reader=panel.locator('[data-story-scroll]');
 await expect(page.locator('.buoy-introduction')).toHaveCSS('opacity','1');await page.waitForTimeout(150);
 await reader.evaluate(node=>{node.scrollTop=node.scrollHeight-node.clientHeight-4});
 await expect(panel).toHaveAttribute('data-at-end','false');
 await expect(panel.locator('.story-reading-status')).not.toContainText('100%');
 await reader.evaluate(node=>{node.scrollTop=node.scrollHeight-node.clientHeight-420});
 await page.evaluate(()=>{
  (window as any).readingAtAdvance=[];
  new MutationObserver(()=>{
   if(document.querySelector('.ocean-stage')?.getAttribute('data-shot')==='sensing'){
    const reader=document.querySelector<HTMLElement>('[data-reader=detail] [data-story-scroll]')!;
    (window as any).readingAtAdvance.push(reader.scrollHeight-reader.clientHeight-reader.scrollTop);
   }
  }).observe(document.querySelector('.ocean-stage')!,{attributes:true,attributeFilter:['data-shot']});
 });
 await page.mouse.move(250,450);
 for(let i=0;i<24;i++){await page.mouse.wheel(0,120);await page.waitForTimeout(45)}
 await expect(stage).toHaveAttribute('data-shot','sensing');
 const remaining=await page.evaluate(()=>(window as any).readingAtAdvance as number[]);
 expect(remaining.length).toBeGreaterThan(0);expect(remaining.every(value=>value<=.5)).toBe(true);
});

test('scrolling during a transition leaves the new reader at zero until new input',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
 const stage=page.locator('.ocean-stage'),detail=page.locator('[data-reader=detail] [data-story-scroll]');
 await expect(page.locator('.buoy-introduction')).toHaveCSS('opacity','1');
 await detail.evaluate(node=>{node.scrollTop=node.scrollHeight});
 await page.mouse.move(250,450);await page.mouse.wheel(0,900);
 await expect(stage).toHaveAttribute('data-shot','sensing');
 // Input during the camera move must never be replayed into the new reader.
 for(let i=0;i<4;i++){await page.mouse.wheel(0,150);await page.waitForTimeout(45)}
 const sensing=page.locator('[data-reader=sensing] [data-story-scroll]');
 await expect(page.locator('.sensor-introduction')).toHaveCSS('opacity','1');
 await page.waitForTimeout(350);
 expect(await sensing.evaluate(node=>node.scrollTop)).toBe(0);
 await expect(page.locator('[data-reader=sensing] .story-reading-status')).toContainText('0%');
 await page.mouse.wheel(0,150);
 await expect.poll(()=>sensing.evaluate(node=>node.scrollTop)).toBeGreaterThan(20);
 await expect(stage).toHaveAttribute('data-shot','sensing');
});

test('a continued gesture can read and leave the next chapter after its transition finishes',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
 const stage=page.locator('.ocean-stage'),detail=page.locator('[data-reader=detail] [data-story-scroll]');
 await expect(page.locator('.buoy-introduction')).toHaveCSS('opacity','1');
 await detail.evaluate(node=>{node.scrollTop=node.scrollHeight});
 await page.evaluate(()=>{
  (window as any).sensingRemainingAtAdvance=[];
  new MutationObserver(()=>{
   if(document.querySelector('.ocean-stage')?.getAttribute('data-shot')==='inside'){
    const reader=document.querySelector<HTMLElement>('[data-reader=sensing] [data-story-scroll]')!;
    (window as any).sensingRemainingAtAdvance.push(reader.scrollHeight-reader.clientHeight-reader.scrollTop);
   }
  }).observe(document.querySelector('.ocean-stage')!,{attributes:true,attributeFilter:['data-shot']});
 });
 await page.mouse.move(250,450);await page.mouse.wheel(0,900);
 // Ignore input during the transition, then accept ongoing scrolling
 // without requiring a pause before reading the new chapter.
 for(let i=0;i<70&&await stage.getAttribute('data-shot')!=='inside';i++){
  await page.mouse.wheel(0,150);await page.waitForTimeout(65);
 }
 await expect(stage).toHaveAttribute('data-shot','inside');
 const remaining=await page.evaluate(()=>(window as any).sensingRemainingAtAdvance as number[]);
 expect(remaining.length).toBeGreaterThan(0);expect(remaining.every(value=>value<=.5)).toBe(true);
});

for(const reducedMotion of ['no-preference','reduce'] as const){
 for(const sign of [-1,1]){
  test(`one reading swipe and its momentum stay in the chapter (${sign}, ${reducedMotion})`,async({page})=>{
   await page.emulateMedia({reducedMotion});
   await page.setViewportSize({width:1440,height:1000});await page.goto('/');
   await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
   await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
   const stage=page.locator('.ocean-stage'),reader=page.locator('[data-reader=detail] [data-story-scroll]');
   await expect(page.locator('.buoy-introduction')).toHaveCSS('opacity','1');
   await page.waitForTimeout(350);
   await reader.evaluate(node=>{node.scrollTop=(node.scrollHeight-node.clientHeight)/2});
   await page.mouse.move(250,450);
   await page.mouse.wheel(0,sign*2400);
   for(const delta of [800,400,200,100,50,24,12]){
    await page.waitForTimeout(70);await page.mouse.wheel(0,sign*delta);
   }
   await page.waitForTimeout(400);
   await expect(stage).toHaveAttribute('data-shot','detail');
   expect(await reader.evaluate((node,sign)=>sign>0?node.scrollHeight-node.clientHeight-node.scrollTop:node.scrollTop,sign)).toBeLessThanOrEqual(.5);
   // A fresh gesture at the boundary is accepted immediately.
   await page.mouse.wheel(0,sign*120);
   await expect(stage).toHaveAttribute('data-shot',sign>0?'sensing':'surface');
  });
 }
}

test('loading waves animate independently of the logo lettering',async({page})=>{
 let release!:()=>void;const held=new Promise<void>(resolve=>{release=resolve});
 await page.route('**/src/features/ocean/scene/Scene.tsx*',async route=>{await held;await route.continue()});
 await page.goto('/about');
 await page.locator('.site-header nav').getByRole('link',{name:'The buoy',exact:true}).click();
 const curtain=page.locator('.page-curtain'),wave=curtain.locator('svg path[stroke]').first(),letters=curtain.locator('svg path').first(),headerWave=page.locator('.site-header .logo svg path[stroke]').first();
 try{
  await expect(curtain).toHaveAttribute('data-phase','loading');
  const before=await wave.getAttribute('d'),wordmark=await letters.getAttribute('d'),headerBefore=await headerWave.getAttribute('d');
  await page.waitForTimeout(650);expect(await wave.getAttribute('d')).not.toBe(before);expect(await letters.getAttribute('d')).toBe(wordmark);expect(await headerWave.getAttribute('d')).toBe(headerBefore);
  const source=await page.evaluate(async()=>new DOMParser().parseFromString(await(await fetch('/src/assets/logo.svg')).text(),'image/svg+xml').querySelector('path[stroke]')!.getAttribute('d'));
  const crests:number[]=[];
  const endpoints:{x:number;y:number}[][]=[];
  for(let frame=0;frame<5;frame++){
   const geometry=await wave.evaluate((path,source)=>{
    const shape=path as SVGPathElement,length=shape.getTotalLength();
    const ends=[shape.getPointAtLength(0),shape.getPointAtLength(length)].sort((a,b)=>a.x-b.x);
    const reference=shape.cloneNode() as SVGPathElement;reference.setAttribute('d',source!);
    const referenceLength=reference.getTotalLength();
    const [left,right]=[reference.getPointAtLength(0),reference.getPointAtLength(referenceLength)].sort((a,b)=>a.x-b.x);
    const profile=(curve:SVGPathElement)=>{
     const length=curve.getTotalLength(),points=Array.from({length:1025},(_,i)=>curve.getPointAtLength(length*i/1024)).sort((a,b)=>a.x-b.x);
     let cursor=0;
     return Array.from({length:256},(_,i)=>{
      const u=i/256,x=left.x+(right.x-left.x)*u;
      while(cursor<points.length-2&&points[cursor+1].x<x)cursor++;
      const a=points[cursor],b=points[cursor+1];
      return a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x||1)-left.y-(right.y-left.y)*u;
     });
    };
    const original=profile(reference),moving=profile(shape);
    const errors=original.map((_,shift)=>Math.sqrt(moving.reduce((sum,value,i)=>sum+(value-original[(i+shift)%256])**2,0)/256));
    const range=(values:number[])=>Math.max(...values)-Math.min(...values);
    const crestX=left.x+(right.x-left.x)*moving.indexOf(Math.min(...moving))/256;
    return {crestX,error:Math.min(...errors),rangeRatio:range(moving)/range(original),ends:ends.map(point=>({x:point.x,y:point.y}))};
   },source);
   // Translating the source crest must preserve its shape and height, rather
   // than replacing the distinctive asymmetric mark with a generic sine wave.
   expect(geometry.error).toBeLessThan(2);
   expect(geometry.rangeRatio).toBeGreaterThan(.95);expect(geometry.rangeRatio).toBeLessThan(1.05);
   crests.push(geometry.crestX);endpoints.push(geometry.ends);
   await page.waitForTimeout(200);
  }
  // The main crest moves along the line, rather than merely wobbling in place.
  expect(Math.max(...crests)-Math.min(...crests)).toBeGreaterThan(35);
  expect(crests.slice(1).filter((x,index)=>x>crests[index]+5).length).toBeGreaterThanOrEqual(2);
  for(const ends of endpoints)for(let i=0;i<2;i++){
   expect(ends[i].x).toBeCloseTo(endpoints[0][i].x,2);
  }
  expect(await letters.getAttribute('d')).toBe(wordmark);
  await page.emulateMedia({reducedMotion:'reduce'});
  const calm=source;
  await expect(wave).toHaveAttribute('d',calm!);await page.waitForTimeout(150);expect(await wave.getAttribute('d')).toBe(calm);
 }finally{release()}
});
