import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';

test('ocean headings use no more than two complete lines in either language',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});
    for(const language of ['Русский','English']){
      await chooseLanguage(page,language,'.site-header');
      await page.evaluate(()=>document.fonts.ready);
      await expect.poll(()=>page.locator('.story-panel h2,.story-panel h3').evaluateAll(headings=>headings.every(node=>{
        const style=getComputedStyle(node);return node.getBoundingClientRect().height<=parseFloat(style.lineHeight)*2+1&&node.scrollWidth<=node.clientWidth+1;
      }))).toBe(true);
    }
  }
});

test('selected technology text changes its height through intermediate values',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
  await page.setViewportSize({width:390,height:900});await page.goto('/technology');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await page.locator('.tech-path-picker').scrollIntoViewIfNeeded();
  let changed=false;
  for(const index of [1,2,3]){
    await page.evaluate(()=>{
      const node=document.querySelector('.tech-path-text')!,state={active:true,heights:[node.getBoundingClientRect().height]};
      (window as any).heightTrace=state;
      const frame=()=>{if(!state.active)return;state.heights.push(node.getBoundingClientRect().height);requestAnimationFrame(frame)};requestAnimationFrame(frame);
    });
    await page.locator('.tech-path-picker button').nth(index).click();await page.waitForTimeout(700);
    const values=await page.evaluate(()=>{const trace=(window as any).heightTrace;trace.active=false;return trace.heights as number[]});
    if(Math.abs(values.at(-1)!-values[0])>3){
      expect(new Set(values.map(value=>Math.round(value))).size).toBeGreaterThan(3);changed=true;break;
    }
  }
  expect(changed).toBe(true);
});

test('anchor arrows stay compact and build and journal controls have visible hover feedback',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});await page.goto('/build');
  const links=page.locator('.build-hero-actions>a');
  await expect(page.locator('.build-files-link .flexible-arrow--down')).toHaveCount(1);
  await expect(page.locator('.build-files-link .flexible-arrow--up-right')).toHaveCount(0);
  for(const link of await links.all()){
    await link.hover();
    const colour=await link.evaluate(node=>getComputedStyle(node).color.match(/\d+/g)!.slice(0,3).map(Number));
    expect(colour.every(value=>value>150)).toBe(true);
  }
  const anchor=page.locator('.build-hero-actions .arrow-link').first();
  expect(await anchor.locator('.flexible-arrow--down').evaluate(node=>node.getBoundingClientRect().height)).toBeLessThanOrEqual(28);
  const gap=await anchor.evaluate(node=>{
    const text=[...node.childNodes].find(child=>child.nodeType===Node.TEXT_NODE&&child.textContent!.trim())!;
    const range=document.createRange();range.selectNode(text);return node.getBoundingClientRect().bottom-range.getBoundingClientRect().bottom;
  });
  expect(gap).toBeLessThan(15);
  await page.goto('/journal');
  const toggle=page.locator('.journal-entry-toggle').first();await toggle.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
  const rest=await toggle.evaluate(node=>({background:getComputedStyle(node).backgroundColor,colour:getComputedStyle(node).color}));await toggle.hover();
  expect(await toggle.evaluate(node=>getComputedStyle(node).backgroundColor)).toBe(rest.background);
  expect(await toggle.evaluate(node=>getComputedStyle(node).color)).not.toBe(rest.colour);
});

test('the file sheet moves as one piece and completes once after pointer exit',async({page})=>{
  await page.goto('/build');const card=page.locator('.action-download').first();await card.scrollIntoViewIfNeeded();
  const sheet=card.locator('.download-file>svg');await page.mouse.move(0,0);await card.hover();
  await expect.poll(()=>sheet.evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(true);
  await expect(sheet.locator('.download-file-rule')).toHaveCount(2);
  expect(await sheet.locator('.download-file-rule').first().evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(true);
  await page.mouse.move(0,0);
  await expect(card.locator('.download-file-outline')).toHaveCSS('stroke-dasharray','none');
  await expect.poll(()=>sheet.evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(false);
  await expect(sheet).toHaveCSS('transform','none');
});

test('the return hint animates in and keeps its return action',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
  await page.goto('/');await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await page.getByRole('link',{name:'Skip buoy story',exact:true}).click();
  await expect.poll(()=>page.locator('.award').evaluate(node=>Math.abs(node.getBoundingClientRect().top-(document.querySelector('.site-header')?.getBoundingClientRect().height??0)))).toBeLessThan(1);
  await page.waitForTimeout(350);
  await page.evaluate(()=>scrollTo({top:scrollY+600,behavior:'instant'}));await page.mouse.wheel(0,-1800);
  const hint=page.locator('.story-return-hint');await expect(hint).toHaveAttribute('data-visible','true');
  await expect(hint).toHaveCSS('animation-name','story-return-enter');
  await hint.click();await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','signal');
});
