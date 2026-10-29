import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';

test('skip wave starts beside the caption in both languages and fits every rail',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.ocean-stage.is-presented')).toBeVisible();
  for(const language of ['Русский','English']){
    await chooseLanguage(page,language,'.site-header');
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
      await expect.poll(()=>page.locator('.ocean-chapters-skip').evaluate(link=>{
        const label=link.querySelector('span')!.getBoundingClientRect(),svg=link.querySelector('svg')!;
        const path=svg.querySelector('path')!,point=path.getPointAtLength(0),matrix=svg.getScreenCTM()!;
        return Math.abs(matrix.a*point.x+matrix.e-(label.right-5))+Math.abs(matrix.d*point.y+matrix.f-(label.bottom+3));
      })).toBeLessThan(1);
      const fit=await page.locator('.ocean-chapters').evaluate(nav=>{
        const links=[...nav.querySelectorAll('a')].map(link=>link.getBoundingClientRect());
        return {same:Math.max(...links.map(r=>r.width))-Math.min(...links.map(r=>r.width)),fits:links.every(r=>r.left>=0&&r.right<=innerWidth)};
      });
      expect(fit.same).toBeLessThan(1);expect(fit.fits).toBe(true);
      const straight=await page.locator('.ocean-chapters-skip-line').first().evaluate(node=>{
        const path=node as SVGPathElement,length=path.getTotalLength(),tip=path.getPointAtLength(length),neck=path.getPointAtLength(length-6);
        return Math.abs(tip.x-neck.x)<.1&&tip.y-neck.y>5.9;
      });
      expect(straight).toBe(true);
      await page.locator('.ocean-chapters').screenshot({path:`test-results/skip-connected-${language==='English'?'en':'ru'}-${width}.png`});
    }
  }
  expect(await page.locator('.back-to-sensors').count()).toBe(0);
  await page.locator('.ocean-chapters-skip').click();
  await expect.poll(()=>page.locator('.award').evaluate(node=>Math.abs(node.getBoundingClientRect().top-(document.querySelector('.site-header')?.getBoundingClientRect().height??0)))).toBeLessThan(1);
});

test('journal thread follows the cover size and chapter row centres',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/journal');
  for(const language of ['English','Русский']){
    await chooseLanguage(page,language,'.site-header');
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
      await expect(page.locator('.journal-thread-stop')).toHaveCount(3);
      await expect.poll(()=>page.locator('.journal-cover').evaluate(cover=>{
        const svg=cover.querySelector<SVGSVGElement>('.journal-cover-current')!,matrix=svg.getScreenCTM()!;
        const dots=[...svg.querySelectorAll<SVGCircleElement>('.journal-thread-dot')],rows=[...cover.querySelectorAll('.journal-cover-link')];
        return Math.max(...dots.map((dot,index)=>{
          const rect=rows[index].getBoundingClientRect();return Math.abs(dot.cy.baseVal.value*matrix.d+matrix.f-(rect.top+rect.height/2));
        }));
      })).toBeLessThan(1);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.locator('.journal-hero').screenshot({path:`test-results/journal-thread-${language==='English'?'en':'ru'}-${width}.png`});
    }
  }
});

test('text actions change colour on hover and keyboard focus in light and dark sections',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});
  await page.goto('/journal');
  for(const selector of ['.journal-hero-copy .arrow-link','.journal-stage-footer .arrow-link','.journal-entry-toggle','.footer-invitation .arrow-link','.footer-return>button','.footer-directory nav a']){
    const control=page.locator(selector).first();await control.scrollIntoViewIfNeeded();
    await page.mouse.move(0,0);await control.evaluate(node=>(node as HTMLElement).blur());
    const rest=await control.evaluate(node=>getComputedStyle(node).color);
    await control.hover();await expect.poll(()=>control.evaluate(node=>getComputedStyle(node).color)).not.toBe(rest);
    await page.mouse.move(0,0);await control.focus();
    await expect.poll(()=>control.evaluate(node=>getComputedStyle(node).color)).not.toBe(rest);
  }
});
