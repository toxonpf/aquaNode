import {test,expect} from '@playwright/test';
import {loadingWordmarkOffset} from '../../src/shared/navigation/loadingPlacement';

test('the loading mark chooses the clear side closest to the screen centre',()=>{
  const logo={left:480,right:920,top:410,bottom:590};
  const belowCentre={left:600,right:850,top:545,bottom:589};
  const aboveCentre={left:600,right:850,top:410,bottom:454};
  const above=loadingWordmarkOffset(logo,belowCentre,1000),below=loadingWordmarkOffset(logo,aboveCentre,1000);
  expect(above).toBeLessThan(0);expect(logo.bottom+above).toBeLessThanOrEqual(belowCentre.top-32);
  expect(below).toBeGreaterThan(0);expect(logo.top+below).toBeGreaterThanOrEqual(aboveCentre.bottom+32);
  expect(loadingWordmarkOffset(logo,{left:1100,right:1350,top:450,bottom:500},1000)).toBe(0);
});

test('logo navigation retains one clicked mark without duplicating its artwork',async({page})=>{
  let release=()=>{},held=Promise.resolve();
  await page.route('**/src/features/ocean/scene/Scene.tsx*',async route=>{await held;await route.continue()});
  for(const selector of ['.site-header>.logo','.footer-brand']){
    held=new Promise<void>(resolve=>{release=resolve});
    await page.goto('/about');await page.evaluate(()=>document.fonts.ready);
    try{
      await page.locator(selector).scrollIntoViewIfNeeded();
      const original=await page.locator(selector).boundingBox();await page.locator(selector).click();
      const curtain=page.locator('.page-curtain');await expect(curtain).toHaveAttribute('data-phase','loading');
      const retained=curtain.locator('[data-retained-navigation]');
      await expect(retained).toHaveCount(1);await expect(retained).toBeVisible();
      await expect(retained.locator('.brand-mark')).toHaveCount(1);
      await expect(retained.locator('svg')).toHaveCount(1);
      expect(await retained.evaluate(node=>getComputedStyle(node,'::before').content)).toBe('none');
      const pinned=await retained.boundingBox();
      expect(pinned!.x).toBeCloseTo(original!.x,0);expect(pinned!.y).toBeCloseTo(original!.y,0);
      expect(pinned!.width).toBeCloseTo(original!.width,0);
      await expect(curtain.locator('.page-curtain-wordmark .brand-mark')).toHaveCount(1);
      await expect(page.locator('.site-header')).toHaveCSS('visibility','hidden');
      expect(await page.locator('.site-header>.logo').evaluate(node=>getComputedStyle(node,'::before').content)).toBe('none');
      const mark=await curtain.locator('.page-curtain-wordmark').boundingBox();
      expect(mark!.x+mark!.width/2).toBeCloseTo(page.viewportSize()!.width/2,0);
      await page.screenshot({path:`test-results/loading-single-logo-${selector.startsWith('.footer')?'footer':'header'}.png`});
    }finally{release()}
    await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  }
});

test('the header underlines the displayed page until the next route is mounted',async({page})=>{
  let release=()=>{};const held=new Promise<void>(resolve=>{release=resolve});
  await page.route('**/src/features/ocean/scene/Scene.tsx*',async route=>{await held;await route.continue()});
  await page.goto('/about');
  try{
    await page.locator('.site-header nav a[href="/technology"]').click();
    await expect(page.locator('.page-curtain')).toHaveAttribute('data-phase','covering');
    await expect(page.locator('.site-header nav a[aria-current="page"]')).toHaveAttribute('href','/about');
    await expect(page.locator('.site-header nav a[href="/technology"]')).not.toHaveClass('active');
    await expect(page.locator('.page-curtain')).toHaveAttribute('data-phase','loading');
    await expect(page.locator('main .technology-page')).toHaveCount(1);
    await expect(page.locator('.site-header nav a[aria-current="page"]')).toHaveAttribute('href','/technology');
  }finally{release()}
});

test('the ocean header has the same height as ordinary pages and its mobile menu meets it',async({browser})=>{
  for(const width of [1440,1024,390,320]){
    const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width<=760,isMobile:width<=760,reducedMotion:'reduce'});
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:5173/about');const normal=await page.locator('.site-header').boundingBox();
    await page.goto('http://127.0.0.1:5173/');const ocean=await page.locator('.site-header').boundingBox();
    expect(ocean!.height).toBe(normal!.height);expect(ocean!.height).toBeCloseTo(width<=760?56:64*width/1920,1);
    if(width<=760){
      await page.locator('.site-header .menu-button').click();
      const menu=await page.locator('#navigation').boundingBox();
      expect(Math.abs(menu!.y-(ocean!.y+ocean!.height))).toBeLessThanOrEqual(1);
    }
    await context.close();
  }
});
