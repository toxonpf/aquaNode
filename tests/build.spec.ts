import {test,expect} from '@playwright/test';

test('build drawings and assembly navigation show the original engineering material',async({page})=>{
 await page.goto('/build');
 await expect(page.locator('h1')).toHaveText('Learn by putting it together.');
 await page.getByRole('button',{name:'Copper layout',exact:true}).click();
 await expect(page.locator('#build-drawing img')).toHaveAttribute('src','/assets/PCB_F.png');
 await page.getByRole('button',{name:'Assembly',exact:true}).click();
 await expect(page.locator('#build-drawing img')).toHaveAttribute('src','/assets/Assembly.png');
 await expect(page.locator('#build-step-content-0')).toBeVisible();
 await page.getByRole('navigation',{name:'Assembly steps'}).getByRole('link',{name:/06 Calibration/}).click();
 await expect(page.locator('#build-step-content-5')).toBeVisible();
 await expect(page.locator('#build-step-content-0')).toBeHidden();
 await expect(page.locator('#build-step-content-5')).toContainText('fresh reference buffers');
 await expect(page.locator('#step-5')).toBeInViewport();
 await expect.poll(()=>page.locator('#build-step-content-5>p').evaluate(node=>getComputedStyle(node).opacity)).toBe('1');
 const toggle=page.locator('#build-step-toggle-5');
 await toggle.focus();await page.keyboard.press('Enter');
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 await page.keyboard.press('Space');
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#build-step-content-5')).toBeVisible();
});

test('build fits small phones through large screens with all steps and downloads available',async({page,request})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/build');
 for(const width of [1920,1440,1024,768,390,320]){
  await page.setViewportSize({width,height:900});
  for(let index=0;index<7;index++){
   const toggle=page.locator(`#build-step-toggle-${index}`);
   if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
   await expect(page.locator(`#build-step-content-${index}`)).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Step ${index+1} at ${width}`).toBe(true);
  }
 }
 const downloads=page.locator('a[download]');
 await expect(downloads).toHaveCount(3);
 for(const link of await downloads.all()){
  const response=await request.get((await link.getAttribute('href'))!);
  expect(response.ok()).toBe(true);
  expect((await response.body()).length).toBeGreaterThan(100);
 }
});

test('assembly steps expand and collapse continuously like the node parts',async({page})=>{
 await page.goto('/build');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  const toggle=page.locator('#build-step-toggle-2');
  await toggle.scrollIntoViewIfNeeded();
  for(const opening of [true,false]){
   const heights=await toggle.evaluate(button=>{
    const reveal=button.closest('.build-step')!.querySelector('.build-step-reveal')!;
    return new Promise<number[]>(resolve=>{
     const samples=[reveal.getBoundingClientRect().height],start=performance.now();
     (button as HTMLButtonElement).click();
     const sample=()=>{
      samples.push(reveal.getBoundingClientRect().height);
      if(performance.now()-start<500)requestAnimationFrame(sample);else resolve(samples);
     };
     requestAnimationFrame(sample);
    });
   });
   const low=Math.min(...heights),high=Math.max(...heights);
   expect(high-low).toBeGreaterThan(50);
   expect(heights.some(height=>height>low+5&&height<high-5)).toBe(true);
   expect(heights.at(-1)!).toBeCloseTo(opening?high:0,0);
   await expect(toggle).toHaveAttribute('aria-expanded',String(opening));
   const reveal=page.locator('#step-2 .build-step-reveal');
   await expect(reveal).toHaveJSProperty('inert',!opening);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
});

test('guide anchors align the expanded step below the header after the layout settles',async({page})=>{
 for(const reducedMotion of ['no-preference','reduce'] as const){
  await page.emulateMedia({reducedMotion});
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.goto('/build');
   await page.evaluate(()=>document.fonts.ready);
   for(const index of [6,1,5,0]){
    await page.locator(`.build-guide-nav nav a[href="#step-${index}"]`).click();
    await expect(page.locator(`#build-step-toggle-${index}`)).toHaveAttribute('aria-expanded','true');
    await expect.poll(()=>page.locator(`#step-${index}`).evaluate(node=>{
     const header=document.querySelector('.site-header')!.getBoundingClientRect();
     return Math.abs(node.getBoundingClientRect().top-header.bottom-24);
    })).toBeLessThan(2);
    // Check the final position as well as the point crossed during scrolling.
    await page.waitForTimeout(150);
    expect(await page.locator(`#step-${index}`).evaluate(node=>
     Math.abs(node.getBoundingClientRect().top-document.querySelector('.site-header')!.getBoundingClientRect().bottom-24))).toBeLessThan(2);
    await expect(page).toHaveURL(new RegExp(`#step-${index}$`));
   }
  }
 }
});

test('direct step links and rapid selections keep the requested destination',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/build#step-5');
 await expect(page.locator('#build-step-toggle-5')).toHaveAttribute('aria-expanded','true');
 await expect.poll(()=>page.locator('#step-5').evaluate(node=>Math.abs(node.getBoundingClientRect().top-88))).toBeLessThan(2);
 const nav=page.getByRole('navigation',{name:'Assembly steps'});
 await nav.locator('a[href="#step-0"]').click();
 await nav.locator('a[href="#step-6"]').click();
 await expect(page.locator('#build-step-toggle-6')).toHaveAttribute('aria-expanded','true');
 await expect.poll(()=>page.locator('#step-6').evaluate(node=>Math.abs(node.getBoundingClientRect().top-88))).toBeLessThan(2);
 await page.waitForTimeout(200);
 await expect(page).toHaveURL(/#step-6$/);
 await page.goBack();
 await expect(page.locator('#build-step-toggle-0')).toHaveAttribute('aria-expanded','true');
 await expect.poll(()=>page.locator('#step-0').evaluate(node=>Math.abs(node.getBoundingClientRect().top-88))).toBeLessThan(2);
 await nav.locator('a[href="#step-4"]').click();
 await page.locator('.build-guide-nav>a[href="#downloads"]').click();
 await expect(page).toHaveURL(/#downloads$/);
 await expect.poll(()=>page.locator('#downloads').evaluate(node=>Math.abs(node.getBoundingClientRect().top-88))).toBeLessThan(2);
});
