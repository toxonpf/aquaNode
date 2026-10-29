import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';
import fs from 'node:fs';

test('public revB status preserves the supplied unknowns and only publishes the approved architecture',async({request})=>{
 const source=JSON.parse(fs.readFileSync('AquaNode_R0.3_EC_revB/web_handoff/status.json','utf8'));
 const response=await request.get('/resources/ec-revb/status.json');
 expect(response.ok()).toBe(true);const status=await response.json();
 expect(status).toEqual(source);
 expect(status.hardware_tested).toBe(false);expect(status.firmware_compiled).toBe(false);
 expect(status.accuracy).toBeNull();expect(status.battery_life).toBeNull();
 expect(status.software_tests).toMatchObject({count:15,type:'synthetic_host_model'});
 const diagram=await request.get('/assets/engineering/ec-revb-architecture.svg');
 expect(await diagram.body()).toEqual(fs.readFileSync('AquaNode_R0.3_EC_revB/web_handoff/assets/architecture.svg'));
 expect(fs.readdirSync('public/resources/ec-revb')).not.toContain('ec_bench.ino');
});

test('the current scope, localized downloads and independent station records remain distinct',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/technology');
 await expect(page.locator('.revision-notice')).toContainText('Hardware validation pending');
 await expect(page.locator('.specs')).toContainText('SEN0244');
 await expect(page.locator('.tech-drawings img')).toHaveCount(1);
 await expect(page.locator('.tech-drawings img')).toHaveAttribute('src','/assets/engineering/ec-revb-architecture-en.svg');
 await page.goto('/build');
 await expect(page.locator('.build-download-list a[download]')).toHaveCount(5);
 await expect(page.locator('.build-download-list a').first()).toHaveAttribute('href','/resources/ec-revb/copy_en.md');
 await chooseLanguage(page,'Русский','.site-header');
 await expect(page.locator('.revision-notice')).toContainText('Аппаратные испытания предстоят');
 await expect(page.locator('.build-download-list a').first()).toHaveAttribute('href','/resources/ec-revb/copy_ru.md');
 await page.goto('/map?region=taiwan');
 await expect(page.locator('#atlas-example')).toContainText('измерения');
 await expect(page.locator('#atlas-example [data-deviation]')).toHaveCount(0);
 await expect(page.locator('.atlas-observations')).toContainText('25.5');
});
