import {test,expect} from '@playwright/test';

test('header keeps navigation centred and tools separate in both languages',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const language of ['ru','en']){
    await page.goto('/journal');
    await page.evaluate(language=>localStorage.setItem('aquanode.locale',language),language);await page.reload();
    await page.evaluate(()=>document.fonts.ready);
    for(const width of [1920,1440,1280,1200,1024,768,390,320]){
      await page.setViewportSize({width,height:1000});
      const logo=await page.locator('.site-header>.logo').boundingBox();
      const tools=await page.locator('.header-tools').boundingBox();
      expect(logo!.x+logo!.width,`${language} ${width} logo`).toBeLessThan(tools!.x);
      expect(tools!.x+tools!.width,`${language} ${width} tools`).toBeLessThanOrEqual(width);
      if(await page.locator('#navigation').isVisible()){
        const nav=await page.locator('#navigation').boundingBox();
        expect(Math.abs(nav!.x+nav!.width/2-width/2),`${language} ${width} centre`).toBeLessThan(1);
        expect(logo!.x+logo!.width).toBeLessThan(nav!.x);
        expect(nav!.x+nav!.width).toBeLessThan(tools!.x);
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
      if(width===390){
        await page.locator('.menu-button').click();
        const nav=await page.locator('#navigation').boundingBox();
        expect(nav!.width).toBe(width);
        await page.locator('.menu-button').click();
      }
      if(width===1440||width===390)await page.locator('.site-header').screenshot({path:`test-results/header-${language}-${width}.png`});
    }
  }
});

test('footer current moves smoothly in view and pauses for reduced motion',async({page})=>{
  await page.goto('/journal');
  const path=page.locator('.footer-current path');
  await path.scrollIntoViewIfNeeded();
  const before=await path.getAttribute('d');
  await expect.poll(()=>path.getAttribute('d')).not.toBe(before);
  for(let index=0;index<3;index++){
    const ends=await path.evaluate(node=>{const line=node as SVGPathElement;return [line.getPointAtLength(0),line.getPointAtLength(line.getTotalLength())].map(p=>({x:p.x,y:p.y}))});
    expect(ends[0]).toEqual({x:0,y:35});expect(ends[1]).toEqual({x:1440,y:35});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  const paused=await path.getAttribute('d');
  await page.waitForTimeout(200);
  expect(await path.getAttribute('d')).toBe(paused);
});

test('Russian typography is loaded locally and gallery photos fit the profiles',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/team');
  await page.evaluate(()=>localStorage.setItem('aquanode.locale','ru'));await page.reload();
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.locator('h1').evaluate(node=>getComputedStyle(node).fontFamily)).toContain('Golos Text');
  expect(await page.evaluate(()=>document.fonts.check('400 18px "Golos Text"','Наблюдение'))).toBe(true);
  const photo=page.locator('.team-portrait-trigger .team-card-photo>img').first();
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toHaveJSProperty('complete',true);
  expect(await photo.evaluate((node:HTMLImageElement)=>node.naturalWidth)).toBeGreaterThan(0);
  await page.locator('.team-person').first().screenshot({path:'test-results/team-photo-card.png'});
  await page.locator('.team-portrait-trigger').first().click();
  const dialog=page.getByRole('dialog');
  const close=dialog.getByRole('button',{name:'Закрыть',exact:true});
  await expect(close).toBeFocused();
  await expect(close.locator('.team-close-icon')).toBeVisible();
  await dialog.screenshot({path:'test-results/team-profile-close.png'});
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.team-portrait-trigger').first()).toBeFocused();
});
