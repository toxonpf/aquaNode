import {test,expect} from '@playwright/test';

test('about explains the project without repeating the model, sensors or status grid',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/about');
 await expect(page.getByRole('heading',{level:1})).toHaveText('From the classroom to the shoreline.');
 await expect(page.locator('.about-page .buoy-drawing,.about-page canvas,.about-page .status-grid')).toHaveCount(0);
 await expect(page.locator('.learning-journey-step')).toHaveCount(3);
 await expect(page.locator('.learning-lab button')).toHaveCount(0);
 await expect(page.locator('.learning-journey-step').nth(1)).toContainText('Take the lesson to the water.');
 await page.locator('.learning-reference--drawing').scrollIntoViewIfNeeded();
 await expect(page.locator('.learning-reference--drawing img')).toHaveJSProperty('complete',true);
 expect(await page.locator('.learning-reference--drawing img').evaluate((node:HTMLImageElement)=>node.naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('.learning-journey-step').last()).toContainText('Make the result useful.');
 await expect(page.locator('.learning-journey-step').last().locator('a')).toHaveAttribute('href','/journal');
 expect(errors).toEqual([]);
});

test('about fits desktop, tablet and phones and honours reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/about');
 for(const width of [1920,1440,1024,768,390,320]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.learning-journey-step')).toHaveCount(3);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'test-results/about-desktop.png',fullPage:true});
 await page.locator('.learning-lab').screenshot({path:'test-results/learning-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/about-mobile.png',fullPage:true});
 await page.locator('.learning-lab').screenshot({path:'test-results/learning-mobile.png'});
});

test('technology and journal offer current revision and historical evidence',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/technology');
 await expect(page.locator('.specs')).toContainText('SEN0244');
 await expect(page.locator('.specs')).toContainText('DS18B20');
 await expect(page.getByRole('heading',{name:'The observation cycle.'})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Connections with a purpose.'})).toBeAttached();
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('/journal');
 await expect(page.locator('.journal')).toContainText('155');
 await expect(page.locator('.journal')).toContainText('Historical');
});

test('the GEEP certificate has an optimised preview and an original download',async({page,request})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/about');
 const certificate=page.locator('.about-certificate');
 const preview=certificate.locator('img');await preview.scrollIntoViewIfNeeded();
 await expect(preview).toHaveJSProperty('complete',true);
 expect(await preview.evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBe(1600);
 await expect(preview).toHaveAttribute('src',/\.webp$/);
 const file=await request.get('/resources/awards/geep-yic-2026-winner.png');
 expect(file.status()).toBe(200);expect((await file.body()).subarray(1,4).toString()).toBe('PNG');
 const download=page.waitForEvent('download');
 await certificate.getByRole('link',{name:/Winner certificate/}).click();
 expect((await download).suggestedFilename()).toBe('geep-yic-2026-winner.png');
 for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.locator('.about-recognition').screenshot({path:`test-results/geep-certificate-${width}.png`});
 }
});
