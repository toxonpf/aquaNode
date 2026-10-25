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

test('internal navigation arrows smoothly grow from a quiet wave to a strong wave on hover',async({page})=>{
  await page.goto('/about');
  const button=page.locator('.about-next .arrow-link'),line=button.locator('.flexible-arrow-line');
  await button.scrollIntoViewIfNeeded();
  await page.mouse.move(5,400);
  const strength=()=>line.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d);
  await expect(line).toHaveCSS('animation-name','flexible-arrow-snake');
  await expect.poll(strength).toBeCloseTo(.6,2);
  await button.hover({position:{x:8,y:10}});
  const samples=await line.evaluate(el=>new Promise<number[]>(resolve=>{
    const values:number[]=[],start=performance.now();
    const sample=()=>{values.push(new DOMMatrix(getComputedStyle(el).transform).d);if(performance.now()-start<500)requestAnimationFrame(sample);else resolve(values)};
    sample();
  }));
  expect(samples.some(value=>value>.44&&value<.95)).toBe(true);
  await expect.poll(strength).toBeCloseTo(1,2);
  await page.mouse.move(5,400);
  await expect.poll(strength).toBeCloseTo(.6,2);
  await page.goto('/team');
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
  await expect.poll(()=>node.locator('[aria-pressed=false] .flexible-arrow-line').first().evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).d)).toBeCloseTo(.6,2);
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
  await expect.poll(()=>strength('.sensor-picker [aria-pressed=false] .flexible-arrow-line')).toBeCloseTo(.6,2);
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

test('the showcase canvas lets wheel input scroll the page without zooming the buoy',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true',{timeout:25000});
  await page.getByRole('link',{name:'Skip buoy story',exact:true}).click();
  await expect.poll(()=>page.locator('.award').evaluate(node=>Math.abs(node.getBoundingClientRect().top-(document.querySelector('.site-header')?.getBoundingClientRect().height??0)))).toBeLessThan(1);
  const viewer=page.locator('.node-display .viewer');await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).toHaveAttribute('data-scene-state','ready',{timeout:20000});
  const canvas=viewer.locator('canvas');await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const original=(await canvas.screenshot()).toString('base64');
  const start=await page.evaluate(()=>scrollY);
  await canvas.hover();await page.mouse.wheel(0,180);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(start+100);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0,-180);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(start,0);
  const after=(await canvas.screenshot()).toString('base64');
  // Screen-position changes can alter subpixel antialiasing. Compare the
  // bright hull's visible dimensions rather than requiring identical PNGs.
  const bounds=await page.evaluate(async(images)=>Promise.all(images.map(async(encoded)=>{
    const image=new Image();image.src='data:image/png;base64,'+encoded;await image.decode();
    const surface=document.createElement('canvas');surface.width=image.width;surface.height=image.height;
    const context=surface.getContext('2d')!;context.drawImage(image,0,0);
    const {data}=context.getImageData(0,0,image.width,image.height);
    let left=image.width,right=0,top=image.height,bottom=0;
    for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){
      const i=(y*image.width+x)*4;
      if(data[i]>160&&data[i+1]>160&&data[i+2]>120){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
    }
    return {width:right-left,height:bottom-top};
  })),[original,after]);
  expect(bounds[0].width).toBeGreaterThan(100);expect(bounds[0].height).toBeGreaterThan(100);
  expect(Math.abs(bounds[0].width-bounds[1].width)).toBeLessThan(3);
  expect(Math.abs(bounds[0].height-bounds[1].height)).toBeLessThan(3);
  await expect(viewer.locator('.helper')).not.toContainText('Pinch to zoom');
});
