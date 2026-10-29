import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';

test('portrait curves keep their shape and one hover pass finishes after the pointer leaves',async({page})=>{
  await page.goto('/team');
  const trigger=page.locator('.team-portrait-trigger').first();await trigger.scrollIntoViewIfNeeded();
  const line=trigger.locator('.portrait-current-line').first();
  const before=await line.evaluate(node=>getComputedStyle(node).d);
  const flow=trigger.locator('.portrait-current-flow').first();
  await page.mouse.move(0,0);await expect(flow).toHaveCSS('animation-name','none');
  await trigger.hover();await expect.poll(()=>flow.evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(true);
  await page.waitForTimeout(250);
  expect(await line.evaluate(node=>getComputedStyle(node).d)).toBe(before);
  await page.mouse.move(0,0);expect(await flow.evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(true);
  await expect.poll(()=>flow.evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(false);
  expect(await line.evaluate(node=>parseFloat(getComputedStyle(node).strokeWidth))).toBeGreaterThanOrEqual(1.2);
  expect(await trigger.locator('.team-profile-photo-wave').evaluate(node=>parseFloat(getComputedStyle(node).opacity))).toBeGreaterThan(.65);
  await page.emulateMedia({reducedMotion:'reduce'});
  const rest=await line.evaluate(node=>getComputedStyle(node).d);await page.waitForTimeout(250);
  expect(await line.evaluate(node=>getComputedStyle(node).d)).toBe(rest);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await trigger.click();const portrait=page.getByRole('dialog').locator('.team-profile-portrait');
  await expect(page.getByRole('dialog')).toHaveAttribute('data-profile-phase','open');
  await page.mouse.move(0,0);
  await expect.poll(()=>portrait.locator('.portrait-current-flow').first().evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(false);
  await portrait.hover();await expect.poll(()=>portrait.locator('.portrait-current-flow').first().evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(true);
  await page.waitForTimeout(3800);
  expect(await portrait.locator('.portrait-current-flow').first().evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(false);
  expect(await portrait.locator('.team-profile-photo-label').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBe(12);
});

test('the open-profile badge fades with the flying portrait and Escape depresses its keycap',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  await page.locator('.team-portrait-trigger').first().click();
  const badge=page.locator('.team-flight-open');await expect(badge).toHaveCount(1);
  await expect.poll(()=>badge.evaluate(node=>Number(getComputedStyle(node).opacity))).toBeLessThan(1);
  const dialog=page.getByRole('dialog');await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await expect(dialog.locator('kbd')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await page.keyboard.down('Escape');
  await expect(dialog).toHaveAttribute('data-profile-phase','closing');
  await expect.poll(()=>dialog.locator('kbd').evaluate(node=>
    new DOMMatrix(getComputedStyle(node).transform).m42>1&&Number(getComputedStyle(node.closest('button')!).opacity)>.15
  )).toBe(true);
  await page.keyboard.up('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.team-portrait-trigger').first()).toBeVisible();
});

test('a quiet wave replaces the pagination rule and fits both languages and compact screens',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  await page.locator('.team-portrait-trigger').first().click();
  const dialog=page.getByRole('dialog'),current=dialog.locator('.team-pagination-current');
  await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await expect(dialog.locator('.team-profile-current')).toHaveCount(0);
  await expect(dialog.locator('.team-profile-pagination')).toHaveCSS('border-top-width','0px');
  const before=await current.locator('path').nth(1).getAttribute('d');
  await expect.poll(()=>current.locator('path').nth(1).getAttribute('d')).not.toBe(before);
  const box=await current.boundingBox();expect(box!.height).toBeLessThanOrEqual(24);
  expect(await current.locator('path').nth(1).evaluate(node=>(node as SVGPathElement).getBBox().height)).toBeLessThanOrEqual(6);
  await page.screenshot({path:'test-results/team-profile-details-desktop.png'});
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const language of ['Русский','English']){
    await chooseLanguage(page,language,'.site-header');
    for(const [width,height] of [[390,844],[320,740],[844,390]]){
      await page.setViewportSize({width,height});await page.locator('.team-portrait-trigger').first().click();
      const fits=await dialog.locator('.team-profile-info').evaluate(node=>node.scrollHeight<=node.clientHeight+1);
      expect(fits).toBe(true);
      await expect(dialog.locator('.team-profile-pagination')).toBeInViewport();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
    }
  }
});
