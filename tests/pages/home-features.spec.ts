import {test,expect} from '@playwright/test';

test('home keeps earlier results and shows OCA development without a map',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('.status-grid article')).toHaveCount(3);
 await expect(page.locator('.surface-project-copy')).toContainText('creating a second buoy version together with OCA');
 await expect(page.locator('.map-embed,.atlas-map,.future-atlas')).toHaveCount(0);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('internal arrows smoothly strengthen on hover after shortening the About page',async({page})=>{
 await page.goto('/about');
 const button=page.locator('.about-idea .arrow-link'),line=button.locator('.flexible-arrow-line');
 await button.scrollIntoViewIfNeeded();await page.mouse.move(5,400);
 const strength=()=>line.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d);
 await expect(line).toHaveCSS('animation-name','flexible-arrow-snake');
 await expect.poll(strength).toBeCloseTo(.6,2);
 await button.hover();await expect.poll(strength).toBeCloseTo(1,2);
 await page.mouse.move(5,400);await expect.poll(strength).toBeCloseTo(.6,2);
});

test('the retained technology model selects parts and resets the structure',async({page})=>{
 await page.goto('/technology');
 const model=page.locator('.tech-model');
 await expect(model.locator('.viewer')).toHaveAttribute('data-scene-state',/ready|static/,{timeout:20000});
 await model.locator('.part-tabs button').nth(1).click();
 await expect(model.locator('.part-tabs button').nth(1)).toHaveAttribute('aria-pressed','true');
 const separate=model.getByRole('button',{name:'Separate parts',exact:true});
 if(await separate.isEnabled()){
  await separate.click();await expect(model.getByRole('button',{name:'Close structure',exact:true})).toHaveAttribute('aria-pressed','true');
  await model.getByRole('button',{name:'Reset',exact:true}).click();
  await expect(separate).toHaveAttribute('aria-pressed','false');
 }
});
