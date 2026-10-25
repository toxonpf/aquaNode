import {test,expect,type Page} from '@playwright/test';

async function record(page:Page){
  await page.evaluate(()=>{
    const state={active:true,values:[scrollY]};(window as any).scrollTrace=state;
    const frame=()=>{if(!state.active)return;state.values.push(scrollY);requestAnimationFrame(frame)};
    requestAnimationFrame(frame);
  });
}
async function frames(page:Page){
  return page.evaluate(()=>{const state=(window as any).scrollTrace;state.active=false;return state.values as number[]});
}

for(const route of ['/team','/'])test(`real wheel input eases down and up without reversals or lost distance (${route})`,async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto(route);
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  if(route==='/'){
    await page.getByRole('link',{name:'Skip buoy story',exact:true}).click();
    await expect.poll(()=>page.locator('.award').evaluate(node=>Math.abs(node.getBoundingClientRect().top-(document.querySelector('.site-header')?.getBoundingClientRect().height??0)))).toBeLessThan(1);
    await page.waitForTimeout(350);
  }
  await page.evaluate(()=>scrollTo({top:scrollY+1000,behavior:'instant'}));
  // The overview loads a second model as it enters this viewport. Measure
  // scrolling after its first frame, rather than shader compilation time.
  if(route==='/')await expect(page.locator('.node-viewer')).toHaveAttribute('data-scene-state',/^(ready|static)$/);
  const start=await page.evaluate(()=>scrollY);
  await page.mouse.move(900,450);
  for(const sign of [1,-1]){
    await record(page);await page.mouse.wheel(0,480*sign);
    await page.waitForTimeout(520);
    const values=await frames(page),distance=(values.at(-1)!-values[0])*sign;
    expect(distance).toBeGreaterThan(475);expect(distance).toBeLessThan(485);
    expect(new Set(values).size).toBeGreaterThan(5);
    expect(values.some(value=>(value-values[0])*sign>5&&(value-values[0])*sign<420)).toBe(true);
    expect(values.slice(1).every((value,i)=>(value-values[i])*sign>=-1)).toBe(true);
  }
  expect(await page.evaluate(()=>scrollY)).toBeCloseTo(start,0);
  await page.mouse.wheel(0,600);await page.waitForTimeout(65);
  await page.mouse.wheel(0,-300);await record(page);
  await page.waitForTimeout(520);
  const reverse=await frames(page);
  expect(reverse.at(-1)!).toBeLessThan(reverse[0]-200);
  expect(reverse.slice(1).every((value,i)=>value<=reverse[i]+1)).toBe(true);
});

test('reduced motion and open profiles bypass document easing',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/team');
  const prevented=await page.evaluate(()=>!document.body.dispatchEvent(new WheelEvent('wheel',{deltaY:200,bubbles:true,cancelable:true})));
  expect(prevented).toBe(false);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'View profile of Timur Kuandykov'}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toHaveAttribute('data-profile-phase','open');
  const before=await page.evaluate(()=>scrollY);await dialog.hover();await page.mouse.wheel(0,500);await page.waitForTimeout(500);
  expect(await page.evaluate(()=>scrollY)).toBe(before);
});
