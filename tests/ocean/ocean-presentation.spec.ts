import {test,expect} from '@playwright/test';

test('all chapter cues share one animated arrow and no previous-chapter buttons remain',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/);
  await expect(stage.locator('.back-to-surface,.back-to-buoy,.back-to-sensors,.signal-back')).toHaveCount(0);
  await expect(stage.locator('.story-dive')).toHaveCount(5);
  const first=stage.locator('.ocean-scroll');
  await expect(first.locator('svg')).toHaveCount(1);
  await expect(first.locator('.flexible-arrow-head')).toHaveCount(1);
  await expect(first.locator('.flexible-arrow')).toHaveAttribute('data-wave','active');
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});
    const firstShape=await first.locator('svg').evaluate(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height}));
    await stage.locator('.ocean-chapters a').nth(1).click();
    const nextShape=await page.locator('.buoy-introduction .story-dive svg').evaluate(node=>({width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height}));
    expect(firstShape).toEqual(nextShape);
    await stage.locator('.ocean-chapters a').first().click();
    await first.click();
    await expect(stage).toHaveAttribute('data-shot','detail');
    await stage.locator('.ocean-chapters a').first().click();
  }
});

test('chapter headings reveal even when an initially hidden heading gets no new intersection entry',async({page})=>{
  test.setTimeout(90_000);
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'connection',{value:{saveData:true}});
    const NativeObserver=window.IntersectionObserver;
    window.IntersectionObserver=class extends NativeObserver{
      observe(target:Element){
        if(!target.matches('.ocean-stage .word-heading'))super.observe(target);
      }
    };
  });
  await page.goto('/');
  const stage=page.locator('.ocean-stage');
  await expect(stage).toHaveClass(/is-presented/);
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});
    for(const language of ['Русский','English']){
      await page.locator('.site-header').getByRole('button',{name:language,exact:true}).click();
      for(const [index,chapter] of [[1,'detail'],[2,'sensing'],[3,'inside'],[4,'signal'],[2,'sensing']] as const){
        await stage.locator('.ocean-chapters a').nth(index).click();
        const panel=stage.locator(`[data-reader=${chapter}]`),heading=panel.locator('h2');
        await expect(heading).toBeInViewport();
        await expect.poll(()=>heading.locator('.heading-word').evaluateAll(words=>words.every(word=>getComputedStyle(word).opacity==='1'))).toBe(true);
        const subheading=panel.locator('.story-details h3').first();
        await subheading.scrollIntoViewIfNeeded();
        await expect.poll(()=>subheading.locator('.heading-word').evaluateAll(words=>words.every(word=>getComputedStyle(word).opacity==='1'))).toBe(true);
      }
    }
  }
});
