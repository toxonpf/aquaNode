import {test,expect} from '@playwright/test';
import {chooseLanguage} from '../helpers/language';

for(const [name,lang] of [['Русский','ru'],['English','en'],['繁體中文','zh-TW']])test(`all seven pages have localized metadata and fit desktop and phone: ${lang}`,async({page})=>{
 test.setTimeout(60000);await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/',{waitUntil:'domcontentloaded'});await chooseLanguage(page,name);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/','/about','/technology','/build','/journal','/map','/team']){
   await page.goto(route,{waitUntil:'domcontentloaded'});await expect(page.locator('h1')).toBeVisible();
   await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('html')).toHaveAttribute('lang',lang);
   await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',await page.title());
   const description=await page.locator('meta[name="description"]').getAttribute('content');
   await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content',description!);
   expect(description).not.toMatch(/hardware validation is pending|испытания предстоят|硬體驗證尚待完成/);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),`${lang} ${route} ${width}`).toBeLessThanOrEqual(1);
   if(['/', '/about','/map'].includes(route))await expect(page.locator('.revision-notice')).toHaveCount(0);
   if(route==='/map')await expect(page.locator('.atlas-map')).toBeVisible();
   if(width!==320)await page.screenshot({path:`test-results/editorial-${lang}-${width}-${route.slice(1)||'home'}.png`});
  }
 }
 expect(errors).toEqual([]);
});

test('ocean chapters retain usable controls with shorter copy in every language',async({page})=>{
 test.setTimeout(60000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const language of ['English','Русский','繁體中文']){
  await page.goto('/');await chooseLanguage(page,language);
  await page.setViewportSize({width:390,height:844});
  for(const [id,shot] of [['buoy-intro','detail'],['buoy-sensors','sensing'],['buoy-inside','inside'],['buoy-signal','signal']]){
   await page.locator(`.ocean-chapters a[href="#${id}"]`).click();
   await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot',shot);
   await expect(page.locator(`[data-reader="${shot}"] h2`)).toBeInViewport();
   if(shot==='sensing'){
    for(const index of [0,1,2]){
     await page.locator('.sensor-picker button').nth(index).click();
     await expect(page.locator('.sensor-picker button').nth(index)).toHaveAttribute('aria-pressed','true');
    }
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
});

test('revision selector offers real earlier documents separately from revC summaries',async({page,request})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/build');
 await expect(page.locator('.build-download-list a[download]')).toHaveCount(5);
 await page.locator('.build-document-picker select').selectOption('r03');
 const downloads=page.locator('.build-download-list a[download]');await expect(downloads).toHaveCount(3);
 await expect(downloads.first()).toHaveAttribute('href','/resources/Assembly.svg');
 for(const link of await downloads.all()){
  const response=await request.get((await link.getAttribute('href'))!);expect(response.ok()).toBe(true);
  expect((await response.body()).length).toBeGreaterThan(100);
 }
 await page.locator('.build-document-picker select').selectOption('revc');
 await expect(page.locator('.build-download-list a[download]')).toHaveCount(5);
 await expect(page.locator('.build-download-note')).toContainText('fabrication files have not been released');
});
