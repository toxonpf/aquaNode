import {test,expect} from '@playwright/test';

const routes=[['/','.status-grid p'],['/about','.about-idea-copy>p:not(.kicker):not(.lead)'],
  ['/technology','.tech-hero-copy>p:not(.kicker)'],['/build','.build-step-content>p'],
  ['/journal','.journal article p:not(.kicker)'],['/team','.team-person-info>p']];

test('desktop routes share their header and keep readable text at browser zoom',async({browser})=>{
  test.setTimeout(120000);
  const navigationReference=new Map<string,{left:number;right:number}>();
  for(const zoom of [1,1.3,1.5]){
    const width=Math.round(1920/zoom),height=Math.round(1080/zoom);
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:zoom,reducedMotion:'reduce'});
    const page=await context.newPage();
    await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
    try{
      for(const [route,prose] of routes){
        await page.goto(`http://127.0.0.1:5173${route}`);
        for(const language of ['Русский','English']){
          await page.locator('.site-header').getByRole('button',{name:language,exact:true}).click();
          await page.evaluate(()=>document.fonts.ready);
          const header=await page.locator('.site-header').boundingBox(),logo=await page.locator('.site-header>.logo').boundingBox();
          expect(header!.height,`${route} header at ${zoom}`).toBeCloseTo(64,0);
          expect(logo!.x/width,`${route} gutter at ${zoom}`).toBeCloseTo(.045,3);
          expect((await page.locator('.site-header .brand-mark').boundingBox())!.width).toBeCloseTo(148,0);
          await expect(page.locator('.site-header>nav')).toBeVisible();
          const boxes=await page.locator('.site-header>.logo,.site-header>nav,.site-header>.header-tools').evaluateAll(nodes=>nodes.map(node=>{const b=node.getBoundingClientRect();return {left:b.left,right:b.right}}));
          expect(boxes[0].right).toBeLessThan(boxes[1].left);expect(boxes[1].right).toBeLessThan(boxes[2].left);
          const navigationKey=zoom+language;
          if(route==='/')navigationReference.set(navigationKey,boxes[1]);
          else{
            const expected=navigationReference.get(navigationKey)!;
            expect(boxes[1].left,`${route} navigation matches ocean`).toBeCloseTo(expected.left,0);
            expect(boxes[1].right,`${route} navigation matches ocean`).toBeCloseTo(expected.right,0);
          }
          const body=await page.locator(prose).first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
          expect(body,`${route} readable prose at ${zoom}`).toBeGreaterThanOrEqual(16);
          expect(body).toBeLessThanOrEqual(20);
          expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        }
      }
    }finally{await context.close()}
  }
});

test('ocean UI follows the same outer grid without the camera frame side margins',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[1920,983],[1477,756],[1280,720],[2560,1080]]){
    await page.setViewportSize({width,height});await page.goto('/');
    for(const [href,chapter] of [['#buoy-sensors','sensing'],['#buoy-inside','inside'],['#buoy-intro','detail'],['#buoy-signal','signal']]){
      await page.locator(`.ocean-chapters a[href="${href}"]`).click();
      await expect(page.locator('.ocean-stage')).toHaveAttribute('data-camera-state','settled');
      const panel=await page.locator(`[data-reader=${chapter}]`).boundingBox();
      const gutter=['sensing','inside'].includes(chapter)?panel!.x:width-panel!.x-panel!.width;
      const expected=['sensing','inside'].includes(chapter)?width*.045:Math.max(width*.045,88);
      expect(gutter).toBeCloseTo(expected,0);
    }
  }
});

test('touch pages retain normal reading sizes and a menu header',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
  try{
    for(const [route,prose] of routes){
      await page.goto(`http://127.0.0.1:5173${route}`,{waitUntil:'domcontentloaded'});
      await page.locator('.site-header').getByRole('button',{name:'Русский',exact:true}).click();
      expect((await page.locator('.site-header').boundingBox())!.height).toBe(56);
      await expect(page.locator('.site-header .menu-button')).toBeVisible();
      expect(await page.locator(prose).first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }finally{await context.close()}
});
