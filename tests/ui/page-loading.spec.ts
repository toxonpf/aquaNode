import {test,expect} from '@playwright/test';

test('the cover holds while the destination 3D module loads, then reveals a ready scene',async({page})=>{
  let release!:()=>void;
  const held=new Promise<void>(resolve=>{release=resolve});
  await page.route('**/src/features/ocean/scene/Scene.tsx*',async route=>{await held;await route.continue()});
  await page.goto('/about');
  const link=page.locator('header nav a[href="/technology"]'),original=await link.boundingBox();
  await link.click();
  const curtain=page.locator('.page-curtain');
  await expect(page.locator('main h1')).toHaveText('Inside the buoy.');
  await expect(page.locator('.viewer')).toHaveAttribute('data-scene-state','loading');
  await expect(curtain).toHaveAttribute('data-phase','loading');
  const retained=curtain.locator('[data-retained-navigation]');
  await expect(retained).toHaveText('The buoy');await expect(retained).toBeVisible();
  expect(await retained.evaluate(node=>getComputedStyle(node).color.match(/\d+/g)!.slice(0,3).map(Number).every(value=>value>150))).toBe(true);
  const pinned=await retained.boundingBox();
  expect(pinned!.x).toBeCloseTo(original!.x,0);expect(pinned!.y).toBeCloseTo(original!.y,0);
  await page.waitForTimeout(300);
  await expect(curtain).toHaveAttribute('data-phase','loading');
  expect(await curtain.evaluate(el=>{
    const style=getComputedStyle(el),radius=parseFloat(style.getPropertyValue('--cover-radius'));
    const x=parseFloat(style.getPropertyValue('--wave-x')),y=parseFloat(style.getPropertyValue('--wave-y'));
    return radius>Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))&&parseFloat(style.getPropertyValue('--opening-radius'))===0;
  })).toBe(true);
  release();
  await expect(page.locator('.viewer')).toHaveAttribute('data-scene-state',/ready|static/,{timeout:25000});
  await expect(curtain).not.toHaveAttribute('data-active','true');
  await expect(retained).toHaveCount(0);
  await expect(page.locator('main h1')).toBeInViewport();
});

test('direct model visits use the same loading cover and reduced motion bypasses it',async({page})=>{
  await page.goto('/technology');
  await expect(page.locator('.viewer')).toHaveAttribute('data-scene-state',/ready|static/,{timeout:25000});
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/technology');
  await expect(page.locator('.page-curtain')).toHaveCSS('display','none');
  await expect(page.locator('.viewer')).toHaveAttribute('data-scene-state','static');
});
