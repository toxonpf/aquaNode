import {test,expect} from '@playwright/test';

test('signal chapter keeps the buoy scene and fits desktop and mobile',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/,{timeout:30000});
  await page.getByRole('link',{name:'See inside the buoy',exact:true}).click();
  await expect(stage).toHaveClass(/is-inside-ready/);
  await page.getByRole('link',{name:'FOLLOW THE SIGNAL',exact:true}).click();
  await expect(stage).toHaveAttribute('data-shot','signal');
  await expect(stage).toHaveClass(/is-signal-ready/);
  await expect(page.locator('.signal-introduction')).toHaveCSS('opacity','1');
  await expect(page.locator('.ocean-hero canvas')).toHaveCount(1);
  await page.screenshot({path:'test-results/signal-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(2100);
  await expect(page.getByRole('heading',{name:'A small signal. A closer connection.'})).toBeInViewport();
  const signalReader=page.locator('[data-reader=signal] [data-story-scroll]');
  expect(await signalReader.evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/signal-mobile.png'});
  expect(errors).toEqual([]);
});

test('route swap is covered and browser Back completes the transition',async({page})=>{
  await page.goto('/about');
  await page.locator('header nav a[href="/build"]').click();
  await expect(page.locator('.page-curtain')).toHaveAttribute('data-active','true');
  await expect(page.locator('main h1')).toHaveText('Understanding starts with observing.');
  await expect(page.locator('main h1')).toHaveText('Learn by putting it together.');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await page.goBack();
  await expect(page.locator('main h1')).toHaveText('Understanding starts with observing.');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
});

test('rapid navigation reveals the latest requested page',async({page})=>{
  await page.goto('/about');
  await page.locator('header nav a[href="/build"]').click();
  await page.locator('header nav a[href="/team"]').click({force:true});
  await expect(page.locator('main h1')).toHaveText('People behind the node.');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
});

test('returning to the outgoing page during a transition clears the curtain',async({page})=>{
  await page.goto('/about');
  await page.locator('header nav a[href="/build"]').click();
  await page.locator('header nav a[href="/about"]').click({force:true});
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('main h1')).toHaveText('Understanding starts with observing.');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await expect(page.locator('.page-curtain')).toHaveCSS('pointer-events','none');
});

test('reduced motion visits all five chapters in order without a page curtain',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/);
  for(const shot of ['detail','sensing','inside','signal']){
    await page.locator('.ocean-stage').evaluate(stage=>{
      const reader=stage.querySelector<HTMLElement>(`[data-reader="${stage.getAttribute('data-shot')}"] [data-story-scroll]`);
      if(reader)reader.scrollTop=reader.scrollHeight;
    });
    await page.keyboard.press('PageDown');
    await expect(stage).toHaveAttribute('data-shot',shot);
    await page.waitForTimeout(320);
  }
  await page.locator('[data-reader=signal] [data-story-scroll]').evaluate(node=>{node.scrollTop=node.scrollHeight});
  await page.mouse.wheel(0,1200);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(900);
  await page.waitForTimeout(900);
  await page.mouse.wheel(0,-1200);
  await expect(stage).toHaveAttribute('data-shot','signal');
  await expect(stage).toBeInViewport();
  await page.locator('header nav a[href="/about"]').click();
  await expect(page.locator('main h1')).toHaveText('Understanding starts with observing.');
  await expect(page.locator('.page-curtain')).toHaveCSS('display','none');
});
