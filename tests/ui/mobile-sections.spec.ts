import {test,expect} from '@playwright/test';

test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
});

test('mobile sections fit the device width in both languages, including board nodes and file labels',async({page})=>{
 test.setTimeout(90000);
 for(const locale of ['ru','en']){
  await page.addInitScript(value=>localStorage.setItem('aquanode.locale',value),locale);
  for(const width of [320,390,600,768]){
   await page.setViewportSize({width,height:844});
   for(const route of ['/','/about','/technology','/build','/journal','/team']){
    await page.goto(route);
    await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>innerWidth),`${locale} ${route} at ${width}: no mobile viewport expansion`).toBe(width);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${locale} ${route} at ${width}: no horizontal scrolling`).toBeLessThanOrEqual(width+1);
    if(route==='/technology'&&width>760){
     const boxes=await page.locator('.circuit-node').evaluateAll(nodes=>nodes.map(node=>{
      const rect=node.getBoundingClientRect(),host=node.closest('.circuit-network')!.getBoundingClientRect();
      return {inside:rect.left>=host.left-1&&rect.right<=host.right+1&&rect.top>=host.top-1&&rect.bottom<=host.bottom+1,unclipped:node.scrollWidth<=node.clientWidth+1};
     }));
     expect(boxes.every(box=>box.inside&&box.unclipped),JSON.stringify(boxes)).toBe(true);
    }
    if(route==='/build'){
     const labels=await page.locator('.action-download .download-label,.action-download .download-detail').evaluateAll(nodes=>nodes.map(node=>node.scrollWidth<=node.clientWidth+1));
     expect(labels.every(Boolean)).toBe(true);
    }
   }
  }
 }
});

test('mobile technology and learning are readable in order without going back to selectors',async({page})=>{
 await page.goto('/technology');
 await expect(page.locator('.circuit-workbench')).not.toBeVisible();
 await expect(page.locator('.circuit-mobile-sequence>li')).toHaveCount(4);
 await expect(page.locator('.circuit-mobile-sequence')).toContainText('AIN0');
 await expect(page.locator('.circuit-mobile-sequence')).toContainText('ripple');
 await expect(page.locator('.tech-drawing-chapter')).toHaveCount(2);
 await expect(page.locator('.tech-drawing-switch')).not.toBeVisible();
 await expect(page.locator('.tech-drawing-chapter').nth(1)).toContainText('71 ground vias');
 await page.goto('/about');
 await expect(page.locator('.learning-lab button')).toHaveCount(0);
 await expect(page.locator('.learning-journey-step')).toHaveCount(3);
 await expect(page.locator('.learning-journey-step').last()).toContainText('Leave a useful record');
});

test('mobile menu fills the screen, can be scrolled on short displays and restores page navigation',async({page})=>{
 await page.setViewportSize({width:320,height:568});
 await page.goto('/about');
 await page.locator('.menu-button').tap();
 const menu=page.locator('#navigation');
 await expect(menu).toHaveClass('open');
 const box=await menu.boundingBox();
 expect(box!.x).toBe(0);expect(box!.width).toBe(320);expect(box!.y+box!.height).toBe(568);
 await menu.getByRole('link',{name:/The team/}).tap();
 await expect(page).toHaveURL('/team');
 await expect(page.locator('main')).not.toHaveAttribute('inert','');
 await page.locator('.menu-button').tap();
 await page.keyboard.press('Escape');
 await expect(menu).not.toHaveClass(/\bopen\b/);
 await expect(page.locator('.menu-button')).toBeFocused();
});

test('opening an assembly step scrolls up only when collapsing the old step moves its start above the reader',async({page})=>{
 for(const reducedMotion of ['reduce','no-preference'] as const){
  await page.emulateMedia({reducedMotion});
  await page.goto('/build');
  await page.evaluate(()=>document.fonts.ready);
  // Without native scroll anchoring, closing the taller preceding step can
  // move the clicked heading above the viewport. The app must recover it.
  await page.addStyleTag({content:'html,body,main *{overflow-anchor:none!important}'});
  await expect(page.locator('.build-mobile-step-picker')).toHaveCount(0);
  const target=page.locator('#step-4');
  await target.evaluate(node=>scrollTo({top:scrollY+node.getBoundingClientRect().top-230,behavior:'instant'}));
  await target.getByRole('button').tap();
  await expect(target.getByRole('button')).toHaveAttribute('aria-expanded','true');
  await expect.poll(()=>target.evaluate(node=>Math.abs(node.getBoundingClientRect().top-document.querySelector('.site-header')!.getBoundingClientRect().bottom-24))).toBeLessThan(3);

  await page.goto('/build');
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('#step-0 button').tap();
  await expect(page.locator('#step-0 button')).toHaveAttribute('aria-expanded','false');
  await expect.poll(()=>page.locator('#step-0 .build-step-reveal').evaluate(node=>node.getBoundingClientRect().height)).toBeLessThan(1);
  const below=page.locator('#step-2');
  await below.evaluate(node=>scrollTo({top:scrollY+node.getBoundingClientRect().top-230,behavior:'instant'}));
  const before=(await below.boundingBox())!.y;
  await below.getByRole('button').tap();
  await expect(below.getByRole('button')).toHaveAttribute('aria-expanded','true');
  await page.waitForTimeout(reducedMotion==='reduce'?100:650);
  // Native anchoring may adjust scrollY while fonts settle. The visible
  // heading must remain at the same position and must not be pulled to top.
  expect(Math.abs((await below.boundingBox())!.y-before)).toBeLessThan(3);
 }
});

test('menu animates and stays on the source page until the navigation curtain covers it',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/about');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.locator('.menu-button').tap();
 const menu=page.locator('#navigation');
 await expect(menu).toHaveCSS('animation-name','menu-water-open');
 const technology=menu.getByRole('link',{name:/The buoy/});
 await expect(technology).toHaveCSS('opacity','1');
 await technology.tap();
 await expect(page.locator('.page-curtain')).toHaveAttribute('data-phase','covering');
 await expect(menu).toHaveClass('open');
 await expect(page.locator('.about-hero h1')).toBeAttached();
 await expect(page.locator('.tech-hero h1')).toBeVisible();
 await expect(menu).not.toHaveClass(/\bopen\b/);
 await expect(page.locator('main')).not.toHaveAttribute('inert','');
 await expect.poll(()=>page.locator('.tech-hero-copy>p').evaluate(node=>Number(getComputedStyle(node).opacity))).toBe(1);
});

test('mobile portraits keep a uniform photo-anchored wave and fit without scrolling',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/team');
 await page.locator('.team-portrait-trigger').first().tap();
 await expect(page.getByRole('dialog')).toHaveAttribute('data-profile-phase','arriving');
 const samples=await page.evaluate(()=>new Promise<{ratio:number;uniform:boolean}[]>(resolve=>{
  const start=performance.now(),values:{ratio:number;uniform:boolean}[]=[];
  const sample=()=>{
   const flight=document.querySelector('.team-portrait-flight');
   if(flight){const box=flight.getBoundingClientRect();const group=flight.querySelector<SVGGraphicsElement>('.portrait-current-curves');const matrix=group?.transform.baseVal.consolidate()?.matrix;values.push({ratio:box.width/box.height,uniform:!!matrix&&Math.abs(Math.abs(matrix.a)-Math.abs(matrix.d))<.001})}
   if(performance.now()-start<600)requestAnimationFrame(sample);else resolve(values);
  };sample();
 }));
 expect(samples.length).toBeGreaterThan(2);
 expect(samples.every(sample=>sample.ratio>0&&sample.uniform)).toBe(true);
 await expect(page.getByRole('dialog')).toHaveAttribute('data-profile-phase','open');
 const photo=await page.locator('.team-profile-portrait').boundingBox();
 expect(photo!.height).toBeGreaterThan(200);
 expect((await page.locator('.team-profile-portrait .team-profile-photo-monogram').boundingBox())!.height).toBeLessThan(50);
 await expect(page.locator('.team-profile-pagination')).toBeInViewport({ratio:1});
 for(const selector of ['.team-profile-content','.team-profile-info-viewport','.team-profile-info']){
  expect(await page.locator(selector).evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
 }
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.locator('.team-portrait-flight')).toHaveCount(0);
 await expect(page.locator('.team-portrait-trigger').first()).toHaveCSS('opacity','1');
});
