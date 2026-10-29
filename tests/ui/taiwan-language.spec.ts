import {test,expect} from '@playwright/test';
import {chooseLanguage} from '../helpers/language';

test.use({reducedMotion:'reduce'});
test('Taiwan language is live, persistent and covers each page without overflow',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/build');
 await page.evaluate(()=>{(window as any).__main=document.querySelector('main')});
 let navigations=0;page.on('request',r=>{if(r.isNavigationRequest())navigations++});
 await chooseLanguage(page,'繁體中文');
 await expect(page.locator('html')).toHaveAttribute('lang','zh-TW');
 expect(await page.evaluate(()=>document.querySelector('main')===(window as any).__main)).toBe(true);
 expect(navigations).toBe(0);
 await expect(page.locator('.build-download-list a').first()).toHaveAttribute('href','/resources/ec-revb/copy_zh-TW.md');
 await expect(page.locator('#build-drawing img')).toHaveAttribute('src','/assets/engineering/ec-revb-architecture-zh-TW.svg');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','zh-TW');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['/about','/technology','/build','/journal','/team','/map','/']){
  await page.goto(route);
  await expect(page.locator('h1').first()).toContainText(/[\u3400-\u9fff]/);
  for(const [width,height] of [[1440,900],[1093,614],[768,1024],[390,844],[320,568]]){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>document.fonts.ready);
   const reading=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,ru:[...document.querySelectorAll('main h1,main h2,main h3,main p,main button')].filter(n=>n.getBoundingClientRect().width&&/[А-Яа-яЁё]/.test(n.textContent||'')).map(n=>n.textContent?.slice(0,100))}));
   expect.soft(reading,route+' '+width).toEqual({overflow:0,ru:[]});
  }
 }
 expect(errors).toEqual([]);
});

test('language dropdown supports keyboard, mobile placement and footer selection',async({page})=>{
 await page.goto('/build');
 const header=page.locator('.site-header .language-switch'),trigger=header.locator('.language-trigger');
 await trigger.focus();await page.keyboard.press('ArrowDown');
 await expect(header.getByRole('menuitemradio',{name:'English',exact:true})).toBeFocused();
 await page.keyboard.press('End');await expect(header.getByRole('menuitemradio',{name:'繁體中文',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('html')).toHaveAttribute('lang','zh-TW');
 await trigger.click();await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await expect(trigger).toHaveAttribute('aria-expanded','false');
 await page.setViewportSize({width:320,height:568});await trigger.click();
 let box=(await header.getByRole('menu').boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(320);expect(box.y+box.height).toBeLessThanOrEqual(568);
 await page.keyboard.press('Escape');
 const footer=page.locator('.site-footer .language-switch');await footer.scrollIntoViewIfNeeded();
 await footer.locator('.language-trigger').click();
 await expect(footer).toHaveAttribute('data-side','top');
 await footer.getByRole('menuitemradio',{name:'Русский',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','ru');
});

test('redrawn diagrams load in every language and equipment uses the content right edge',async({page,request})=>{
 for(const lang of ['en','ru','zh-TW'])for(const suffix of ['','-mobile']){
  const asset=await request.get(`/assets/engineering/ec-revb-architecture-${lang}${suffix}.svg`);expect(asset.ok()).toBe(true);expect(await asset.text()).toContain('<svg');
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto('/build');
 await page.locator('.build-equipment').scrollIntoViewIfNeeded();
 const layout=await page.locator('.build-equipment-layout').boundingBox(),list=await page.locator('.build-equipment-list').boundingBox();
 expect(Math.abs(layout!.x+layout!.width-list!.x-list!.width)).toBeLessThan(2);
 await page.screenshot({path:'test-results/equipment-desktop.png'});
 await page.locator('#build-drawing').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/architecture-desktop.png'});
 await chooseLanguage(page,'Русский');await page.setViewportSize({width:390,height:844});await page.locator('#build-drawing').scrollIntoViewIfNeeded();
 await expect.poll(()=>page.locator('#build-drawing img').evaluate(n=>(n as HTMLImageElement).currentSrc)).toContain('-ru-mobile.svg');
 await page.screenshot({path:'test-results/architecture-mobile-ru.png'});
 await chooseLanguage(page,'繁體中文');await page.locator('#build-drawing').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/architecture-mobile-zh.png'});
});
