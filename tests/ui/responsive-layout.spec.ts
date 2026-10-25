import {test,expect} from '@playwright/test';

const sizes=[
  [2560,1440],[1920,1080],[1440,900],[1366,768],[1280,800],
  [1093,614],[1024,640],[911,512],[768,1024],[683,384],[430,932],[390,844],[360,740],[320,568],
];
const settle=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));

test('all reading layouts fit desktop, scaled laptop and mobile viewports',async({page})=>{
  test.setTimeout(180000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['/','/about','/technology','/build','/journal','/team']){
    await page.goto(route);
    for(const language of ['Русский','English']){
      await page.locator('.site-header').getByRole('button',{name:language,exact:true}).click();
      await page.evaluate(()=>document.fonts.ready);
      for(const [width,height] of sizes){
        await page.setViewportSize({width,height});await page.evaluate(settle);
        const issues=await page.evaluate(()=>{
          const outside=[...document.querySelectorAll<HTMLElement>('main h1,main h2,main h3,main p,main a,main button')].flatMap(node=>{
            const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
            if(!rect.width||!rect.height||style.visibility==='hidden'||node.closest('.ocean-stage,[aria-hidden=true]'))return [];
            return rect.left< -2||rect.right>innerWidth+2?[node.className+': '+node.textContent?.slice(0,50)]:[];
          });
          return {pageOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),outside};
        });
        expect.soft(issues,`${route}, ${language}, ${width} × ${height}`).toEqual({pageOverflow:0,outside:[]});
        if(width>=1024){
          await expect.soft(page.locator('.site-header>nav')).toBeVisible();
          const boxes=await page.locator('.site-header>.logo,.site-header>nav,.site-header>.header-tools').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right}}));
          expect.soft(boxes[0].right<=boxes[1].left&&boxes[1].right<=boxes[2].left,`header at ${width}`).toBe(true);
        }
      }
    }
  }
});

test('the technology model appears early and its controls fit a phone',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.addInitScript(()=>localStorage.setItem('aquanode.locale','en'));
  await page.goto('http://127.0.0.1:5173/technology',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await expect(page.locator('.tech-model .viewer')).toHaveAttribute('data-scene-state',/ready|static/);
  const heading=await page.locator('.tech-hero h1').boundingBox(),model=await page.locator('.tech-model').boundingBox();
  expect(model!.y).toBeLessThan(280);expect(model!.y).toBeGreaterThan(heading!.y+heading!.height);
  const controls=page.locator('.tech-model .viewer-controls');
  if(await controls.isVisible()){
    const buttons=await controls.locator('button').all();
    const tops=await Promise.all(buttons.map(async button=>(await button.boundingBox())!.y));
    expect(Math.max(...tops)-Math.min(...tops)).toBeLessThan(2);
    await page.getByRole('button',{name:'Separate parts',exact:true}).click();
    await expect(page.getByRole('button',{name:'Close structure',exact:true})).toHaveAttribute('aria-pressed','true');
    await page.getByRole('button',{name:'Reset',exact:true}).click();
  }
  await page.locator('.tech-model .part-tabs button').last().click();
  await expect(page.locator('.tech-model .part-tabs button').last()).toHaveAttribute('aria-pressed','true');
  await page.screenshot({path:'test-results/responsive-technology-live-mobile.png'});
  await context.close();
});

test('small member dialogs keep the complete text and pagination reachable',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/team');
  for(const [width,height] of [[1093,614],[390,844],[320,568],[683,384]]){
    await page.setViewportSize({width,height});
    await page.locator('.team-portrait-trigger').first().click();
    const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
    const close=await page.locator('.team-dialog-close').boundingBox();
    expect(close!.y).toBeGreaterThanOrEqual(0);expect(close!.x+close!.width).toBeLessThanOrEqual(width);
    await expect(dialog.locator('.team-profile-intro')).toBeVisible();
    await dialog.getByRole('button',{name:'Next team member',exact:true}).scrollIntoViewIfNeeded();
    await dialog.getByRole('button',{name:'Next team member',exact:true}).click();
    await expect(dialog.locator('h2')).toHaveText('Roman Benzler');
    await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  }
});

test('every ocean reader stays below navigation and above the lower controls',async({browser})=>{
  for(const [width,height] of [[1093,614],[911,512],[390,844],[320,568],[683,384]]){
    const mobile=width<=430,scale=Math.min(width/1920,height/1080);
    const context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'});
    const page=await context.newPage();await page.goto('http://127.0.0.1:5173/');
    for(const [href,chapter] of [['#buoy-intro','detail'],['#buoy-sensors','sensing'],['#buoy-inside','inside'],['#buoy-signal','signal']]){
      await page.locator(`.ocean-chapters a[href="${href}"]`).click();
      await expect(page.locator('.ocean-stage')).toHaveAttribute('data-camera-state','settled');
      const panel=page.locator(`[data-reader=${chapter}]`),reader=panel.locator('[data-story-scroll]');
      const bounds=await reader.boundingBox(),status=await panel.locator('.story-reading-status').boundingBox();
      expect(bounds!.y,`${chapter} at ${width}`).toBeGreaterThan(mobile?112:64*scale);
      expect(bounds!.height).toBeGreaterThanOrEqual(height<=500?90:140);
      expect(status!.y+status!.height,`${chapter} at ${width}`).toBeLessThanOrEqual(height-(width>760||height<=500?40:92));
      const hint=await panel.locator('..').locator('.story-dive').boundingBox();
      if(hint)expect(status!.y+status!.height,`reading status clear of hint: ${chapter}, ${width}`).toBeLessThanOrEqual(hint.y-(mobile?10:10*scale));
      expect(await reader.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
    }
    await page.screenshot({path:`test-results/responsive-ocean-${width}.png`});
    await context.close();
  }
});
