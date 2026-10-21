import {test,expect} from '@playwright/test';

test('each subsequent portrait starts before the previous one finishes',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/team');
  for(const width of [1920,1440,1280,1000,800,761]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>document.fonts.ready);
    await expect.poll(async()=>{
      const portraits=await page.locator('.team-portrait-trigger').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom}}));
      return portraits.slice(1).every((portrait,index)=>portrait.top<portraits[index].bottom-40);
    }).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('the next person is previewed alongside the end of a mobile card',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/team');
  const next=page.getByRole('link',{name:'Continue to Roman Benzler'});
  await next.scrollIntoViewIfNeeded();
  await expect(next).toBeInViewport();
  await expect(page.locator('.team-person-info').first()).toBeInViewport();
  await next.click();
  await expect(page.locator('#team-card-roman-benzler .team-portrait-trigger')).toBeInViewport();
});

test('portrait moves into the profile and returns on animated close',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/team');
  const trigger=page.getByRole('button',{name:'View profile of Timur Kuandykov'});
  await trigger.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  await trigger.click();
  const profile=page.getByRole('dialog');
  await expect(profile).toBeVisible();
  await expect(page.locator('.team-portrait-flight')).toHaveCount(1);
  await expect(page.locator('.team-portrait-flight')).toHaveCount(0);
  await expect(profile.getByRole('heading',{name:'Timur Kuandykov'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(profile).not.toBeVisible();
  await expect(trigger).toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
  expect(errors).toEqual([]);
});

test('switching participants keeps only the destination portrait hidden until its return',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/team');
  const portraits=page.locator('.team-portrait-trigger');
  await portraits.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);
  await portraits.first().click();
  const profile=page.getByRole('dialog');
  const next=profile.getByRole('button',{name:'Next team member'});
  await expect(next).toBeInViewport();
  await next.click();
  await expect(profile.getByRole('heading',{name:'Roman Benzler'})).toBeVisible();
  await expect(portraits.first()).toHaveCSS('visibility','visible');
  await expect(portraits.nth(1)).toHaveCSS('visibility','hidden');
  await expect(page.locator('.team-profile-previous')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('.team-portrait-flight')).toHaveCount(1);
  await expect(portraits.nth(1)).toHaveCSS('visibility','hidden');
  await expect(profile).not.toBeVisible();
  await expect(portraits.nth(1)).toHaveCSS('visibility','visible');
  await expect(page.locator('.team-portrait-flight,.team-profile-previous')).toHaveCount(0);
});
