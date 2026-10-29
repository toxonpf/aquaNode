import {test,expect} from '@playwright/test';

test('the current footer page is highlighted without underlining its number or label',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/about');
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  const current=page.locator('.footer-directory nav a[aria-current=page]');
  await current.scrollIntoViewIfNeeded();
  await expect(current).toHaveAttribute('href','/about');
  await expect(current).toHaveCSS('text-decoration-line','none');
  await expect(current.locator('.footer-nav-label')).toHaveCSS('text-decoration-line','none');
  await expect(current.locator('.footer-nav-number')).toHaveCSS('text-decoration-line','none');
  await expect(current).toHaveCSS('color','rgb(230, 245, 181)');
  const other=page.locator('.footer-directory nav a[href="/build"]');
  expect(await current.evaluate(node=>getComputedStyle(node).color)).not.toBe(await other.evaluate(node=>getComputedStyle(node).color));
 }
});

test('footer navigation preserves the number, wrapped label and arrow during the page transition',async({page})=>{
 test.setTimeout(60000);
 for(const locale of ['ru','en'])for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  await page.addInitScript(locale=>localStorage.setItem('aquanode.locale',locale),locale);
  await page.goto('/about');
  const link=page.locator('.footer-directory nav a[href="/build"]');
  await link.scrollIntoViewIfNeeded();
  await link.hover();
  await page.evaluate(()=>document.fonts.ready);
  const before=await link.evaluate(node=>[node,...node.children].map(element=>{
   const bounds=element.getBoundingClientRect();
   return {x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height};
  }));
  // Inspect synchronously during click capture, before the source route unmounts.
  await page.evaluate(()=>{
   document.addEventListener('click',()=>{
    const copy=document.querySelector('[data-retained-navigation]');
    (window as any).retainedFooter=copy?[copy,...copy.children].map(element=>{
     const bounds=element.getBoundingClientRect();
     return {x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height};
    }):null;
   },{capture:true,once:true});
  });
  await link.click();
  const after=await page.evaluate(()=>(window as any).retainedFooter as typeof before|null);
  expect(after,`${locale} ${width}: retained link`).not.toBeNull();
  expect(after).toHaveLength(before.length);
  for(let index=0;index<before.length;index++)for(const property of ['x','y','width','height'] as const){
   expect(after![index][property],`${locale} ${width}: item ${index} ${property}`).toBeCloseTo(before[index][property],0);
  }
  await expect(page.locator('main .build-page')).toBeVisible();
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await expect(page.locator('[data-retained-navigation]')).toHaveCount(0);
 }
});
