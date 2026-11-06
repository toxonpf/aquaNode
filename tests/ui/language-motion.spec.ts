import {test,expect} from '@playwright/test';
import {chooseLanguage} from '../helpers/language';

test('language change hides old words before replacing them and plays the normal entrance',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/about');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active');
  const heading=page.locator('h1'),word=heading.locator('.heading-word').first();
  await expect(word).toHaveCSS('opacity','1');
  await page.evaluate(()=>{(window as any).__sameMain=document.querySelector('main')});
  let navigations=0;page.on('request',request=>{if(request.isNavigationRequest())navigations++});
  await chooseLanguage(page,'Русский');
  await expect(page.locator('html')).toHaveAttribute('data-locale-phase','leaving');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(heading).toHaveText('From the classroom to the shoreline.');
  await expect.poll(()=>word.evaluate(node=>parseFloat(getComputedStyle(node).opacity))).toBeLessThan(.95);
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(heading).toHaveText('Из класса — к берегу.');
  await expect(page.locator('html')).not.toHaveAttribute('data-locale-phase');
  await expect(heading.locator('.heading-word').last()).toHaveCSS('opacity','1');
  await expect(page.locator('.about-hero-copy>p')).toHaveCSS('opacity','1');
  expect(await page.evaluate(()=>document.querySelector('main')===(window as any).__sameMain)).toBe(true);
  expect(navigations).toBe(0);expect(errors).toEqual([]);
});

test('rapid requests keep the latest language and retain the mounted map and archive selection',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
  await page.goto('/map?region=taiwan');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active');
  await page.getByLabel('REFERENCE STATION',{exact:true}).selectOption('5127');
  await page.getByLabel('OBSERVATION PERIOD',{exact:true}).selectOption('2002-Q1');
  await page.evaluate(async()=>{
    (window as any).__sameMap=document.querySelector('.leaflet-container');
    const {changeLocale}=await import('/src/features/i18n/i18n.ts');
    const first=changeLocale('ru');changeLocale('zh-TW');await first;
  });
  await expect(page.locator('html')).toHaveAttribute('lang','zh-TW');
  await expect(page.locator('html')).not.toHaveAttribute('data-locale-phase');
  await expect(page.locator('.atlas-archive-controls select').first()).toHaveValue('5127');
  await expect(page.locator('.atlas-archive-controls select').last()).toHaveValue('2002-Q1');
  await expect(page.locator('.atlas-comparison select')).toHaveValue('2002-Q1');
  expect(await page.evaluate(()=>document.querySelector('.leaflet-container')===(window as any).__sameMap)).toBe(true);
});
