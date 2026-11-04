import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
 await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
});
test('ocean buttons have spacing and every chapter label has an unfaded reading area',async({page})=>{
 await page.goto('/');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  for(const [id,shot] of [['buoy-intro','detail'],['buoy-sensors','sensing'],['buoy-inside','inside'],['buoy-signal','signal']]){
   await page.locator(`.ocean-chapters a[href="#${id}"]`).click();
   await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot',shot);
   const reader=page.locator(`[data-reader="${shot}"]`);
   expect(await reader.locator('.story-scroll').evaluate(node=>getComputedStyle(node).maskImage)).toBe('none');
   await expect(reader.locator('.kicker')).toBeInViewport();
   if(shot==='detail'){
    const links=reader.locator('.buoy-copy>.arrow-link');
    const first=await links.nth(0).boundingBox(),second=await links.nth(1).boundingBox();
    expect(second!.y-first!.y-first!.height).toBeGreaterThanOrEqual(16);
   }
   await reader.screenshot({path:`test-results/refined-${width}-ocean-${shot}.png`});
  }
 }
});
test('reworked sections carry content and compact navigation in three layouts',async({page})=>{
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:900});
  for(const [route,selectors] of [
   ['/', ['.results-heading','#why','.related-links']],
   ['/about',['.related-links']],
   ['/team',['.team-outro']],
   ['/journal',['.journal-hero']],
   ['/technology',['.existing-devices','.related-links']],
   ['/build',['.build-equipment-intro','.related-links']],
  ] as const){
   await page.goto(route);
   for(const selector of selectors){
    const section=page.locator(selector);await section.scrollIntoViewIfNeeded();await expect(section).toBeVisible();
    await section.screenshot({path:`test-results/refined-${width}-${route.slice(1)||'home'}-${selector.replace(/[^a-z]/g,'')}.png`});
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(route==='/')await expect(page.locator('.workflow-steps li')).toHaveCount(3);
   if(route==='/journal'){
    await expect(page.locator('.journal-latest>a')).toHaveCount(2);
    await page.locator('.journal-latest a[href="#historical-r03"]').click();
    await expect(page.locator('#historical-r03 h3')).toBeInViewport();
   }
   if(route==='/technology')await expect(page.locator('.device-evidence img')).toBeVisible();
   if(route==='/build')await expect(page.locator('.bench-chain>span')).toHaveCount(3);
  }
 }
});
