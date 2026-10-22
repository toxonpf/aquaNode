import {test,expect} from '@playwright/test';

test('headings reveal individual words without changing their text or wrapping',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/about');
 const heading=page.locator('.page-intro h1');
 await expect(heading).toHaveText('Understanding starts with observing.');
 await expect(heading.locator('.heading-word')).toHaveCount(4);
 await expect.poll(()=>heading.locator('.heading-word').evaluateAll(words=>words.every(word=>getComputedStyle(word).opacity==='1'))).toBe(true);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.screenshot({path:'test-results/heading-mobile.png'});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/team');
 await expect(page.locator('.team-hero-heading h1')).toContainText('People behind');
 expect(await page.locator('.team-hero-heading .heading-word').first().evaluate(word=>getComputedStyle(word).opacity)).toBe('1');
 expect(errors).toEqual([]);
});

test('body copy rises as a quieter layer after the heading',async({page})=>{
 await page.goto('/about');
 const heading=page.locator('.page-intro h1'),copy=page.locator('.page-intro p:not(.kicker)');
 await expect.poll(()=>heading.locator('.heading-word').evaluateAll(words=>words.every(word=>getComputedStyle(word).opacity==='1'))).toBe(true);
 await expect.poll(()=>copy.evaluate(node=>getComputedStyle(node).opacity)).toBe('1');
 expect(await copy.evaluate(node=>getComputedStyle(node).filter)).toBe('blur(0px)');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/about');
 await expect(copy).toHaveText(/AquaNode connects/);
 expect(await copy.evaluate(node=>getComputedStyle(node).opacity)).toBe('1');
});

test('destination copy begins with the opening transition ripple',async({page})=>{
 await page.goto('/about');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.locator('header nav a[href="/journal"]').click();
 const curtain=page.locator('.page-curtain'),heading=page.locator('.page-intro h1'),copy=page.locator('.page-intro p:not(.kicker)');
 await expect(heading).toHaveText('The work, as it stands.');
 await expect(curtain).toHaveAttribute('data-active','true');
 await expect(curtain).toHaveAttribute('data-phase','revealing');
 expect(Number(await copy.evaluate(node=>getComputedStyle(node).opacity))).toBeGreaterThan(.05);
 expect(Number(await heading.locator('.heading-word').first().evaluate(node=>getComputedStyle(node).opacity))).toBeGreaterThan(.05);
 await expect(curtain).toHaveAttribute('data-active','true');
 await expect(curtain).not.toHaveAttribute('data-active','true');
 await expect.poll(()=>copy.evaluate(node=>getComputedStyle(node).opacity)).toBe('1');
});

test('body-copy motion preserves the buoy annotation position and inactive arrow wave',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 const annotation=page.locator('.buoy-annotation');
 await expect(annotation).toHaveClass(/is-visible/);
 const position=await annotation.evaluate(node=>new DOMMatrix(getComputedStyle(node).transform).m42);
 expect(position).toBeLessThan(-140);
 const arrow=page.locator('.node-parts button:not([aria-pressed=true])').first().locator('.flexible-arrow-line');
 await expect.poll(()=>arrow.evaluate(node=>new DOMMatrix(getComputedStyle(node).transform).m22)).toBeCloseTo(.42,2);
});

test('the opening project block uses the full content rails',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 const rails=await page.locator('.award').evaluate(award=>{
  const project=document.querySelector('.progress-section')!;
  const grid=document.querySelector('.progress-section .status-grid')!;
  const reason=document.querySelector('.reason-section')!;
  const visual=document.querySelector('.reason-visual')!;
  const cycle=document.querySelector('.cycle-section')!;
  const evidence=document.querySelector('.evidence-section')!;
  const bounds=(node:Element)=>{const rect=node.getBoundingClientRect();return [rect.left,rect.right]};
  const style=getComputedStyle(project),projectBounds=bounds(project);
  return {award:bounds(award),project:projectBounds,grid:bounds(grid),reason:bounds(reason),visual:bounds(visual),cycle:bounds(cycle),evidence:bounds(evidence),content:[projectBounds[0]+parseFloat(style.paddingLeft),projectBounds[1]-parseFloat(style.paddingRight)]};
 });
 expect(rails.project[0]).toBeCloseTo(rails.award[0],1);expect(rails.project[1]).toBeCloseTo(rails.award[1],1);
 expect(rails.grid[0]).toBeCloseTo(rails.content[0],1);expect(rails.grid[1]).toBeCloseTo(rails.content[1],1);
 expect(rails.reason[0]).toBeCloseTo(rails.award[0],1);expect(rails.reason[1]).toBeCloseTo(rails.award[1],1);
 expect(rails.visual[0]).toBeCloseTo(rails.content[0],1);
 for(const section of [rails.cycle,rails.evidence]){
  expect(section[0]).toBeCloseTo(rails.award[0],1);expect(section[1]).toBeCloseTo(rails.award[1],1);
 }
});

test('skip matches the chapter width and scene headings reveal after the camera arrives',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-camera-state','moving');
 expect(await page.locator('#buoy-intro-title .heading-word').first().evaluate(word=>getComputedStyle(word).opacity)).toBe('0');
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-camera-state','settled');
 await expect.poll(()=>page.locator('#buoy-intro-title .heading-word').evaluateAll(words=>words.every(word=>getComputedStyle(word).opacity==='1'))).toBe(true);
 await page.screenshot({path:'test-results/detail-camera-desktop.png'});
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});
  const widths=await page.locator('.ocean-chapters a').evaluateAll(links=>links.map(link=>link.getBoundingClientRect().width));
  expect(Math.max(...widths)-Math.min(...widths)).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.waitForTimeout(2100);
 await page.screenshot({path:'test-results/detail-camera-mobile.png'});
});
