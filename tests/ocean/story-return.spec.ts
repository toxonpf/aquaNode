import {test,expect,type Page} from '@playwright/test';

async function leaveStory(page:Page){
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await page.evaluate(()=>document.fonts.ready);
 await page.getByRole('link',{name:'Skip buoy story',exact:true}).click();
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','false');
 const edge=await page.evaluate(()=>scrollY);
 await page.evaluate(edge=>scrollTo({top:edge+600,behavior:'instant'}),edge);
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','false');
 return edge;
}

for(const width of [1440,390])test(`scrolling up first stops at the document boundary, then returns to the last chapter (${width})`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const edge=await leaveStory(page);
 await page.mouse.wheel(0,-1800);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(edge);
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','true');
 const hint=await page.locator('.story-return-hint').boundingBox();
 const award=await page.locator('.award').boundingBox();
 expect(hint!.y).toBeGreaterThan(award!.y+award!.height);
 expect(hint!.y+hint!.height).toBeLessThan(230);
 expect(hint!.x+hint!.width/2).toBeCloseTo(width/2,0);
 for(const delta of [700,400,200,100,50,25]){await page.waitForTimeout(60);await page.mouse.wheel(0,-delta)}
 expect(await page.evaluate(()=>scrollY)).toBe(edge);
 // Capturing an image can outlast the gesture pause; do it after its tail.
 await page.screenshot({path:`test-results/story-return-hint-${width}.png`});
 await page.waitForTimeout(330);await page.mouse.wheel(0,-120);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(500);
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','signal');
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','false');
 const remaining=await page.locator('[data-reader=signal] [data-story-scroll]').evaluate(node=>node.scrollHeight-node.clientHeight-node.scrollTop);
 expect(remaining).toBeLessThanOrEqual(.5);
});

for(const width of [1440,390])test(`the centred return hint can be clicked to enter the ocean (${width})`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await leaveStory(page);await page.mouse.wheel(0,-1800);
 const button=page.getByRole('button',{name:'Return to the ocean',exact:true});
 await expect(button).toBeVisible();await expect(button).toBeEnabled();
 await button.click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(500);
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','signal');
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','false');
});

test('a held PageUp stops at the boundary and a fresh press returns to the ocean',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 const edge=await leaveStory(page);
 // Blur without Playwright scrolling the whole body into view.
 await page.evaluate(()=>(document.activeElement as HTMLElement)?.blur());
 expect(await page.evaluate(()=>scrollY)).toBe(edge+600);
 await page.keyboard.down('PageUp');
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(edge);
 for(let i=0;i<3;i++){await page.waitForTimeout(120);await page.keyboard.down('PageUp')}
 expect(await page.evaluate(()=>scrollY)).toBe(edge);
 await page.keyboard.up('PageUp');await page.waitForTimeout(330);await page.keyboard.press('PageUp');
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(500);
});

test('the animated boundary and return finish without crossing into an earlier scene',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'Skip buoy story',exact:true}).click();
 await expect.poll(()=>page.locator('.award').evaluate(node=>Math.abs(node.getBoundingClientRect().top-(document.querySelector('.site-header')?.getBoundingClientRect().height??0)))).toBeLessThan(1);
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-camera-state','settled');
 const edge=await page.evaluate(()=>scrollY);
 const anchor=await page.locator('.ocean-story').evaluate(node=>node.offsetTop+node.offsetHeight-document.querySelector('.ocean-stage')!.clientHeight);
 await page.evaluate(edge=>scrollTo({top:edge+500,behavior:'instant'}),edge);
 await page.mouse.wheel(0,-1600);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(edge);
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','true');
 await page.waitForTimeout(330);await page.mouse.wheel(0,-120);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(anchor);
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','signal');
});

test('touch input needs a second swipe to re-enter the story',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const edge=await leaveStory(page);
 await page.evaluate(edge=>scrollTo({top:edge+150,behavior:'instant'}),edge);
 const swipe=()=>page.evaluate(()=>{
  const target=document.querySelector('.award')!;
  const point=(y:number)=>new Touch({identifier:1,target,clientX:195,clientY:y});
  target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[point(200)]}));
  for(const y of [450,550,650])target.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[point(y)]}));
  target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[]}));
 });
 await swipe();expect(await page.evaluate(()=>scrollY)).toBe(edge);
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','true');
 await swipe();await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(500);
});

test('outbound icon waves strengthen smoothly and respect reduced motion',async({page})=>{
 await page.goto('/about');
 const link=page.locator('.about-recognition .action-external'),shaft=link.locator('.external-link-shaft');
 await link.scrollIntoViewIfNeeded();await page.mouse.move(5,100);
 const scale=()=>shaft.evaluate(node=>new DOMMatrix(getComputedStyle(node).transform).d);
 await expect(shaft).toHaveCSS('animation-name','external-link-wave');
 await expect.poll(scale).toBeCloseTo(.25,2);
 await link.hover();
 const samples=await shaft.evaluate(node=>new Promise<number[]>(resolve=>{
  const start=performance.now(),values:number[]=[];
  const sample=()=>{values.push(new DOMMatrix(getComputedStyle(node).transform).d);if(performance.now()-start<550)requestAnimationFrame(sample);else resolve(values)};sample();
 }));
 expect(samples.some(value=>value>.3&&value<.95)).toBe(true);
 await expect.poll(scale).toBeCloseTo(1,2);
 await expect(link.locator('.external-link-frame-current')).toHaveCSS('animation-play-state','running');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(shaft).toHaveCSS('animation-name','none');
});

test('animated upward input never exposes the ocean before a deliberate second gesture',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'Skip buoy story',exact:true}).click();
 await expect.poll(()=>page.locator('.award').evaluate(node=>Math.abs(node.getBoundingClientRect().top-(document.querySelector('.site-header')?.getBoundingClientRect().height??0)))).toBeLessThan(1);
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','false');
 const edge=await page.evaluate(()=>scrollY);
 await page.evaluate(edge=>scrollTo({top:edge+80,behavior:'instant'}),edge);
 await page.evaluate(()=>{
  const state={running:true,frames:[] as number[]};(window as any).boundaryFrames=state;
  const sample=()=>{state.frames.push(scrollY);if(state.running)requestAnimationFrame(sample)};sample();
 });
 for(const delta of [-18,-24,-40,-80,-45,-24,-12,-6]){await page.mouse.wheel(0,delta);await page.waitForTimeout(35)}
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(edge);
 await expect(page.locator('.story-return-hint')).toHaveAttribute('data-visible','true');
 const frames=await page.evaluate(()=>{const state=(window as any).boundaryFrames;state.running=false;return state.frames as number[]});
 expect(frames.length).toBeGreaterThan(10);expect(Math.min(...frames)).toBeGreaterThanOrEqual(edge);
});
