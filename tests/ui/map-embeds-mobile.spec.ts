import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
  await page.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><path fill="#d9e7e6" d="M0 0h256v256H0z"/></svg>'}));
});

test('the uncluttered map preview opens the relevant atlas and expands with full controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const [path,selector] of [['/','.future-atlas']]){
    await page.goto(path,{waitUntil:'domcontentloaded'});
    const section=page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator('.atlas-map')).toBeVisible();
    await expect(section.getByRole('button',{name:'Zoom in',exact:true})).not.toBeVisible();
    await expect(section.locator('.atlas-map-interaction')).not.toBeVisible();
    await section.locator('.map-embed-toolbar').getByRole('button',{name:/Aktau/}).click();
    await expect(section.locator('.atlas-map-shell')).toHaveAttribute('data-interactive','false');
    await section.getByRole('button',{name:'Expand map',exact:true}).click();
    const expanded=page.getByRole('dialog',{name:'Expanded observation map'});
    await expect(expanded).toBeVisible();
    const box=await expanded.boundingBox();expect(box!.x).toBe(0);expect(box!.y).toBe(0);expect(box!.width).toBe(390);expect(box!.height).toBe(844);
    const previous=await expanded.getAttribute('data-zoom');
    await expanded.getByRole('button',{name:'Zoom in',exact:true}).click();
    await expect(expanded).toHaveAttribute('data-zoom',String(Number(previous)+1));
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(section.locator('.atlas-map-shell')).toHaveAttribute('data-zoom',String(Number(previous)+1));
    await expect(section.locator('.atlas-map-shell')).toHaveAttribute('data-interactive','false');
    await expect(section.locator('.map-embed-footer a')).toHaveAttribute('href','/map?region=aktau');
    expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('direct buoy links focus the selected point and return to its readings',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/map?buoy=AKT-049',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.atlas-map-shell')).toHaveAttribute('data-zoom','20');
  await expect(page.locator('.atlas-detail-top')).toContainText('AKT-049');
  await expect(page.getByRole('button',{name:'Buoy AKT-049',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Expand map',exact:true}).click();
  await page.getByRole('button',{name:'View readings',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.atlas-detail')).toBeFocused();
  await expect(page.locator('.atlas-example')).toContainText('AKT-049');
});

test('desktop map uses ordinary wheel in full screen and Ctrl+wheel in the page',async({page})=>{
  await page.goto('/map?region=aktau',{waitUntil:'domcontentloaded'});
  const shell=page.locator('.atlas-map-shell');await shell.scrollIntoViewIfNeeded();
  await expect(shell).toHaveAttribute('data-interactive','true');
  const original=Number(await shell.getAttribute('data-zoom'));
  await shell.locator('.atlas-map').dispatchEvent('wheel',{deltaY:-100,ctrlKey:false});
  await expect(shell).toHaveAttribute('data-zoom',String(original));
  await shell.locator('.atlas-map').dispatchEvent('wheel',{deltaY:-100,ctrlKey:true,clientX:400,clientY:400});
  await expect(shell).toHaveAttribute('data-zoom',String(original+1));
  await shell.getByRole('button',{name:'Reset map view'}).click();
  await expect(shell).toHaveAttribute('data-zoom',String(original));
  await shell.getByRole('button',{name:'Expand map',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Expanded observation map'})).toBeVisible();
  await expect(shell.locator('.atlas-map-interaction')).toContainText('scroll to zoom');
  await shell.locator('.atlas-map').dispatchEvent('wheel',{deltaY:-100,ctrlKey:false,clientX:400,clientY:400});
  await expect(shell).toHaveAttribute('data-zoom',String(original+1));
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await shell.locator('.atlas-map').dispatchEvent('wheel',{deltaY:100,ctrlKey:false});
  await expect(shell).toHaveAttribute('data-zoom',String(original+1));
});

test('mobile menu and touch map modes preserve a way back to the page',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.addInitScript(()=>localStorage.setItem('aquanode.locale','en'));
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
  await page.goto('http://127.0.0.1:5173/map',{waitUntil:'domcontentloaded'});
  const shell=page.locator('.atlas-map-shell');
  await expect(shell).toHaveAttribute('data-interactive','false');
  await shell.getByRole('button',{name:'Explore the map',exact:true}).click();
  await expect(shell).toHaveAttribute('data-interactive','true');
  await shell.getByRole('button',{name:'Scroll the page',exact:true}).click();
  await expect(shell).toHaveAttribute('data-interactive','false');
  await page.locator('.site-header .menu-button').click();
  await expect(page.locator('main')).toHaveAttribute('inert','');
  await expect(page.locator('.site-header nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
  await expect(page.locator('.site-header .menu-button')).toBeFocused();
  await page.locator('.site-header .menu-button').click();
  await page.locator('.site-header nav a[href="/team"]').click();
  await expect(page.locator('.team-page')).toBeVisible();
  expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
  await context.close();
});
