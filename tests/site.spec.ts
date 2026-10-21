import {test,expect} from '@playwright/test';
test('all routes, resource downloads and audio controls',async({page,request})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/about','/technology','/build','/journal','/team']){await page.goto(path);await expect(page.locator('h1')).toBeVisible();await expect(page).toHaveTitle(/AquaNode/);}
 await page.goto('/build');for(const href of await page.locator('a[download]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')!))){const result=await request.get(href);expect(result.status()).toBe(200);expect((await result.body()).length).toBeGreaterThan(100)}
 const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:/Assembly drawing/}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('Assembly.svg');
 await expect(page.getByRole('button',{name:'≈ Sound off'})).toHaveAttribute('aria-pressed','false');await page.getByRole('button',{name:'≈ Sound off'}).click();await expect(page.getByRole('button',{name:'Ⅱ Sound on'})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Ⅱ Sound on'}).click();await expect(page.getByRole('button',{name:'≈ Sound off'})).toHaveAttribute('aria-pressed','false');expect(errors).toEqual([]);
});
test('mobile navigation and no horizontal overflow',async({page})=>{await page.setViewportSize({width:390,height:844});for(const path of ['/','/about','/technology','/build','/journal','/team']){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}await page.getByRole('button',{name:'Menu +'}).click();await page.getByRole('link',{name:'The buoy',exact:true}).click();await expect(page).toHaveURL(/technology/);await page.goto('/');await page.locator('.evidence img').scrollIntoViewIfNeeded();await expect(page.locator('.evidence img')).toHaveJSProperty('complete',true);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'test-results/mobile.png',fullPage:true});});
test('reduced motion keeps model descriptions accessible',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/technology');await expect(page.locator('canvas')).toHaveCount(0);await page.getByRole('button',{name:'03 Water probes'}).click();await expect(page.locator('.part-description')).toContainText('pH and temperature');await page.keyboard.press('Tab');});
test('WebGL fallback and 3D keyboard controls',async({page})=>{await page.goto('/technology');await expect(page.locator('canvas')).toBeVisible();await page.getByRole('button',{name:'Rotate buoy right'}).click();await page.getByRole('button',{name:'Separate parts'}).click();await expect(page.getByRole('button',{name:'Close structure'})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(page.getByRole('button',{name:'Separate parts'})).toHaveAttribute('aria-pressed','false');await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:any[]){if(type.includes('webgl'))return null;return original.call(this,type,...args)} as typeof original});await page.reload();await expect(page.locator('canvas')).toHaveCount(0);await expect(page.getByText(/Static view for reduced motion/)).toBeVisible();});
test('desktop overview renders',async({page})=>{await page.setViewportSize({width:1440,height:1000});await page.goto('/');await expect(page.locator('canvas').first()).toBeVisible();await page.locator('.evidence img').scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('.evidence img').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'test-results/desktop.png',fullPage:true});});

test('overview fits small phones and tablets and has a static hero',async({page})=>{
 const renderErrors:string[]=[];
 page.on('console',message=>{if(message.type()==='error'&&/THREE|shader|WebGL/i.test(message.text()))renderErrors.push(message.text())});
 for(const width of [320,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  await expect(page.locator('.hero .scene-live[data-ready=true]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  await expect(page.getByRole('link',{name:'What is this? Discover AquaNode'})).toBeVisible();
  await page.screenshot({path:`test-results/overview-${width}.png`,animations:'disabled'});
  await page.getByRole('link',{name:'Scroll to explore AquaNode'}).click();
  await expect(page).toHaveURL(/#progress$/);
  await expect(page.getByRole('heading',{name:'The first node is working.'})).toBeInViewport();
 }
 expect(renderErrors).toEqual([]);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await expect(page.locator('canvas')).toHaveCount(0);
 await expect(page.locator('.hero .buoy-drawing')).toBeVisible();
 await page.getByRole('link',{name:'What is this? Discover AquaNode'}).click();
 await expect(page).toHaveURL(/#progress$/);
});


test('ocean label appears after a second and the scene animates',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 const start=new Date('2026-10-21T00:00:00Z');
 await page.clock.install({time:start});
 await page.clock.pauseAt(new Date(start.getTime()+1000));
 await page.goto('/');
 await expect(page.locator('.ocean-hero')).toBeVisible();
 const annotation=page.getByRole('link',{name:'What is this? Discover AquaNode'});
 await expect(annotation).not.toBeVisible();
 await page.clock.runFor(999);
 await expect(annotation).not.toBeVisible();
 await page.clock.runFor(1);
 await expect(annotation).toBeVisible();
 await expect(page.locator('canvas')).toHaveCount(0);
 await page.clock.resume();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(page.locator('.ocean-hero .scene-live[data-ready=true]')).toBeVisible();
 const canvas=page.locator('.ocean-hero canvas');
 const firstFrame=await canvas.screenshot();
 await page.waitForTimeout(600);
 const secondFrame=await canvas.screenshot();
 expect(firstFrame.equals(secondFrame)).toBe(false);
 const viewport=page.viewportSize()!;
 const bounds=await page.locator('.ocean-hero').boundingBox();
 expect(bounds?.y).toBe(0);
 expect(bounds?.height).toBe(viewport.height);
 await expect(page.getByRole('link',{name:'Scroll to explore AquaNode'})).toBeInViewport();
 await page.setViewportSize({width:844,height:390});
 const landscape=await page.locator('.ocean-hero').boundingBox();
 expect(landscape?.height).toBe(390);
 await expect(page.getByRole('link',{name:'Scroll to explore AquaNode'})).toBeInViewport();
});

test('ocean loads behind a dark screen before revealing the scene',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 let releaseScene!:()=>void;
 const sceneGate=new Promise<void>(resolve=>{releaseScene=resolve});
 await page.route('**/src/Scene.tsx*',async route=>{await sceneGate;await route.continue()});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 try{
  await expect(page.getByText('LOADING THE OCEAN',{exact:true})).toBeVisible();
  await expect(page.locator('.ocean-hero .buoy-drawing')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'What is this? Discover AquaNode'})).not.toBeVisible();
  await expect(page.getByRole('link',{name:'Scroll to explore AquaNode'})).not.toBeVisible();
  await page.screenshot({path:'test-results/ocean-loading.png'});
 }finally{releaseScene()}
 await expect(page.locator('.ocean-hero .scene-live[data-ready=true]')).toBeVisible();
 await expect(page.locator('.ocean-loading-screen')).not.toBeVisible();
 await expect(page.getByRole('link',{name:'What is this? Discover AquaNode'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Scroll to explore AquaNode'})).toBeVisible();
 await expect(page.locator('.ocean-hero .buoy-drawing')).toHaveCount(0);
 await page.screenshot({path:'test-results/ocean-revealed.png',animations:'disabled'});
});

test('a failed 3D download does not leave the opening stuck loading',async({page})=>{
 await page.route('**/src/Scene.tsx*',route=>route.abort());
 await page.goto('/');
 await expect(page.locator('.ocean-hero')).toHaveAttribute('data-scene-state','static');
 await expect(page.locator('.ocean-loading-screen')).not.toBeVisible();
 await expect(page.locator('.ocean-hero .buoy-drawing')).toBeVisible();
 await expect(page.getByRole('link',{name:'Scroll to explore AquaNode'})).toBeVisible();
});
