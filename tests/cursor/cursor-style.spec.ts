import {test,expect} from '@playwright/test';
import type {} from '../../src/features/cursor/cursorStyle';

test('console switches between native and water cursors without moving the pointer or reloading',async({page})=>{
  await page.goto('/team');await page.mouse.move(740,250);
  const cursor=page.locator('.site-cursor');
  await expect(cursor).not.toBeVisible();
  expect(await page.evaluate(()=>window.cursorStyle())).toBe(0);
  await page.evaluate(()=>{(window as any).__cursorMain=document.querySelector('main')});
  expect(await page.evaluate(()=>window.cursorStyle(1))).toBe(1);
  await expect(cursor).toHaveAttribute('data-visible','true');
  expect(await page.evaluate(()=>window.cursorStyle(0))).toBe(0);
  await expect(cursor).not.toBeVisible();
  await expect(page.locator('html')).not.toHaveAttribute('data-custom-cursor');
  expect(await page.evaluate(()=>getComputedStyle(document.body).cursor)).not.toBe('none');
  const line=await cursor.locator('.site-cursor-current').getAttribute('d');
  await page.mouse.move(800,300);await page.waitForTimeout(100);
  expect(await cursor.locator('.site-cursor-current').getAttribute('d')).toBe(line);
  expect(await page.evaluate(()=>window.cursorStyle(1))).toBe(1);
  await expect(cursor).toHaveAttribute('data-visible','true');
  await expect.poll(()=>cursor.locator('.site-cursor-tip').evaluate(node=>{
    const rect=node.getBoundingClientRect();return Math.hypot(rect.x+rect.width/2-800,rect.y+rect.height/2-300);
  })).toBeLessThan(1);
  expect(await page.evaluate(()=>document.querySelector('main')===(window as any).__cursorMain)).toBe(true);
  await page.locator('.team-portrait-trigger').first().click();
  const dialog=page.getByRole('dialog');await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await dialog.getByRole('button',{name:'Close',exact:true}).hover();
  await page.evaluate(()=>window.cursorStyle(0));await expect(cursor).not.toBeVisible();
  expect(await dialog.getByRole('button',{name:'Close',exact:true}).evaluate(node=>getComputedStyle(node).cursor)).not.toBe('none');
  await page.evaluate(()=>window.cursorStyle(1));
  await expect(dialog.locator('.site-cursor')).toHaveAttribute('data-visible','true');
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});

test('cursor selection persists and invalid values do not alter it',async({page})=>{
  await page.goto('/journal');await page.evaluate(()=>window.cursorStyle(0));
  await page.locator('#navigation a[href="/about"]').click();
  await expect(page.locator('h1')).toHaveText('From the classroom to the shoreline.');
  expect(await page.evaluate(()=>window.cursorStyle())).toBe(0);
  await page.reload();await page.mouse.move(500,300);
  await expect(page.locator('html')).toHaveAttribute('data-cursor-style','0');
  await expect(page.locator('.site-cursor')).not.toBeVisible();
  const rejected=await page.evaluate(()=>[-1,2,1.5,NaN,Infinity,'1',null,undefined].map(value=>{
    try{(window.cursorStyle as (id:unknown)=>number)(value);return false}catch(error){return error instanceof RangeError}
  }));
  expect(rejected).toEqual(Array(8).fill(true));
  expect(await page.evaluate(()=>window.cursorStyle())).toBe(0);
  expect(await page.evaluate(()=>localStorage.getItem('aquanode:cursor-style'))).toBe('0');
  await page.evaluate(()=>window.cursorStyle(1));await page.reload();
  await expect(page.locator('.site-cursor')).toBeAttached();
  // Chrome need not emit a pointermove for the same coordinates after reload.
  await page.mouse.move(520,320);
  await expect(page.locator('html')).toHaveAttribute('data-cursor-style','1');
  await expect(page.locator('.site-cursor')).toHaveAttribute('data-visible','true');
});

test('blocked storage does not prevent switching cursor styles',async({page})=>{
  await page.addInitScript(()=>{
    Storage.prototype.getItem=()=>{throw new DOMException('Blocked','SecurityError')};
    Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError')};
  });
  await page.goto('/about');await page.mouse.move(500,300);
  expect(await page.evaluate(()=>window.cursorStyle())).toBe(0);
  await page.evaluate(()=>window.cursorStyle(0));await expect(page.locator('.site-cursor')).not.toBeVisible();
  await page.evaluate(()=>window.cursorStyle(1));
  await expect(page.locator('.site-cursor')).toHaveAttribute('data-visible','true');
});
