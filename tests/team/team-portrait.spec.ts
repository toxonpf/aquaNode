import {test,expect,type Page} from '@playwright/test';

async function expectRestored(page:Page){
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.team-portrait-flight,.team-profile-previous')).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>document.body.style.overflow)).toBe('');
  expect(await page.locator('.team-portrait-trigger').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).visibility==='visible'&&Number(getComputedStyle(node).opacity)===1))).toBe(true);
}

test('gallery and profile share the photo, crop, tint, waves and captions',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/team');
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});
    for(const index of [0,1]){
      const trigger=page.locator('.team-portrait-trigger').nth(index);
      const card=trigger.locator('.team-member-portrait');
      await trigger.scrollIntoViewIfNeeded();
      const before=await card.evaluate(node=>{
        const img=node.querySelector('img')!,style=getComputedStyle(img);
        return {src:img.getAttribute('src'),transform:style.transform,filter:style.filter,crop:style.objectPosition,overlay:getComputedStyle(node,'::after').backgroundImage,wave:[...node.querySelectorAll('.portrait-current-line')].map(path=>path.getAttribute('d')),silhouette:node.querySelector('mask path')?.getAttribute('d'),label:node.querySelector('.team-profile-photo-label')?.textContent,index:node.querySelector('.team-profile-photo-index')?.textContent};
      });
      if(index===0)await trigger.screenshot({path:`test-results/shared-team-card-${width}.png`});
      await trigger.click();
      const portrait=page.getByRole('dialog').locator('.team-member-portrait');
      const after=await portrait.evaluate(node=>{
        const img=node.querySelector('img')!,style=getComputedStyle(img);
        return {src:img.getAttribute('src'),transform:style.transform,filter:style.filter,crop:style.objectPosition,overlay:getComputedStyle(node,'::after').backgroundImage,wave:[...node.querySelectorAll('.portrait-current-line')].map(path=>path.getAttribute('d')),silhouette:node.querySelector('mask path')?.getAttribute('d'),label:node.querySelector('.team-profile-photo-label')?.textContent,index:node.querySelector('.team-profile-photo-index')?.textContent};
      });
      expect(after).toEqual(before);
      if(index===0)await page.getByRole('dialog').screenshot({path:`test-results/shared-team-profile-${width}.png`});
      await page.keyboard.press('Escape');await expectRestored(page);
    }
  }
});

test('a photo stays mirrored through opening, switching, returning and hovering',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  const trigger=page.locator('.team-portrait-trigger').first();
  await trigger.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await dialog.getByRole('button',{name:'Next team member'}).click();
  await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await expect(dialog.getByRole('heading',{name:'Roman Benzler',exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.locator('.team-portrait-flight')).toHaveCount(1);
  for(let index=0;index<4;index++){
    const mirror=await page.locator('.team-portrait-flight img').evaluate(node=>new DOMMatrix(getComputedStyle(node).transform).a);
    expect(mirror).toBeLessThan(0);
    await page.waitForTimeout(120);
  }
  await expectRestored(page);
  const target=page.locator('.team-portrait-trigger').nth(1);
  await target.hover();
  expect(await target.locator('img').evaluate(node=>new DOMMatrix(getComputedStyle(node).transform).a)).toBeLessThan(0);
});

test('interrupted transitions and resizing do not leave cards hidden or duplicate portraits',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  const trigger=page.locator('.team-portrait-trigger').first(),dialog=page.getByRole('dialog');
  await trigger.focus();await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();await page.keyboard.press('Escape');await expectRestored(page);
  for(const phase of ['collapsing','changing']){
    await trigger.click();await expect(dialog).toHaveAttribute('data-profile-phase','open');
    await dialog.getByRole('button',{name:'Next team member'}).click();
    await expect(dialog).toHaveAttribute('data-profile-phase',phase);
    await page.keyboard.press('Escape');await expectRestored(page);
  }
  await trigger.click();await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});
  await expectRestored(page);
  await trigger.click();await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await dialog.getByRole('button',{name:'Next team member'}).click();
  await expect(dialog).toHaveAttribute('data-profile-phase','collapsing');
  await page.setViewportSize({width:1024,height:900});
  await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await expect(dialog.getByRole('heading',{name:'Roman Benzler',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');await expectRestored(page);
  expect(errors).toEqual([]);
});

test('mobile continuation previews stay below the full portrait',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/team');
  for(const width of [390,320]){
    await page.setViewportSize({width,height:844});
    await page.evaluate(()=>document.fonts.ready);
    const positions=await page.locator('.team-person:has(.team-next-preview)').evaluateAll(cards=>cards.map(card=>({portrait:card.querySelector('.team-portrait-trigger')!.getBoundingClientRect().bottom,preview:card.querySelector('.team-next-preview')!.getBoundingClientRect().top})));
    for(const position of positions)expect(position.preview-position.portrait).toBeGreaterThanOrEqual(0);
  }
});

test('a failed portrait uses the same fallback in the card and modal',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/assets/team/timur-kuandykov.webp',route=>route.abort());
  await page.goto('/team');
  const trigger=page.locator('.team-portrait-trigger').first();
  await trigger.scrollIntoViewIfNeeded();await expect(trigger.locator('.team-portrait-placeholder')).toBeVisible();
  await trigger.click();
  await expect(page.getByRole('dialog').locator('.team-portrait-placeholder')).toBeVisible();
  await page.keyboard.press('Escape');await expectRestored(page);
});

test('shade grows with the opening and leaves with the returning portrait',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  const trigger=page.locator('.team-portrait-trigger').first();
  const shade=(selector:string)=>page.locator(selector).evaluate(node=>Number(getComputedStyle(node,'::after').opacity));
  expect(await trigger.locator('figure').evaluate(node=>getComputedStyle(node,'::after').opacity)).toBe('0');
  await trigger.click();
  const opening=await page.evaluate(()=>new Promise<number[]>(resolve=>{
    const values:number[]=[];
    const sample=()=>{
      const portrait=document.querySelector('.team-portrait-flight figure');
      if(portrait){values.push(Number(getComputedStyle(portrait,'::after').opacity));requestAnimationFrame(sample)}else resolve(values);
    };sample();
  }));
  expect(opening.some(value=>value>.1&&value<.9)).toBe(true);
  await expect(page.getByRole('dialog')).toHaveAttribute('data-profile-phase','open');
  expect(await shade('.team-profile-portrait figure')).toBe(1);
  await page.keyboard.press('Escape');
  const closing=await page.evaluate(()=>new Promise<number[]>(resolve=>{
    const values:number[]=[];
    const sample=()=>{
      const portrait=document.querySelector('.team-portrait-flight figure');
      if(portrait){values.push(Number(getComputedStyle(portrait,'::after').opacity));requestAnimationFrame(sample)}else resolve(values);
    };sample();
  }));
  expect(closing.some(value=>value>.1&&value<.9)).toBe(true);
  await expectRestored(page);
  expect(await trigger.locator('figure').evaluate(node=>getComputedStyle(node,'::after').opacity)).toBe('0');
});

test('return stays opaque, hands off at the same size and cannot cover the header',async({page})=>{
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});await page.goto('/team');
    const trigger=page.locator('.team-portrait-trigger').first();
    await trigger.scrollIntoViewIfNeeded();
    // Put the destination partly beneath the header, as after reading a card.
    await trigger.evaluate(node=>{window.scrollBy(0,node.getBoundingClientRect().top+40);node.focus({preventScroll:true})});
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toHaveAttribute('data-profile-phase','open');
    await page.keyboard.press('Escape');
    const frames=await page.evaluate(()=>new Promise<{alpha:number;clip:number;header:number;gap:number;scale:number;offset:number;portraitClip:string|null;panelGap:number}[]>(resolve=>{
      const frames:{alpha:number;clip:number;header:number;gap:number;scale:number;offset:number;portraitClip:string|null;panelGap:number}[]=[];
      const started=performance.now();
      const sample=()=>{
        const button=document.querySelector<HTMLElement>('.team-portrait-trigger')!;
        const flight=document.querySelector<HTMLElement>('.team-portrait-flight');
        const layer=document.querySelector<HTMLElement>('.team-portrait-flight-layer');
        const visual=button.querySelector<HTMLElement>('.team-portrait-visual')!;
        const matrix=new DOMMatrix(getComputedStyle(visual).transform);
        const rect=button.getBoundingClientRect(),moving=flight?.getBoundingClientRect();
        const viewport=document.querySelector<HTMLElement>('.team-profile-info-viewport');
        const panelGap=innerWidth>760&&moving&&viewport&&getComputedStyle(viewport).visibility!=='hidden'?viewport.getBoundingClientRect().left-moving.right:0;
        frames.push({alpha:Math.max(Number(getComputedStyle(button).opacity),flight?Number(getComputedStyle(flight).opacity):0),clip:layer?parseFloat(getComputedStyle(layer).clipPath.slice(6)):Infinity,header:document.querySelector('.site-header')!.getBoundingClientRect().bottom,gap:moving?Math.abs(moving.width-rect.width)+Math.abs(moving.height-rect.height):0,scale:matrix.a,offset:matrix.f,portraitClip:flight?getComputedStyle(flight).clipPath:null,panelGap});
        if(performance.now()-started<1700)requestAnimationFrame(sample);else resolve(frames);
      };sample();
    }));
    expect(frames.length).toBeGreaterThan(20);
    for(const frame of frames){
      expect(frame.alpha).toBeGreaterThan(.99);
      expect(frame.clip).toBeGreaterThanOrEqual(frame.header-.5);
      expect(frame.scale).toBeCloseTo(1,3);expect(frame.offset).toBeCloseTo(0,2);
      if(frame.portraitClip)expect(frame.portraitClip).toBe('polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)');
      expect(Math.abs(frame.panelGap)).toBeLessThan(1.5);
    }
    const lastFlight=frames.filter(frame=>Number.isFinite(frame.clip)).at(-1)!;
    expect(lastFlight.gap).toBeLessThan(1);
    await expectRestored(page);
  }
});

test('a member selected before its gallery reveal returns to a settled card',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/team');
  await page.locator('.team-portrait-trigger').first().click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await dialog.getByRole('button',{name:'Next team member'}).click();
  await expect(dialog).toHaveAttribute('data-profile-phase','open');
  await page.keyboard.press('Escape');await expectRestored(page);
  const target=page.locator('.team-portrait-trigger').nth(1);
  await target.scrollIntoViewIfNeeded();
  for(let sample=0;sample<4;sample++){
    const state=await target.evaluate(node=>{
      const matrix=new DOMMatrix(getComputedStyle(node.querySelector('.team-portrait-visual')!).transform);
      return {scale:matrix.a,y:matrix.f,clip:getComputedStyle(node).clipPath};
    });
    expect(state.scale).toBe(1);expect(state.y).toBe(0);
    expect(state.clip).toBe('polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)');
    await page.waitForTimeout(100);
  }
});
