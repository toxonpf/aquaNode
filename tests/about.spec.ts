import {test,expect} from '@playwright/test';

test('about explains the project without repeating the model, sensors or status grid',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/about');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Understanding starts with observing.');
 await expect(page.locator('.about-page .buoy-drawing,.about-page canvas,.about-page .status-grid')).toHaveCount(0);
 await page.getByRole('button',{name:'02 Build'}).scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'02 Build'}).click();
 await expect(page.getByRole('button',{name:'02 Build'})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#learning-detail')).toContainText('Make the process visible.');
 await expect(page.locator('.learning-drawing img')).toHaveJSProperty('complete',true);
 expect(await page.locator('.learning-drawing img').evaluate((node:HTMLImageElement)=>node.naturalWidth)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'03 Reflect'}).click();
 await expect(page.locator('#learning-detail')).toContainText('Leave a useful record.');
 await expect(page.locator('.learning-notebook')).toContainText('The next attempt');
 await expect(page.locator('.learning-footer a')).toHaveAttribute('href','/journal');
 expect(errors).toEqual([]);
});

test('about fits desktop, tablet and phones and honours reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/about');
 for(const width of [1920,1440,1024,768,390,320]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('.learning-stage-content').evaluate(node=>getComputedStyle(node).animationName)).toBe('none');
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'test-results/about-desktop.png',fullPage:true});
 await page.locator('.learning-lab').screenshot({path:'test-results/learning-desktop.png'});
 await page.getByRole('button',{name:'02 Build'}).click();
 await page.locator('.learning-lab').screenshot({path:'test-results/learning-build.png'});
 await page.getByRole('button',{name:'03 Reflect'}).click();
 await page.locator('.learning-lab').screenshot({path:'test-results/learning-reflect.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/about-mobile.png',fullPage:true});
 await page.locator('.learning-lab').screenshot({path:'test-results/learning-mobile.png'});
});

test('technology and journal offer distinct R0.3 details',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/technology');
 await expect(page.locator('.specs')).toContainText('80 × 60 mm');
 await expect(page.locator('.specs')).toContainText('DS18B20');
 await expect(page.getByRole('heading',{name:'The observation cycle.'})).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Four paths through the board.'})).toBeAttached();
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('/journal');
 await expect(page.locator('.journal')).toContainText('130 named pads');
 await expect(page.locator('.journal')).toContainText('71 ground stitching vias');
});
