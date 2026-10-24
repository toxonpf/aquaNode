import {test,expect} from '@playwright/test';

test('downloads have a distinct file treatment and deliver the original files',async({page,request})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/build');
 const cards=page.locator('a[download]');
 await expect(cards).toHaveCount(3);
 for(const card of await cards.all()){
  await expect(card).toHaveClass(/action-download/);
  await expect(card.locator('.download-link-icon')).toHaveCount(1);
  await expect(card.locator('.flexible-arrow')).toHaveCount(0);
  const response=await request.get((await card.getAttribute('href'))!);
  expect(response.status()).toBe(200);expect((await response.body()).length).toBeGreaterThan(100);
 }
 const downloadEvent=page.waitForEvent('download');
 await page.getByRole('link',{name:/Assembly drawing/}).click();
 expect((await downloadEvent).suggestedFilename()).toBe('Assembly.svg');
 await expect(page).toHaveURL(/\/build$/);
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await cards.first().screenshot({path:'test-results/download-card.png'});
 await page.goto('/technology');
 await expect(page.locator('a[download] .download-file')).toHaveText('SVG');
 const techDownload=page.waitForEvent('download');
 await page.getByRole('link',{name:/Assembly drawing/}).click();
 expect((await techDownload).suggestedFilename()).toBe('Assembly.svg');
});

test('outbound links differ from flowing internal navigation and fit phones',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/about','/team','/build','/technology']){
   await page.goto(route);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   for(const link of await page.locator('a[href^="https://"]').all()){
    await expect(link).toHaveAttribute('target','_blank');
    await expect(link.locator('.external-link-icon')).toHaveCount(1);
    await expect(link.locator('.flexible-arrow')).toHaveCount(0);
   }
  }
 }
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/about');
 const external=page.locator('.about-recognition .action-external');
 await expect(external.locator('.external-link-source')).toHaveText('EXTERNAL / thegeep.org');
 await external.screenshot({path:'test-results/external-link.png'});
 const navigation=page.locator('.about-next .arrow-link');
 await expect(navigation.locator('.flexible-arrow--up-right')).toHaveCount(1);
 await navigation.screenshot({path:'test-results/internal-link.png'});
 await navigation.click();
 await expect(page).toHaveURL(/\/team$/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('People behind the node.');
});
