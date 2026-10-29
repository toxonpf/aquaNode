import {chooseLanguage} from '../helpers/language';
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

test('technology pairs a large headline with the model and stacks them on mobile',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [1440,1024,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto('/technology');
    for(const language of ['Русский','English']){
      await chooseLanguage(page,language,'.site-header');
      await page.evaluate(()=>document.fonts.ready);
      await expect.poll(()=>page.locator('.tech-hero h1').evaluate(node=>{
        const scale=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;
        const font=parseFloat(getComputedStyle(node).fontSize)/scale;
        return font;
      })).toBeGreaterThanOrEqual(width>=1000?44:28);
      const title=await page.locator('.tech-hero h1').boundingBox(),layout=await page.locator('.tech-hero-layout').boundingBox(),model=await page.locator('.tech-model').boundingBox();
      const copy=await page.locator('.tech-hero-copy').boundingBox();
      if(width>=1000){
        expect(title!.x+title!.width).toBeLessThan(model!.x);
        expect(Math.abs(title!.y-model!.y)).toBeLessThan(2);
        expect(copy!.y-title!.y-title!.height).toBeLessThanOrEqual(30);
      }else{
        expect(title!.width).toBeGreaterThan(layout!.width*.8);
        expect(title!.y+title!.height).toBeLessThan(model!.y);
        expect(copy!.y).toBeGreaterThan(model!.y+model!.height);
      }
    }
  }
});
