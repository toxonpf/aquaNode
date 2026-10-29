import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';

test('headings across the site fit two complete lines in all three languages',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
  for(const route of ['/','/about','/technology','/build','/journal','/team']){
    await page.goto(route);
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:1000});
      for(const language of ['Русский','English','繁體中文']){
        await chooseLanguage(page,language,'.site-header');
        await page.evaluate(()=>document.fonts.ready);
        await expect.poll(()=>page.locator('h1,h2,h3').evaluateAll(headings=>headings.flatMap(node=>{
          if(node.classList.contains('sr-only')||!node.getBoundingClientRect().height)return [];
          // Accordion headings contain a padded button: measure its title, not the hit area.
          const text=node.querySelector('.build-step-heading button>span:nth-child(2)')??node;
          const rows:number[]=[];
          text.querySelectorAll('.heading-word-mask').forEach(word=>{
            const top=word.getBoundingClientRect().top;
            if(!rows.some(row=>Math.abs(row-top)<1))rows.push(top);
          });
          return rows.length>2||text.scrollWidth>text.clientWidth+1
            ?[{text:node.textContent,rows:rows.length,width:text.clientWidth,scroll:text.scrollWidth}]:[];
        })),`${route}, ${width}px, ${language}`).toEqual([]);
      }
    }
  }
});

test('the team anchor is a generous target and lands the gallery below the header',async({page})=>{
  for(const reducedMotion of ['reduce','no-preference'] as const){
    await page.emulateMedia({reducedMotion});
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:900});await page.goto('/team');
      await chooseLanguage(page,'Русский','.site-header');
      const link=page.locator('.team-meet-link');
      expect(Math.round((await link.boundingBox())!.height)).toBeGreaterThanOrEqual(48);
      if(width<760)expect((await link.boundingBox())!.width).toBeGreaterThan(width*.8);
      await link.focus();await page.keyboard.press('Enter');
      await expect.poll(()=>page.locator('#team-gallery').evaluate(node=>Math.abs(node.getBoundingClientRect().top-(document.querySelector('.site-header')?.getBoundingClientRect().height??0)))).toBeLessThan(1);
      await expect(page.locator('#team-gallery')).toBeFocused();
      expect(await page.locator('.team-portrait-trigger').first().evaluate(node=>node.getBoundingClientRect().top)).toBeLessThan(500);
    }
  }
});

test('download sheet rules are curved, ripple once and return to their resting curve',async({page})=>{
  await page.goto('/build');
  const card=page.locator('.action-download').first(),rule=card.locator('.download-file-rule').first();
  await card.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
  const resting=await rule.evaluate(node=>getComputedStyle(node).d);
  expect(resting).toContain('C');
  await card.hover();
  await expect.poll(()=>rule.evaluate(node=>getComputedStyle(node).d)).not.toBe(resting);
  await page.mouse.move(0,0);
  await expect.poll(()=>rule.evaluate(node=>node.getAnimations().some(animation=>animation.playState==='running'))).toBe(false);
  await expect.poll(()=>rule.evaluate(node=>getComputedStyle(node).d)).toBe(resting);
});
