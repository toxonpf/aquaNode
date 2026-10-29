import {test,expect} from '@playwright/test';

test('diving reveals the probes and both controls select the same sensor',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.locator('.ocean-stage.is-presented')).toBeVisible({timeout:30000});
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await page.getByRole('link',{name:'Scroll to explore AquaNode'}).click();
  await expect(page.getByRole('heading',{name:'A small buoy. A closer look at our water.'})).toBeVisible();
  await page.getByRole('link',{name:'THERE’S MORE BELOW'}).click();
  await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','sensing');
  await expect(page.getByRole('heading',{name:'The story starts in the water.'})).toBeVisible();
  await expect(page.locator('.sensor-introduction')).toHaveCSS('opacity','1');
  const temperature=page.locator('.sensor-picker button').nth(1);
  await temperature.click();
  await expect(page.locator('.ocean-stage')).toHaveJSProperty('scrollTop',0);
  await expect(page.locator('.ocean-stage')).toHaveJSProperty('scrollLeft',0);
  await expect(temperature).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#sensor-explanation')).toContainText('Water temperature');
  await expect(page.locator('.sensor-hotspot[data-sensor=temperature]')).toHaveAttribute('aria-pressed','true');
  // The duplicate visual marker follows the waves; click its current position.
  const marker=await page.locator('.sensor-hotspot[data-sensor=ec]').boundingBox();
  await page.mouse.click(marker!.x+marker!.width/2,marker!.y+marker!.height/2);
  await expect(page.locator('#sensor-explanation')).toContainText('Experimental EC');
  await expect(page.locator('.sensor-picker button').first()).toHaveAttribute('aria-pressed','true');
  await page.getByRole('link',{name:'Meet the buoy',exact:true}).click();
  await expect(page.getByRole('heading',{name:'A small buoy. A closer look at our water.'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'The story starts in the water.'})).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('the story supports reduced motion, keyboard interaction and rapid reverse scrolling',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('link',{name:'Explore below the surface',exact:true}).click();
  await expect(page.getByRole('heading',{name:'The story starts in the water.'})).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.locator('.sensor-picker button').nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sensor-explanation')).toContainText('Water temperature');
  for(const [anchor,shot] of [['.ocean-story','surface'],['#buoy-intro','detail'],['#buoy-sensors','sensing'],['.ocean-story','surface']]){
    await page.evaluate(selector=>{
      const target=document.querySelector(selector)!;
      scrollTo({top:scrollY+target.getBoundingClientRect().top,behavior:'instant'});
    },anchor);
    await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot',shot);
  }
  await expect(page.getByRole('link',{name:'Scroll to explore AquaNode'})).toBeVisible();
});

test('probe content fits phones, tablets and short landscape screens',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[320,740],[390,844],[768,1024],[844,390],[1440,900]]){
    await page.setViewportSize({width,height});
    await page.goto('/');
    await page.getByRole('link',{name:'Explore below the surface',exact:true}).click();
    await expect(page.getByRole('heading',{name:'The story starts in the water.'})).toBeVisible();
    const bounds=await page.locator('.sensor-copy').boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(height);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    // Short landscape readers expose the introduction first; the picker remains
    // reachable by reading within the panel rather than squeezing all text above it.
    await page.locator('.sensor-picker').scrollIntoViewIfNeeded();
    await expect(page.locator('.sensor-picker button').first()).toBeInViewport();
    await expect(page.locator('.sensor-picker button').nth(1)).toBeInViewport();
  }
});
