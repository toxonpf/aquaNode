import {test,expect} from '@playwright/test';

test('journal distinguishes team reports, documented design checks and pending tests',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/journal');
 await expect(page.getByRole('heading',{level:1})).toHaveText('The work, as it stands.');
 await expect(page.locator('#journal-now')).toContainText('Historical prototype descriptions');
 await expect(page.locator('#journal-record time')).toHaveCount(3);
 await expect(page.locator('#journal-record time').first()).toHaveAttribute('datetime','2026-10-29');
 await expect(page.locator('#journal-record time').last()).toHaveAttribute('datetime','2026-10-20');
 const first=page.locator('.journal-entry').first().getByRole('button');
 await expect(first).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#journal-entry-revb-checks')).toContainText('155');
 await first.click();
 await expect(first).toHaveAttribute('aria-expanded','false');
 const second=page.locator('.journal-entry').nth(1).getByRole('button');
 await second.click();await expect(second).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#journal-entry-revb-blockers')).not.toHaveAttribute('inert','');
 await expect(page.locator('#journal-entry-revb-blockers')).toContainText('No successful ESP32 compile');
 await page.locator('#journal-entry-revb-blockers a').click();
 await expect(page).toHaveURL(/\/build#assembly-guide$/);
 await expect(page.locator('#assembly-guide')).toBeInViewport();
 expect(errors).toEqual([]);
});

test('journal navigation, reading width and motion fit desktop and phones',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/journal');
 for(const width of [1920,1440,1024,768,390,320]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'test-results/journal-desktop.png',fullPage:true});
 await page.locator('.journal-hero').screenshot({path:'test-results/journal-cover-desktop.png'});
 await page.getByRole('navigation',{name:'Explore the journal'}).getByRole('link',{name:/02 The record/}).click();
 await expect(page.locator('#journal-record-title')).toBeInViewport();
 await page.getByRole('navigation',{name:'Journal sections'}).getByRole('link',{name:'02 The record'}).click();
 await expect(page.locator('#journal-record-title')).toBeInViewport();
 await expect(page.locator('.journal-index a[aria-current=location]')).toHaveAttribute('href','#journal-record');
 await page.locator('#journal-record').screenshot({path:'test-results/journal-record.png'});
 expect(await page.locator('.journal-entry-reveal').first().evaluate(node=>getComputedStyle(node).transitionDuration)).toBe('0s');
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/journal-mobile.png',fullPage:true});
 await page.locator('.journal-hero').screenshot({path:'test-results/journal-cover-mobile.png'});
 await page.locator('.journal-next a').click();
 await expect(page).toHaveURL(/\/build#assembly-guide$/);
});

test('opening a journal entry reveals its content smoothly',async({page})=>{
 await page.goto('/journal');
 const entry=page.locator('.journal-entry').nth(1),toggle=entry.getByRole('button');
 await toggle.scrollIntoViewIfNeeded();await toggle.click();
 const detail=entry.locator('.journal-entry-reveal');
 const values=await detail.evaluate(node=>new Promise<number[]>(resolve=>{
   const start=performance.now(),values:number[]=[];
   const frame=()=>{values.push(Number(getComputedStyle(node).opacity));if(performance.now()-start<550)requestAnimationFrame(frame);else resolve(values)};frame();
 }));
 expect(values.some(value=>value>.01&&value<.99)).toBe(true);
 await expect(detail).toHaveCSS('opacity','1');
 await expect(detail.locator('.journal-entry-context p').first()).toHaveCSS('opacity','1');
 await page.setViewportSize({width:390,height:844});
 await entry.screenshot({path:'test-results/journal-entry-mobile.png'});
 await expect(detail.getByRole('link')).toBeVisible();
});
