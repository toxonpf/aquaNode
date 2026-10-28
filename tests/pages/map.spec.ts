import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  // Map interactions must also work when the external basemap is unavailable.
  await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><path fill="#d9e7e6" d="M0 0h256v256H0z"/></svg>'}));
});

test('the atlas progressively splits 97 coastal buoys into local groups',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/map',{waitUntil:'domcontentloaded'});
  await expect(page).toHaveTitle('Observation map — AquaNode');
  await expect(page.locator('.atlas-cluster')).toHaveCount(3);
  const counts=await page.locator('.atlas-cluster').allTextContents();
  expect(counts.map(Number).sort((a,b)=>a-b)).toEqual([3,4,97]);
  await page.getByRole('button',{name:'Aktau 97',exact:true}).click();
  const localGroups=page.locator('.atlas-cluster[data-region=aktau]');
  expect(await localGroups.count()).toBeGreaterThan(2);
  const localCounts=await localGroups.evaluateAll(nodes=>nodes.map(node=>Number((node as HTMLElement).dataset.count)));
  expect(localCounts.every(count=>count>1&&count<97)).toBe(true);
  const total=await page.locator('.atlas-marker[data-region=aktau]').evaluateAll(nodes=>nodes.reduce((sum,node)=>sum+Number((node as HTMLElement).dataset.count),0));
  expect(total).toBe(97);
  const before=await page.locator('.atlas-marker[data-region=aktau]').count();
  await localGroups.first().click();
  expect(await page.locator('.atlas-marker[data-region=aktau]').count()).toBeGreaterThan(before);
  // Region fit is <=16. Four zoom steps expose all dense shoreline markers.
  for(let i=0;i<4;i++){
    const zoomIn=page.getByRole('button',{name:'Zoom in',exact:true});
    if(await zoomIn.isDisabled())break;
    await zoomIn.click();
  }
  await expect(page.locator('.atlas-buoy[data-region=aktau]')).toHaveCount(97);
  const visibleId=await page.locator('.atlas-buoy[data-region=aktau]').evaluateAll(nodes=>{
    const map=document.querySelector('.atlas-map')!.getBoundingClientRect();
    return nodes.find(node=>{const box=node.getBoundingClientRect();return box.left>map.left+10&&box.right<map.right-10&&box.top>map.top+10&&box.bottom<map.bottom-10})?.getAttribute('aria-label');
  });
  expect(visibleId).toBeTruthy();
  await page.getByRole('button',{name:visibleId!,exact:true}).click();
  await expect(page.locator('.atlas-detail-top')).toContainText(visibleId!.replace('Buoy ',''));
  await expect(page.locator('#atlas-example')).toContainText('Independent demo baseline');
  await expect(page.locator('.atlas-detail')).toContainText('Exact GPS fixes');
  await page.getByRole('button',{name:'The world 104',exact:true}).click();
  await expect(page.locator('.atlas-cluster')).toHaveCount(3);
  expect(errors).toEqual([]);
});

test('Taiwan keeps source dates, missing values and simulated readings distinct',async({page})=>{
  await page.goto('/map',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Taiwan 4',exact:true}).click();
  await expect(page.locator('.atlas-station')).toHaveCount(4);
  const select=page.getByLabel('REFERENCE STATION',{exact:true});
  await expect(select).toHaveValue('5131');
  await expect(page.locator('time')).toHaveAttribute('datetime','2026-05-12');
  await expect(page.locator('.atlas-observations')).toContainText('25.5');
  await expect(page.locator('.atlas-observations dl>div').first()).toHaveText('Depth—');
  await select.selectOption('5127');
  await expect(page.locator('time')).toHaveAttribute('datetime','2026-06-05');
  await expect(page.locator('.atlas-observations')).toContainText('26.3');
  await page.getByLabel('OBSERVATION PERIOD',{exact:true}).selectOption('2002-Q1');
  await expect(page.locator('time')).toHaveAttribute('datetime','2002-03-13');
  await expect(page.locator('.atlas-observations')).toContainText('<3');
  await expect(page.locator('#atlas-example')).toContainText('not field measurements');
  const deviations=await page.locator('#atlas-example [data-deviation]').evaluateAll(nodes=>nodes.map(node=>Number((node as HTMLElement).dataset.deviation)));
  expect(deviations.every(value=>Math.abs(value)<=5)).toBe(true);
  await expect(page.locator('.atlas-detail-source a')).toHaveAttribute('href','https://data.gov.tw/dataset/155934');
  const download=page.waitForEvent('download');
  await page.locator('.atlas-download').click();
  expect((await download).suggestedFilename()).toBe('stations_data_en.csv');
  await page.getByRole('button',{name:'Русский',exact:true}).first().click();
  await expect(page).toHaveTitle('Карта наблюдений — AquaNode');
  await expect(page.locator('.atlas-example')).toContainText('не полевые измерения');
  await expect(page.locator('.atlas-field select').last()).toHaveValue('2002-Q1');
});

test('coordinates stay in water, stations retain their supplied positions and models stay within 5%',async({page})=>{
  await page.goto('/map',{waitUntil:'domcontentloaded'});
  const report=await page.evaluate(async()=>{
    const data=await import('/src/pages/map/data.ts');
    const geometry=await import('/src/pages/map/shoreline.ts');
    const clustering=await import('/src/pages/map/cluster.ts');
    const coastChecks=data.buoys.filter((buoy:any)=>buoy.region!=='taiwan').map((buoy:any)=>{
      const path=buoy.region==='aktau'?geometry.aktauCoast:geometry.hawaiiCoasts[Number(buoy.id.slice(-3))-1];
      return geometry.coastRelation(buoy.position,path);
    });
    let maxDeviation=0,nearestMatches=true;
    for(const buoy of data.buoys)for(const period of data.periods){
      const example=data.exampleFor(buoy,period);
      for(const reading of example.readings)maxDeviation=Math.max(maxDeviation,Math.abs(reading.deviation));
      if(buoy.region==='taiwan'&&example.station.id!==buoy.stationId)nearestMatches=false;
    }
    const groupsAt=clustering.createBuoyClusters(data.buoys);
    const allCounts=[],validAnchors=[];
    for(let zoom=0;zoom<=20;zoom++){
      const groups=groupsAt(zoom);
      allCounts.push(groups.reduce((sum:number,group:any)=>sum+group.members.length,0));
      validAnchors.push(groups.every((group:any)=>group.members.some((buoy:any)=>buoy.position[0]===group.position[0]&&buoy.position[1]===group.position[1])));
    }
    const aktau=data.buoys.filter((buoy:any)=>buoy.region==='aktau');
    const variants=new Set(aktau.map((buoy:any)=>JSON.stringify(data.exampleFor(buoy,data.periods[0]).readings.map((row:any)=>row.value))));
    return {coastChecks,maxDeviation,nearestMatches,allCounts,validAnchors,variants:variants.size,stations:data.stations.map((station:any)=>[station.id,...station.position])};
  });
  expect(report.coastChecks).toHaveLength(100);
  expect(report.coastChecks.every((check:any)=>check.water&&check.distance>=8&&check.distance<=23)).toBe(true);
  expect(report.maxDeviation).toBeLessThanOrEqual(5.00000001);
  expect(report.nearestMatches).toBe(true);
  expect(new Set(report.allCounts)).toEqual(new Set([104]));
  expect(report.validAnchors.every(Boolean)).toBe(true);
  expect(report.variants).toBeGreaterThan(30);
  expect(report.stations).toEqual([['5131',25.222617,121.400770],['5127',25.166219,121.764830],['5138',25.122370,121.245769],['5136',25.131742,121.829123]]);
});

test('atlas fits desktop zoom and touch phones without overflow',async({browser})=>{
  for(const config of [{width:1920,height:1080,hasTouch:false},{width:1477,height:831,hasTouch:false},{width:390,height:844,hasTouch:true},{width:320,height:740,hasTouch:true}]){
    const context=await browser.newContext({viewport:{width:config.width,height:config.height},hasTouch:config.hasTouch,isMobile:config.hasTouch,reducedMotion:'reduce'});
    const page=await context.newPage();
    await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
    await page.addInitScript(()=>localStorage.setItem('aquanode.locale','ru'));
    await page.goto('http://127.0.0.1:5173/map',{waitUntil:'domcontentloaded'});
    await expect(page.locator('.atlas-map')).toBeVisible();
    await expect(page.locator('.atlas-cluster')).toHaveCount(3);
    const allVisible=await page.locator('.atlas-cluster').evaluateAll(nodes=>{
      const map=document.querySelector('.atlas-map')!.getBoundingClientRect();
      return nodes.every(node=>{const box=node.getBoundingClientRect();return box.left>=map.left&&box.right<=map.right&&box.top>=map.top&&box.bottom<=map.bottom});
    });
    expect(allVisible).toBe(true);
    await page.getByRole('button',{name:'Тайвань 4',exact:true}).click();
    await expect(page.locator('.atlas-station')).toHaveCount(4);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const map=await page.locator('.atlas-map').boundingBox(),detail=await page.locator('.atlas-detail').boundingBox();
    expect(map!.width).toBeGreaterThan(260);
    if(config.hasTouch)expect(detail!.y).toBeGreaterThanOrEqual(map!.y+map!.height-1);
    else expect(detail!.x).toBeGreaterThanOrEqual(map!.x+map!.width-1);
    await expect(page.locator('.atlas-tile-status')).toBeVisible();
    await context.close();
  }
});
