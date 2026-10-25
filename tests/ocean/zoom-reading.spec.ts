import {test,expect} from '@playwright/test';
import {readingMetrics} from '../../src/features/ocean/story/readingMetrics';

test('fractional scroll limits use one end condition for progress and navigation',()=>{
  for(const remainder of [.55,.8,1,1.5,2]){
    const state=readingMetrics({scrollHeight:640,clientHeight:600,scrollTop:40-remainder});
    expect(state.atEnd).toBe(true);expect(state.progress).toBe(1);
  }
  expect(readingMetrics({scrollHeight:640,clientHeight:600,scrollTop:37}).atEnd).toBe(false);
});

for(const zoom of [1,1.3,1.5,2,2.5]){
  test(`desktop at ${zoom*100}% keeps controls apart and leaves the read chapter`,async({browser})=>{
    test.setTimeout(60000);
    const width=Math.round(1366/zoom),height=Math.round(768/zoom),scale=Math.min(width/1920,height/1080);
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:zoom,reducedMotion:'reduce'});
    const page=await context.newPage();
    try{
      await page.goto('http://127.0.0.1:5173/');
      await page.locator('.site-header').getByRole('button',{name:'Русский',exact:true}).click();
      await page.evaluate(()=>document.fonts.ready);
      const header=await page.locator('.site-header').boundingBox();
      const navigation=await page.locator('.site-header>nav').boundingBox();
      expect(navigation!.y).toBeGreaterThanOrEqual(header!.y);
      expect(navigation!.y+navigation!.height).toBeLessThanOrEqual(header!.y+header!.height+1);
      const stage=page.locator('.ocean-stage');
      await page.locator('.ocean-chapters a[href="#buoy-intro"]').click();
      const chapters=['detail','sensing','inside','signal'];
      for(let index=0;index<chapters.length;index++){
        const chapter=chapters[index],panel=page.locator(`[data-reader=${chapter}]`),reader=panel.locator('[data-story-scroll]');
        await expect(stage).toHaveAttribute('data-shot',chapter);
        await expect(stage).toHaveAttribute('data-camera-state','settled');
        const status=await panel.locator('.story-reading-status').boundingBox(),hint=await panel.locator('..').locator('.story-dive').boundingBox();
        expect(status!.y+status!.height).toBeLessThan(hint!.y-8*scale);
        expect(await reader.locator('p:not(.kicker)').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeCloseTo(18*scale,1);
        const skip=await page.locator('.ocean-chapters-skip').boundingBox();
        expect(skip!.x+skip!.width).toBeLessThanOrEqual(width);expect(skip!.y+skip!.height).toBeLessThan(height);
        // A single large input reads the chapter, but cannot advance it.
        await page.waitForTimeout(320);await page.mouse.move(20,height/2);
        await page.mouse.wheel(0,10000);
        await expect(panel).toHaveAttribute('data-at-end','true');
        await expect(stage).toHaveAttribute('data-shot',chapter);
        // Reproduce a fractional native limit: the remaining pixel is padding,
        // fully read text must not leave progress at 98–99% forever.
        await reader.evaluate(node=>{node.scrollTop=node.scrollHeight-node.clientHeight-1;node.dispatchEvent(new Event('scroll'))});
        await expect(panel).toHaveAttribute('data-at-end','true');
        await expect(panel.locator('.story-reading-status')).toContainText('100%');
        await page.waitForTimeout(320);await page.mouse.wheel(0,120);
        if(index<chapters.length-1)await expect(stage).toHaveAttribute('data-shot',chapters[index+1]);
        else await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(height);
      }
    }finally{await context.close()}
  });
}

test('touch phones retain their readable mobile composition',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  try{
    await page.goto('http://127.0.0.1:5173/');
    await page.locator('.ocean-chapters a[href="#buoy-intro"]').click();
    await expect(page.locator('.site-header .menu-button')).toBeVisible();
    expect(await page.locator('[data-reader=detail] p:not(.kicker)').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBe(16);
    const status=await page.locator('[data-reader=detail] .story-reading-status').boundingBox(),hint=await page.locator('.buoy-introduction .story-dive').boundingBox();
    expect(status!.y+status!.height).toBeLessThan(hint!.y-10);
  }finally{await context.close()}
});
