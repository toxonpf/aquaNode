import {test,expect} from '@playwright/test';

test('the cover holds while the destination 3D module loads, then reveals a ready scene',async({page})=>{
  let release!:()=>void;
  const held=new Promise<void>(resolve=>{release=resolve});
  await page.route('**/src/Scene.tsx*',async route=>{await held;await route.continue()});
  await page.goto('/about');
  await page.locator('header nav a[href="/technology"]').click();
  const curtain=page.locator('.page-curtain');
  await expect(page.locator('main h1')).toHaveText('An instrument for asking better questions.');
  await expect(page.locator('.viewer')).toHaveAttribute('data-scene-state','loading');
  await expect(curtain).toHaveAttribute('data-phase','loading');
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
