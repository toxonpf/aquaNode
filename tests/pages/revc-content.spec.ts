import fs from 'node:fs';
import {test,expect} from '@playwright/test';
import {chooseLanguage} from '../helpers/language';

test('revC web status matches the supplied source checks and keeps unknown outcomes unknown',async({request})=>{
 const source=JSON.parse(fs.readFileSync('AquaNode_R0.3_EC_pH_revC/checks/connection_check.json','utf8'));
 const report=fs.readFileSync('AquaNode_R0.3_EC_pH_revC/checks/python_tests.txt','utf8');
 const response=await request.get('/resources/ec-ph-revc/status.json');expect(response.ok()).toBe(true);
 const status=await response.json();
 expect(status).toEqual(JSON.parse(fs.readFileSync('src/data/revisions/ec-ph-revc.json','utf8')));
 expect(status.revision).toBe('R0.3-EC-pH-revC');expect(status.as_of).toBe('2026-11-02');
 expect(status.source_connectivity.schematic_pins).toBe(source.schematic_pins_checked);
 expect(status.source_connectivity.pcb_pads).toBe(source.pcb_pads_checked);
 expect(status.software_tests).toMatchObject({count:18,ec_model:15,ph_exporter:3,result:'passed'});expect(report).toContain('Ran 18 tests');
 for(const key of ['hardware_tested','firmware_compiled','native_erc_run','native_drc_run','ph_verified','fabrication_ready','radio_verified','mesh_verified'])expect(status[key],key).toBe(false);
 for(const key of ['accuracy','battery_life','field_pilots_verified'])expect(status[key],key).toBeNull();
 expect(status.inputs.ph).toMatchObject({module:'DFRobot SEN0169-V2',isolator:'DFRobot DFR0504',adc:'ADS1115',enabled_in_design:true,numeric_output_default:null});
 expect(status.ph_power).toMatchObject({kind:'separate_regulated_bench_supply',battery_implementation_complete:false});
 expect(status.cpp_ph_assertions).toEqual({prepared:15,executed:false});
 expect(status.presentation).toEqual({mode:'simulation',hardware_evidence:false,loaded_by_firmware:false});
 expect(fs.readdirSync('public/resources/ec-ph-revc').sort()).toEqual(['ATTRIBUTION.md','copy_en.md','copy_ru.md','copy_zh-TW.md','evidence.md','status.json'].sort());
});

test('all three languages expose the selected pH chain and localized revC downloads',async({page,request})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [name,lang]of [['English','en'],['Русский','ru'],['繁體中文','zh-TW']]){
  await page.goto('/technology');await chooseLanguage(page,name);
  await expect(page.locator('.revision-notice')).toContainText('R0.3-EC-pH-revC');
  await expect(page.locator('.revision-notice time')).toHaveAttribute('datetime','2026-11-02');
  for(const part of ['SEN0244','SEN0169-V2','DFR0504','ADS1115','DS18B20'])await expect(page.locator('.specs')).toContainText(part);
  await page.locator('.circuit-node--3').click();await expect(page.locator('.circuit-node--3')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#tech-path-detail')).toContainText('ADS1115');
  await page.goto('/build');await expect(page.locator('.build-download-list a').first()).toHaveAttribute('href',`/resources/ec-ph-revc/copy_${lang}.md`);
  for(const link of await page.locator('.build-download-list a[download]').all()){
   const result=await request.get((await link.getAttribute('href'))!);expect(result.ok()).toBe(true);expect((await result.body()).length).toBeGreaterThan(100);
  }
  await page.goto('/journal');await expect(page.locator('#journal-entry-revc-checks')).toContainText('166');await expect(page.locator('#journal-entry-revc-checks')).toContainText('139');
 }
});

test('three ocean inputs select pH without losing the chapter or reader on narrow screens',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.locator('.ocean-chapters a[href="#buoy-sensors"]').click();
 const picker=page.locator('.sensor-picker');await expect(picker.locator('button')).toHaveCount(3);
 for(const [width,height]of [[1440,900],[1093,614],[390,844],[320,568]]){
  await page.setViewportSize({width,height});await picker.getByRole('button',{name:/Acidity/}).click();
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-sensor','ph');
  await expect(page.locator('#sensor-explanation')).toContainText('Calibration');
  const overflow=await picker.evaluate(n=>({page:document.documentElement.scrollWidth-innerWidth,picker:n.scrollWidth-n.clientWidth,buttons:[...n.querySelectorAll('button')].map(b=>b.scrollWidth-b.clientWidth)}));
  expect(overflow.page).toBeLessThanOrEqual(1);expect(overflow.picker).toBeLessThanOrEqual(1);for(const value of overflow.buttons)expect(value).toBeLessThanOrEqual(1);
 }
 await chooseLanguage(page,'Русский');await expect(page.locator('.ocean-stage')).toHaveAttribute('data-sensor','ph');await expect(page.locator('#sensor-explanation')).toContainText('калибровки');
});
