import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';

test('language changes in place, including editorial catalogs and metadata',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/journal');
  await page.locator('.journal-entry-toggle').first().click();
  await expect(page.locator('.journal-entry').first()).toHaveAttribute('data-open','false');
  await page.evaluate(()=>{(window as any).__mountedMain=document.querySelector('main')});
  let navigations=0;page.on('request',request=>{if(request.isNavigationRequest())navigations++});
  await chooseLanguage(page,'Русский','.site-header');
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(page.locator('h1')).toHaveText('Наша работа на сегодня.');
  await expect(page).toHaveTitle('Журнал — AquaNode');
  await expect(page.locator('.journal-entry').first()).toHaveAttribute('data-open','false');
  await expect(page.locator('.journal-entry h3').first()).not.toHaveText('Software evidence, with clear limits');
  expect(await page.evaluate(()=>document.querySelector('main')===(window as any).__mountedMain)).toBe(true);
  expect(navigations).toBe(0);
  await chooseLanguage(page,'English','.site-header');
  await expect(page.locator('.journal-entry h3').first()).toHaveText('Software evidence, with clear limits');
  expect(await page.evaluate(()=>localStorage.getItem('aquanode.locale'))).toBe('en');
  expect(navigations).toBe(0);
});

test('language keeps selected technology controls and the existing 3D canvas',async({page})=>{
  await page.goto('/technology');
  await expect(page.locator('canvas')).toBeVisible();
  await page.evaluate(()=>{(window as any).__sceneCanvas=document.querySelector('canvas')});
  await page.locator('.circuit-node').nth(2).click();
  await page.evaluate(()=>{(window as any).__languageScroll=scrollY});
  await chooseLanguage(page,'Русский','.site-header');
  await expect(page.locator('.circuit-node').nth(2)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.circuit-node').nth(2)).toContainText('Температура');
  await expect(page.locator('.circuit-inspector-meta>span').first()).toHaveText('ТЕМПЕРАТУРНЫЙ ВХОД');
  expect(await page.evaluate(()=>document.querySelector('canvas')===(window as any).__sceneCanvas)).toBe(true);
  // Reflow may move the reading position slightly; changing language must not jump to the top.
  expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(500);
});

test('ocean language changes preserve the chapter and selected probe',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.ocean-stage.is-presented')).toBeVisible();
  await page.getByRole('navigation',{name:'Buoy story'}).getByRole('link',{name:'Explore below the surface',exact:true}).click();
  await page.getByRole('button',{name:/Temperature/}).click();
  await page.evaluate(()=>{(window as any).__oceanStage=document.querySelector('.ocean-stage')});
  const description=await page.locator('#sensor-explanation p').textContent();
  await chooseLanguage(page,'Русский','.site-header');
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','sensing');
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-sensor','temperature');
  await expect(page.locator('#sensor-explanation p')).not.toHaveText(description!);
  expect(await page.evaluate(()=>document.querySelector('.ocean-stage')===(window as any).__oceanStage)).toBe(true);
});

test('member dialog is narrower, uses its text width and photos cover every edge',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/team');
  for(const width of [1440,1024,390,320]){
    await page.setViewportSize({width,height:1000});
    for(const index of [0,1]){
      const button=page.locator('.team-portrait-trigger').nth(index);
      await button.scrollIntoViewIfNeeded();
      const coverage=await button.locator('img').evaluate(img=>{
        const image=img.getBoundingClientRect(),card=img.closest('figure')!.getBoundingClientRect();
        return {left:card.left-image.left,right:image.right-card.right,top:card.top-image.top,bottom:image.bottom-card.bottom};
      });
      for(const edge of Object.values(coverage))expect(edge).toBeGreaterThanOrEqual(.8);
      await button.click();
      const dialog=page.getByRole('dialog');
      if(width===1440)expect((await dialog.boundingBox())!.width).toBe(1000);
      const text=await dialog.locator('.team-profile-intro').evaluate(node=>{
        const parent=node.parentElement!,style=getComputedStyle(parent);
        return {actual:node.getBoundingClientRect().width,expected:parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)};
      });
      expect(Math.abs(text.actual-text.expected)).toBeLessThan(1);
      expect(await dialog.locator('.team-profile-info').evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
      await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
    }
  }
});

test('custom cursor reacts to links and stays available in native dialogs',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  await page.evaluate(()=>window.cursorStyle(1));
  await page.mouse.move(740,250);
  const cursor=page.locator('.site-cursor');
  await expect(cursor).toHaveAttribute('data-visible','true');
  await expect(page.locator('html')).toHaveAttribute('data-custom-cursor','true');
  await page.locator('.site-header .logo').hover();
  await expect(cursor).toHaveAttribute('data-mode','link');
  await page.locator('.team-portrait-trigger').first().click();
  const dialog=page.getByRole('dialog');await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await dialog.getByRole('button',{name:'Close',exact:true}).hover();
  await expect(dialog.locator('.site-cursor')).toHaveAttribute('data-visible','true');
  await expect(cursor).toHaveAttribute('data-mode','link');
  await page.screenshot({path:'test-results/custom-cursor-profile.png'});
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  await page.mouse.move(740,250);await expect(page.locator('body>.site-cursor')).toHaveAttribute('data-visible','true');
  await page.keyboard.press('Tab');await expect(cursor).toHaveAttribute('data-visible','false');
  await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(745,255);
  await expect(page.locator('html')).not.toHaveAttribute('data-custom-cursor');
  await expect(cursor).not.toBeVisible();
});

test('water cursor stays on the hotspot, has a bounded wake and responds to portraits and clicks',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  await page.evaluate(()=>window.cursorStyle(1));
  await page.mouse.move(740,250);
  const cursor=page.locator('.site-cursor'),line=cursor.locator('.site-cursor-current');
  await expect(line).toHaveAttribute('d',/^M64\.00 64\.00C/);
  await page.mouse.move(800,290,{steps:4});
  const first=await line.getAttribute('d');
  await expect.poll(()=>line.getAttribute('d')).not.toBe(first);
  await page.mouse.move(50,400);await page.mouse.move(1380,900);
  await expect.poll(()=>cursor.locator('.site-cursor-tip').evaluate(node=>{
    const r=node.getBoundingClientRect();return Math.hypot(r.x+r.width/2-1380,r.y+r.height/2-900);
  })).toBeLessThan(1);
  const wake=await line.evaluate(node=>{const box=(node as SVGPathElement).getBBox();return {width:box.width,height:box.height}});
  expect(wake.width).toBeLessThan(90);expect(wake.height).toBeLessThan(90);
  await page.locator('.site-header .logo').hover();
  await expect.poll(()=>cursor.locator('.site-cursor-head[data-bearing=ne]').evaluate(node=>Number(getComputedStyle(node).opacity))).toBeGreaterThan(.95);
  await page.mouse.down();
  await expect.poll(()=>cursor.locator('.site-cursor-splash').evaluate(node=>Number(getComputedStyle(node).opacity))).toBeGreaterThan(.1);
  await page.mouse.move(740,250);await page.mouse.up();
  await page.locator('.team-portrait-trigger').first().hover();
  await expect(cursor).toHaveAttribute('data-mode','portrait');
  await expect(cursor.locator('.site-cursor-label')).toHaveCSS('opacity','1');
  await expect(page.locator('.team-portrait-cursor').first()).not.toBeVisible();
  await page.screenshot({path:'test-results/water-cursor-portrait.png'});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.mouse.move(5,5);await page.mouse.move(1400,950);await page.mouse.move(50,70);
  await expect(line).not.toHaveAttribute('d',/NaN|Infinity/);
  expect(errors).toEqual([]);
});
