import {test,expect} from '@playwright/test';

test('the new home sections work on desktop, tablet and phone without overflow',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    const node=page.locator('.node-showcase');
    await node.getByRole('button',{name:/03 Read the water/}).click();
    await expect(node.getByRole('button',{name:/03 Read the water/})).toHaveAttribute('aria-pressed','true');
    await expect(node.locator('[aria-pressed=true] .node-part-detail')).toContainText('pH and temperature');
    const future=page.locator('.future-section');
    await future.getByRole('button',{name:'A future network',exact:true}).click();
    await expect(future).toHaveClass(/is-network/);
    await expect(future.locator('.future-description')).toContainText('More points.');
    await expect(future.locator('.future-description')).not.toContainText('<br');
    await future.getByRole('button',{name:'One buoy today',exact:true}).click();
    await expect(future).not.toHaveClass(/is-network/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('button arrows smoothly grow from a quiet wave to a strong wave on hover',async({page})=>{
  await page.goto('/team');
  const button=page.locator('.team-outro-link'),line=button.locator('.flexible-arrow-line');
  await button.scrollIntoViewIfNeeded();
  await page.mouse.move(5,400);
  const strength=()=>line.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d);
  await expect(line).toHaveCSS('animation-name','flexible-arrow-snake');
  await expect.poll(strength).toBeCloseTo(.32,2);
  await button.hover({position:{x:8,y:10}});
  const samples=await line.evaluate(el=>new Promise<number[]>(resolve=>{
    const values:number[]=[],start=performance.now();
    const sample=()=>{values.push(new DOMMatrix(getComputedStyle(el).transform).d);if(performance.now()-start<500)requestAnimationFrame(sample);else resolve(values)};
    sample();
  }));
  expect(samples.some(value=>value>.34&&value<.95)).toBe(true);
  await expect.poll(strength).toBeCloseTo(1,2);
  await page.mouse.move(5,400);
  await expect.poll(strength).toBeCloseTo(.32,2);
  await expect.poll(()=>page.locator('.team-gallery-note .flexible-arrow-line').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(1,2);
});

test('the expanded node part keeps a strong wave after the pointer leaves',async({page})=>{
  await page.goto('/');
  const node=page.locator('.node-showcase');
  const selected=node.getByRole('button',{name:/02 Protect the electronics/});
  await selected.click();
  await page.mouse.move(5,400);
  await selected.evaluate(el=>el.blur());
  const scale=(selector:string)=>node.locator(selector).evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d);
  await expect.poll(()=>scale('[aria-pressed=true] .flexible-arrow-line')).toBeCloseTo(1,2);
  await expect.poll(()=>node.locator('[aria-pressed=false] .flexible-arrow-line').first().evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(.32,2);
});

test('selected sensor arrows and scroll hints keep their strong wave without hover',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true',{timeout:25000});
  const track=page.locator('.scroll-track .flexible-arrow-line').first();
  await expect(track).toHaveCSS('animation-name','flexible-arrow-snake');
  expect(await track.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(1,2);
  await expect(page.locator('.scroll-track .flexible-arrow-trail')).toHaveCSS('animation-name','flexible-arrow-snake, flexible-arrow-flow');
  await page.getByRole('link',{name:'Explore below the surface',exact:true}).click();
  await expect(page.locator('.ocean-stage')).toHaveClass(/is-sensing-ready/);
  await expect(page.locator('.sensor-copy')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  const temperature=page.locator('.sensor-picker button').nth(1);
  await temperature.click();await page.mouse.move(5,200);await temperature.evaluate(el=>el.blur());
  const strength=(selector:string)=>page.locator(selector).evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d);
  await expect.poll(()=>strength('.sensor-picker [aria-pressed=true] .flexible-arrow-line')).toBeCloseTo(1,2);
  await expect.poll(()=>strength('.sensor-picker [aria-pressed=false] .flexible-arrow-line')).toBeCloseTo(.32,2);
  await expect.poll(()=>strength('.sensor-introduction .story-dive .flexible-arrow-line')).toBeCloseTo(1,2);
});

test('showcase part selection and reset remain connected to the model',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true',{timeout:25000});
  const node=page.locator('.node-showcase');
  await node.scrollIntoViewIfNeeded();
  await expect(node.locator('.viewer')).toHaveAttribute('data-scene-state',/ready|static/,{timeout:20000});
  await node.getByRole('button',{name:/02 Protect the electronics/}).click();
  await expect(node.getByRole('button',{name:/02 Protect the electronics/})).toHaveAttribute('aria-pressed','true');
  await expect(node.locator('.node-display-top')).toContainText('02 / 03');
  const reset=node.getByRole('button',{name:'Reset',exact:true});
  if(await reset.isEnabled()){
    await reset.click();
    await expect(node.getByRole('button',{name:/01 Stay afloat/})).toHaveAttribute('aria-pressed','true');
    await expect(node.locator('.node-display-top')).toContainText('01 / 03');
  }
});
