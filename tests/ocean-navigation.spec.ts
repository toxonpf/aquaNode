import {test,expect,type Page} from '@playwright/test';

async function finishReading(page:Page){
  await page.locator('.ocean-stage').evaluate(stage=>{
    const reader=stage.querySelector<HTMLElement>(`[data-reader="${stage.getAttribute('data-shot')}"] [data-story-scroll]`);
    if(reader)reader.scrollTop=reader.scrollHeight;
  });
}

test('one wheel gesture advances one chapter and ignores momentum during animation',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/,{timeout:30000});
  await page.mouse.wheel(0,1400);
  await expect(stage).toHaveAttribute('data-shot','detail');
  await expect(stage).toHaveAttribute('data-camera-state','moving');
  for(const delta of [1000,600,220,80])await page.mouse.wheel(0,delta);
  await expect(stage).toHaveAttribute('data-shot','detail');
  expect(await page.evaluate(()=>scrollY)).toBeLessThan(110);
  await expect(page.locator('.buoy-introduction')).toHaveCSS('opacity','1');
  await page.waitForTimeout(120);
  await finishReading(page);
  await page.mouse.wheel(0,1400);
  await expect(stage).toHaveAttribute('data-shot','sensing');
  expect(await page.evaluate(()=>scrollY)).toBeLessThan(210);
  for(const delta of [1100,400,60])await page.mouse.wheel(0,delta);
  await expect(stage).toHaveAttribute('data-shot','sensing');
  await expect(page.locator('.sensor-introduction')).toHaveCSS('opacity','1');
  await page.waitForTimeout(120);
  await page.mouse.wheel(0,-1400);
  await expect(stage).toHaveAttribute('data-shot','detail');
});

test('a long wheel burst cannot skip the last chapter or the first content section',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/);
  await page.mouse.wheel(0,1200);
  for(const delta of [900,700,500,250])await page.mouse.wheel(0,delta);
  await expect(stage).toHaveAttribute('data-shot','detail');
  for(const shot of ['sensing','inside','signal']){
    await page.waitForTimeout(320);
    await finishReading(page);
    await page.mouse.wheel(0,1200);
    await expect(stage).toHaveAttribute('data-shot',shot);
  }
  await page.waitForTimeout(320);
  await finishReading(page);
  await page.mouse.wheel(0,1200);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(page.viewportSize()!.height);
  const exit=await page.evaluate(()=>scrollY);
  expect(exit).toBeGreaterThan(page.viewportSize()!.height);
  for(let i=0;i<9;i++){
    await page.waitForTimeout(110);
    await page.mouse.wheel(0,800);
  }
  expect(await page.evaluate(()=>scrollY)).toBe(exit);
  await page.waitForTimeout(330);
  await page.mouse.wheel(0,-1400);
  await expect(stage).toHaveAttribute('data-shot','signal');
  await expect(stage).toBeInViewport();
});

test('keyboard navigation is sequential and sensor buttons retain Space activation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/);
  await page.keyboard.down('PageDown');
  await page.keyboard.down('PageDown');
  await page.keyboard.up('PageDown');
  await expect(stage).toHaveAttribute('data-shot','detail');
  await page.waitForTimeout(320);
  await finishReading(page);
  await page.keyboard.press('PageDown');
  await expect(stage).toHaveAttribute('data-shot','sensing');
  await page.locator('.sensor-picker button').nth(1).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#sensor-explanation')).toContainText('Water temperature');
  await expect(stage).toHaveAttribute('data-shot','sensing');
});

test('a touch swipe changes just one chapter',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/);
  const swipe=()=>page.evaluate(()=>{
    const target=document.querySelector('.ocean-stage')!;
    const point=(y:number)=>new Touch({identifier:1,target,clientX:195,clientY:y});
    target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[point(700)]}));
    for(const y of [655,490,220,80])target.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[point(y)]}));
    target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[]}));
  });
  await swipe();
  await expect(stage).toHaveAttribute('data-shot','detail');
  await page.waitForTimeout(320);
  await swipe();
  await expect(stage).toHaveAttribute('data-shot','detail');
  await expect.poll(()=>page.locator('[data-reader=detail] [data-story-scroll]').evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
  await finishReading(page);
  await swipe();
  await expect(stage).toHaveAttribute('data-shot','sensing');
  expect(await page.evaluate(()=>scrollY)).toBeLessThan(200);
});

test('resizing and re-entering a partly visible story preserve the nearest chapter',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
  await expect(stage).toHaveAttribute('data-shot','detail');
  await page.setViewportSize({width:844,height:390});
  await page.waitForTimeout(350);
  await expect(stage).toHaveAttribute('data-shot','detail');
  await page.evaluate(()=>scrollTo({top:300,behavior:'instant'}));
  await expect(stage).toHaveAttribute('data-shot','signal');
  await page.waitForTimeout(320);
  await page.mouse.move(400,150);
  await page.mouse.wheel(0,-120);
  await expect(stage).toHaveAttribute('data-shot','signal');
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(230);
});
