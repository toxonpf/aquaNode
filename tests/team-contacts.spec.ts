import {test,expect} from '@playwright/test';

test('team has portrait slots and multiple unfilled contacts without fake links',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/team');
  await expect(page.locator('.team-portrait-trigger .team-portrait-placeholder')).toHaveCount(5);
  const first=page.locator('.team-person').first();
  await expect(page.locator('.team-person h2').first()).toHaveText('Timur Kuandykov');
  await expect(page.locator('.team-person h2').nth(1)).toHaveText('Roman Benzler');
  await expect(page.locator('#team-card-kirill-dubinin .team-contact.is-pending')).toHaveCount(3);
  await expect(first.locator('a.team-contact')).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  await first.locator('h2').scrollIntoViewIfNeeded();
  await expect(first.locator('h2')).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('field photos appear only inside their member profiles',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/team');
 await expect(page.locator('.team-person .team-profile-field-photo')).toHaveCount(0);
 await page.getByRole('button',{name:'View profile of Timur Kuandykov'}).click();
 const photo=page.getByRole('dialog').locator('.team-profile-field-photo img');
 await expect(photo).toBeVisible();
 await expect(photo).toHaveJSProperty('complete',true);
 expect(await photo.evaluate((node:HTMLImageElement)=>node.naturalWidth)).toBeGreaterThan(0);
 await page.getByRole('dialog').getByRole('button',{name:'Next team member'}).click();
 const secondPhoto=page.getByRole('dialog').locator('.team-profile-field-photo--roman-benzler img');
 await expect(secondPhoto).toBeVisible();
 await expect(secondPhoto).toHaveJSProperty('complete',true);
 expect(await secondPhoto.evaluate((node:HTMLImageElement)=>node.naturalWidth)).toBeGreaterThan(0);
 await expect(page.getByRole('dialog').locator('.team-profile-field-index b')).toHaveText('02');
 await page.setViewportSize({width:390,height:844});
 expect(await page.getByRole('dialog').evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
});

test('one member can have several working contacts and a portrait',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/about');
  // Test-only configuration; no fabricated addresses are saved in the site data.
  await page.evaluate(async()=>{
    const path='/src/content.ts';
    const {team}=await import(path);
    team[0].links=[
      {kind:'email',label:'Work email',url:'mailto:team@example.com'},
      {kind:'email',label:'Personal email',url:'mailto:person@example.com'},
      {kind:'website',label:'Website',url:'https://example.com'},
    ];
    const portrait='<svg xmlns="http://www.w3.org/2000/svg" width="140" height="175"><rect width="140" height="175" fill="#d9e6df"/></svg>';
    team[0].photo='data:image/svg+xml,'+encodeURIComponent(portrait);
  });
  await page.locator('header nav a[href="/team"]').click();
  const first=page.locator('.team-person').first();
  await expect(first.locator('a.team-contact')).toHaveCount(3);
  await expect(first.getByRole('link',{name:'Work email'})).toHaveAttribute('href','mailto:team@example.com');
  await expect(first.getByRole('link',{name:'Personal email'})).toHaveAttribute('href','mailto:person@example.com');
  await expect(first.getByRole('link',{name:/Website/})).toHaveAttribute('target','_blank');
  await expect(first.locator('.team-portrait img')).toBeVisible();
  await expect(first.locator('.team-portrait img')).toHaveJSProperty('complete',true);
  await first.getByRole('button',{name:'View profile of Timur Kuandykov'}).click();
  const profile=page.getByRole('dialog');
  await expect(profile).toBeVisible();
  await expect(profile.getByRole('heading',{name:'Timur Kuandykov'})).toBeVisible();
  await expect(profile.locator('a.team-contact')).toHaveCount(3);
  await profile.getByRole('button',{name:'Next team member'}).click();
  await expect(profile.getByRole('heading',{name:'Roman Benzler'})).toBeVisible();
  await profile.getByRole('button',{name:'Previous team member'}).click();
  await expect(profile.getByRole('heading',{name:'Timur Kuandykov'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(profile).not.toBeVisible();
  await expect(first.getByRole('button',{name:'View profile of Timur Kuandykov'})).toBeFocused();
});

test('profiles open by keyboard and remain usable on phones',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/team');
  const trigger=page.getByRole('button',{name:'View profile of Timur Kuandykov'});
  await trigger.focus();
  await page.keyboard.press('Enter');
  const profile=page.getByRole('dialog');
  await expect(profile).toBeVisible();
  await expect(profile.getByRole('button',{name:'CLOSE',exact:true})).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('hidden');
  await profile.getByRole('button',{name:'Next team member'}).click();
  await expect(profile.getByRole('heading',{name:'Roman Benzler'})).toBeVisible();
  expect(await profile.evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  await profile.getByRole('button',{name:'CLOSE',exact:true}).click();
  await expect(profile).not.toBeVisible();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
});
