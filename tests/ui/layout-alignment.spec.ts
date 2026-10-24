import {test,expect} from '@playwright/test';

test('footer navigation is centred and the network introduction follows its heading',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [1440,1024,900,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto('/');
    await page.evaluate(()=>document.fonts.ready);
    const nav=await page.locator('.footer-directory nav').boundingBox();
    expect(nav!.x+nav!.width/2).toBeCloseTo(width/2,0);
    const heading=await page.locator('.future-heading h2').boundingBox(),copy=await page.locator('.future-heading>p').boundingBox();
    expect(copy!.x).toBeCloseTo(heading!.x,0);
    expect(copy!.y).toBeGreaterThanOrEqual(heading!.y+heading!.height);
    expect(copy!.y-heading!.y-heading!.height).toBeLessThanOrEqual(26);
  }
});

test('technology has a large two-line headline across the hero',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [1440,1024,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto('/technology');
    for(const language of ['Русский','English']){
      await page.locator('.site-header').getByRole('button',{name:language,exact:true}).click();
      await page.evaluate(()=>document.fonts.ready);
      await expect.poll(()=>page.locator('.tech-hero h1').evaluate(node=>{
        const font=parseFloat(getComputedStyle(node).fontSize);
        return font;
      })).toBeGreaterThanOrEqual(width>=1000?60:28);
      const title=await page.locator('.tech-hero h1').boundingBox(),layout=await page.locator('.tech-hero-layout').boundingBox(),model=await page.locator('.tech-model').boundingBox();
      expect(title!.width).toBeGreaterThan(layout!.width*.8);
      expect(title!.y+title!.height).toBeLessThan(model!.y);
      const copy=await page.locator('.tech-hero-copy').boundingBox();
      expect(copy!.y-title!.y-title!.height).toBeLessThanOrEqual(36);
    }
  }
});
