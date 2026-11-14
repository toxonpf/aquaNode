import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
});
test('restored buoy groups retain IDs, positions and selected readings',async({page})=>{
 await page.goto('/map');
 await expect(page).toHaveTitle('Buoy map — AquaNode');
 await expect(page.locator('.atlas-total')).toHaveText('104Map markers');
 const total=await page.locator('.atlas-marker').evaluateAll(nodes=>nodes.reduce((sum,node)=>sum+Number((node as HTMLElement).dataset.count),0));
 expect(total).toBe(104);
 for(const [id,region] of [['HPU-002','Hawaiʻi'],['AKT-049','Aktau'],['TWN-003','Taiwan']]){
  await page.goto(`/map?buoy=${id}`);
  await expect(page.locator('.atlas-detail-top')).toContainText(id);
  await expect(page.locator('.atlas-detail h2')).toHaveText(region);
  await expect(page.getByRole('button',{name:`Buoy ${id}`,exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.atlas-example')).toContainText('not buoy measurements');
  await expect(page.locator('.atlas-example-row')).not.toHaveCount(0);
  await page.locator('.atlas-detail').screenshot({path:`test-results/refined-buoy-${id}.png`});
 }
 const download=page.waitForEvent('download');await page.getByRole('link',{name:/Download buoy records/}).click();
 expect((await download).suggestedFilename()).toBe('aquanode-buoy-examples.json');
});
test('station archive retains actual dates, censored and missing values separately',async({page})=>{
 await page.goto('/map?region=taiwan');
 await expect(page.locator('.atlas-station')).toHaveCount(4);
 await expect(page.locator('.atlas-sample-date time')).toHaveAttribute('datetime','2026-05-12');
 await expect(page.locator('.atlas-observations')).toContainText('25.5');
 await expect(page.locator('.atlas-observations dl>div').first()).toHaveText('Depth—');
 await page.getByLabel('REFERENCE STATION',{exact:true}).selectOption('5127');
 await expect(page.locator('.atlas-sample-date time')).toHaveAttribute('datetime','2026-06-05');
 await page.getByLabel('OBSERVATION PERIOD',{exact:true}).selectOption('2002-Q1');
 await expect(page.locator('.atlas-sample-date time')).toHaveAttribute('datetime','2002-03-13');
 await expect(page.locator('.atlas-observations')).toContainText('<3');
 await expect(page.locator('.atlas-example')).toHaveCount(0);
 await page.getByLabel('Show calculation example').check();
 await expect(page.locator('.atlas-example')).toContainText('2002-03-13');
 await page.getByLabel('Show reference stations').uncheck();await expect(page.locator('.atlas-station')).toHaveCount(0);
 const download=page.waitForEvent('download');await page.locator('.atlas-download').click();
 expect((await download).suggestedFilename()).toBe('stations_data_en.csv');
 await chooseLanguage(page,'Русский');await expect(page.locator('.atlas-example')).toContainText('не измерения буя');
 await expect(page.locator('.atlas-field select').last()).toHaveValue('2002-Q1');
 await chooseLanguage(page,'繁體中文');await expect(page.locator('.atlas-example')).toContainText('不是浮標量測');
});
test('every buoy has traceable regional examples within five percent',async({page})=>{
 await page.goto('/map');
 const report=await page.evaluate(async()=>{
  const data=await import('/src/pages/map/data.ts');
  const shore=await import('/src/pages/map/shoreline.ts');
  let max=0,count=0,missing=0;
  for(const buoy of [...data.buoys,...data.stationLocations])for(const period of data.periods){
   const example=data.exampleFor(buoy,period);
   for(const reading of example.readings){max=Math.max(max,Math.abs(reading.deviation));count++}
   if(buoy.region==='taiwan'&&!example.sample&&example.readings.length)missing++;
  }
  return {max,count,missing,ids:data.buoys.map((p:any)=>p.id),records:data.buoyRecords,
   aktauFirst:data.buoys.find((p:any)=>p.id==='AKT-001')?.position,
   expectedAktauFirst:shore.offshorePoint(shore.aktauCoast,.5/97,15),
   stations:data.stationLocations.length};
 });
 expect(report.max).toBeLessThanOrEqual(5.00000001);expect(report.count).toBeGreaterThan(1000);expect(report.missing).toBe(0);
 expect(report.ids).toHaveLength(104);expect(new Set(report.ids).size).toBe(104);
 expect(report.aktauFirst).toEqual(report.expectedAktauFirst);expect(report.stations).toBe(4);
 expect(report.records.every((record:any)=>record.dataType==='calculation-example'&&record.source.url.startsWith('https://')&&record.readings.length)).toBe(true);
 expect(report.records.find((r:any)=>r.id==='AKT-001').readings).toEqual([expect.objectContaining({key:'ph',reference:'8.12'})]);
 expect(report.records.find((r:any)=>r.id==='HPU-001').source.url).toContain('hawaii.gov');
});
test('map and readings fit desktop, tablet and touch screens',async({page})=>{
 for(const width of [1920,1440,1024,768,390,320]){
  await page.setViewportSize({width,height:900});await page.goto('/map?buoy=TWN-001');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.atlas-map')).toBeVisible();await expect(page.locator('.atlas-example')).toBeVisible();
 }
});
