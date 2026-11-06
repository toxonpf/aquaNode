import {test,expect} from '@playwright/test';
import {chooseLanguage} from '../helpers/language';

test.beforeEach(async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
});

test('Taiwan summary averages absolute simulated differences and excludes unavailable references',async({page})=>{
  await page.goto('/map');
  const result=await page.evaluate(async()=>{
    const data=await import('/src/pages/map/data.ts');
    const taiwan=data.buoys.filter((buoy:any)=>buoy.region==='taiwan');
    const checks=data.periods.map((period:string)=>{
      const rows=taiwan.flatMap((buoy:any)=>data.exampleFor(buoy,period).readings.map((row:any)=>({id:buoy.id,...row})))
        .filter((row:any)=>Number(row.reference)!==0);
      const mean=(values:number[])=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
      const expected=mean(rows.map((row:any)=>Math.abs((Number(row.value)-Number(row.reference))/Number(row.reference))*100));
      const report=data.taiwanComparison(period);
      return {mean:report.mean,expected,pairs:report.pairCount,expectedPairs:rows.length,buoys:report.buoyCount,expectedBuoys:new Set(rows.map((row:any)=>row.id)).size,
        metrics:report.metrics.map((metric:any)=>({mean:metric.mean,expected:mean(rows.filter((row:any)=>row.key===metric.key).map((row:any)=>Math.abs(row.deviation)))}))};
    });
    // Missing, censored and zero references must never create perfect matches.
    const period=data.periods[0];
    const records=data.samples.filter((sample:any)=>sample.period===period);
    const original=records.map((sample:any)=>[...sample.values]);
    let unavailable;
    try{
      records.forEach((sample:any,index:number)=>{sample.values[1]=index%2?'0':'<3';sample.values[3]=''});
      unavailable=data.taiwanComparison(period);
    }finally{records.forEach((sample:any,index:number)=>{sample.values=original[index]})}
    return {checks,unavailable};
  });
  expect(result.checks.length).toBeGreaterThan(90);
  for(const row of result.checks){
    if(row.expected===null)expect(row.mean).toBeNull();else expect(row.mean).toBeCloseTo(row.expected,10);
    expect(row.pairs).toBe(row.expectedPairs);expect(row.buoys).toBe(row.expectedBuoys);
    for(const metric of row.metrics){if(metric.expected===null)expect(metric.mean).toBeNull();else expect(metric.mean).toBeCloseTo(metric.expected,10)}
  }
  expect(result.unavailable).toMatchObject({mean:null,pairCount:0,buoyCount:0,totalBuoys:4});
});

test('regional accounts and comparison remain localized, synchronized and readable on phones',async({page})=>{
  await page.goto('/map?region=taiwan');
  const comparison=page.locator('.atlas-comparison');
  await expect(comparison).toContainText('not measured accuracy');
  await expect(comparison.locator('[data-comparison-mean]')).toHaveCount(1);
  await comparison.locator('select').selectOption('2002-Q1');
  await expect(page.getByLabel('OBSERVATION PERIOD',{exact:true})).toHaveValue('2002-Q1');
  await page.getByLabel('OBSERVATION PERIOD',{exact:true}).selectOption('2026-Q2');
  await expect(comparison.locator('select')).toHaveValue('2026-Q2');
  for(const [language,regions,words] of [
    ['English',['Hawaiʻi 3','Aktau 97','Taiwan 4'],['Hawaiʻi Pacific University','School No. 15','Ocean Conservation Administration']],
    ['Русский',['Гавайи 3','Актау 97','Тайвань 4'],['Hawaiʻi Pacific University','школы №15','OCA']],
    ['繁體中文',['夏威夷 3','阿克套 97','台灣 4'],['夏威夷太平洋大學','第 15 學校','海洋保育署']],
  ] as const){
    await chooseLanguage(page,language);
    for(let i=0;i<regions.length;i++){
      await page.getByRole('button',{name:regions[i],exact:true}).click();
      await expect(page.locator('.atlas-description')).toContainText(words[i]);
    }
    await expect(comparison.locator('select')).toHaveValue('2026-Q2');
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:844});
      const overflow=await comparison.evaluate(node=>({page:document.documentElement.scrollWidth-innerWidth,panel:node.scrollWidth-node.clientWidth}));
      expect(overflow.page).toBeLessThanOrEqual(1);expect(overflow.panel).toBeLessThanOrEqual(1);
    }
  }
  await page.goto('/technology');
  await expect(page.locator('.existing-devices-copy')).toContainText('第二版浮標');
  await expect(page.locator('.existing-devices-copy')).toContainText('OCA');
});
