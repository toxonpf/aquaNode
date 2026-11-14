import {test,expect} from '@playwright/test';
import {chooseLanguage} from '../helpers/language';

for(const [language,lang] of [['English','en'],['Русский','ru'],['繁體中文','zh-TW']])test(`published pages end at OCA development and have no map or shipment claims: ${lang}`,async({page})=>{
  test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});
  const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/');await chooseLanguage(page,language);
  for(const route of ['/','/about','/technology','/build','/journal','/team']){
    await page.goto(route);await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang',lang);
    await expect(page.locator('.atlas-map,.map-embed,.atlas-workspace')).toHaveCount(0);
    await expect(page.locator('a[href^="/map"]')).toHaveCount(0);
    await expect(page.locator('.footer-directory nav a')).toHaveCount(6);
    const text=await page.locator('main').innerText();
    expect(text).not.toMatch(/We have sent buoys|Existing measurements and partner shipments|отправили буи|отправленные партнёрам|我們已寄送浮標/);
    if(['/', '/about','/technology','/journal'].includes(route))expect(text).toContain('OCA');
    if(route==='/journal'){
      await expect(page.locator('#oca-v2')).toContainText('OCA');
      await expect(page.locator('#journal-record time')).toHaveCount(3);
      await expect(page.locator('#journal-record time').last()).toHaveAttribute('datetime','2026-10-20');
      await expect(page.locator('#journal-entry-revc-checks')).toContainText('166');
      await expect(page.locator('#journal-entry-revc-checks')).toContainText('139');
    }
    if(route==='/about')await expect(page.locator('.about-certificate img')).toHaveAttribute('src',/geep-yic-2026-winner/);
    if(route==='/technology')await expect(page.locator('.device-price')).toContainText('$20');
  }
  expect(requests.some(url=>url.includes('tile.openstreetmap.org'))).toBe(false);
});

test('old map bookmarks redirect to the OCA milestone and public summaries correct the shipment history',async({page,request})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/map?buoy=HPU-002');
  await expect(page).toHaveURL('/journal#oca-v2');
  await expect(page.locator('#oca-v2')).toContainText('No buoys have been shipped');
  await expect(page.locator('.atlas-map,.map-embed')).toHaveCount(0);
  for(const locale of ['en','ru','zh-TW']){
    const response=await request.get(`/resources/ec-ph-revc/copy_${locale}.md`);
    expect(response.ok()).toBe(true);const copy=await response.text();
    expect(copy).toContain('OCA');expect(copy).not.toMatch(/and buoys sent to partners|и отправленные партнёрам буи|與寄送給夥伴的浮標/);
  }
});
