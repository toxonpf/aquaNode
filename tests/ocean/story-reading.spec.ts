import {test,expect} from '@playwright/test';

test('page wheel reads the full chapter before a fresh gesture advances',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
  const reader=page.locator('[data-reader=detail] [data-story-scroll]');
  const documentY=await page.evaluate(()=>scrollY);
  await page.mouse.move(200,450);
  await page.waitForTimeout(320);
  await page.mouse.wheel(0,220);
  await expect.poll(()=>reader.evaluate(node=>node.scrollTop)).toBeGreaterThan(100);
  await expect(stage).toHaveAttribute('data-shot','detail');
  expect(await page.evaluate(()=>scrollY)).toBe(documentY);
  await page.mouse.wheel(0,4000);
  for(const delta of [800,400,200,80])await page.mouse.wheel(0,delta);
  await expect(page.locator('[data-reader=detail]')).toHaveAttribute('data-at-end','true');
  await expect(stage).toHaveAttribute('data-shot','detail');
  await page.waitForTimeout(320);
  await page.mouse.wheel(0,120);
  await expect(stage).toHaveAttribute('data-shot','sensing');
  await page.waitForTimeout(320);
  await page.mouse.wheel(0,-120);
  await expect(stage).toHaveAttribute('data-shot','detail');
  await expect(page.locator('[data-reader=detail]')).toHaveAttribute('data-at-end','true');
  await page.waitForTimeout(320);
  await page.mouse.wheel(0,-240);
  await expect(stage).toHaveAttribute('data-shot','detail');
  await expect(page.locator('[data-reader=detail]')).toHaveAttribute('data-at-end','false');
});

test('keyboard reads before changing chapters and probe controls still work',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
  await page.waitForTimeout(320);
  await page.keyboard.press('PageDown');
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','detail');
  await expect.poll(()=>page.locator('[data-reader=detail] [data-story-scroll]').evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
  await page.getByRole('link',{name:'Explore below the surface',exact:true}).click();
  await page.locator('.sensor-picker button').nth(1).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#sensor-explanation')).toContainText('Water temperature');
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','sensing');
});

test('readers fit all scene layouts and retain readable text on small screens',async({page})=>{
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/,{timeout:30000});
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:width===390?844:900});
    for(const [chapter,label] of [['detail','Meet the buoy'],['sensing','Explore below the surface'],['inside','See inside the buoy'],['signal','Follow the signal']]){
      await page.getByRole('link',{name:label,exact:true}).click();
      await expect(stage).toHaveAttribute('data-camera-state','settled');
      await page.waitForTimeout(800);
      const reader=page.locator(`[data-reader=${chapter}] [data-story-scroll]`);
      await expect(reader).toBeInViewport();
      expect(await reader.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(chapter==='detail'||chapter==='signal')await page.screenshot({path:`test-results/reader-${chapter}-${width}.png`});
    }
  }
});
