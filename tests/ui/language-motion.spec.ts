import {test,expect} from '@playwright/test';
import {chooseLanguage} from '../helpers/language';

test('language change hides old words before replacing them and plays the normal entrance',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/about');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active');
  const heading=page.locator('h1'),word=heading.locator('.heading-word').first();
  await expect(word).toHaveCSS('opacity','1');
  await page.evaluate(()=>{(window as any).__sameMain=document.querySelector('main')});
  let navigations=0;page.on('request',request=>{if(request.isNavigationRequest())navigations++});
  await chooseLanguage(page,'Русский');
  await expect(page.locator('html')).toHaveAttribute('data-locale-phase','leaving');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(heading).toHaveText('Engineering and water education');
  await expect.poll(()=>word.evaluate(node=>parseFloat(getComputedStyle(node).opacity))).toBeLessThan(.95);
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(heading).toHaveText('Инженерия и изучение воды');
  await expect(page.locator('html')).not.toHaveAttribute('data-locale-phase');
  await expect(heading.locator('.heading-word').last()).toHaveCSS('opacity','1');
  await expect(page.locator('.about-hero-copy>p')).toHaveCSS('opacity','1');
  expect(await page.evaluate(()=>document.querySelector('main')===(window as any).__sameMain)).toBe(true);
  expect(navigations).toBe(0);expect(errors).toEqual([]);
});

test('rapid requests keep the latest language and retain the mounted map and archive selection',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
  await page.goto('/map?region=taiwan');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active');
  await page.getByLabel('REFERENCE STATION',{exact:true}).selectOption('5127');
  await page.getByLabel('OBSERVATION PERIOD',{exact:true}).selectOption('2002-Q1');
  await page.evaluate(async()=>{
    (window as any).__sameMap=document.querySelector('.leaflet-container');
    const {changeLocale}=await import('/src/features/i18n/i18n.ts');
    const first=changeLocale('ru');changeLocale('zh-TW');await first;
  });
  await expect(page.locator('html')).toHaveAttribute('lang','zh-TW');
  await expect(page.locator('html')).not.toHaveAttribute('data-locale-phase');
  await expect(page.locator('.atlas-archive-controls select').first()).toHaveValue('5127');
  await expect(page.locator('.atlas-archive-controls select').last()).toHaveValue('2002-Q1');
  await expect(page.locator('.atlas-comparison select')).toHaveValue('2002-Q1');
  expect(await page.evaluate(()=>document.querySelector('.leaflet-container')===(window as any).__sameMap)).toBe(true);
});

test('remounted module labels and inline captions appear without a translated-text flash',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/technology');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active');
  await page.locator('.circuit-network').scrollIntoViewIfNeeded();
  const selectors=['.circuit-node--0 .circuit-node-title','.circuit-inspector-meta>span:first-child','.tech-path-caption'];
  for(const selector of selectors)await expect(page.locator(selector)).toBeInViewport();
  const frames=await page.evaluate(async(selectors)=>{
    const {changeLocale}=await import('/src/features/i18n/i18n.ts');
    const frames:{phase:string|undefined;opacity:number[]}[]=[];
    let frame=0,finished=false;
    const sample=()=>{
      if(document.documentElement.lang==='ru')frames.push({phase:document.documentElement.dataset.localePhase,opacity:selectors.map(selector=>Number(getComputedStyle(document.querySelector(selector)!).opacity))});
      if(!finished)frame=requestAnimationFrame(sample);
    };
    const change=changeLocale('ru');frame=requestAnimationFrame(sample);
    await change;await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    finished=true;cancelAnimationFrame(frame);return frames;
  },selectors);
  expect(frames.length).toBeGreaterThan(5);
  for(let index=0;index<selectors.length;index++){
    expect(frames[0].opacity[index],selectors[index]+' should start hidden').toBeLessThan(.2);
    for(let frame=1;frame<frames.length;frame++)expect(frames[frame].opacity[index],selectors[index]+' should never flash and hide again').toBeGreaterThanOrEqual(frames[frame-1].opacity[index]-.025);
    expect(frames.at(-1)!.opacity[index]).toBe(1);
  }
});

test('bench-plan copy aligns with its section heading on desktop and phones',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/journal');await chooseLanguage(page,'Русский');
  for(const width of [1440,1093,390,320]){
    await page.setViewportSize({width,height:900});
    const block=page.locator('#journal-next .journal-stage-heading');
    const heading=await block.locator('h2').boundingBox(),copy=await block.locator('p').boundingBox();
    expect(Math.abs(heading!.x-copy!.x)).toBeLessThan(1);
    expect(copy!.y).toBeGreaterThanOrEqual(heading!.y+heading!.height);
    expect(copy!.width).toBeLessThanOrEqual(heading!.width+1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('translated cards interpolate their height and release temporary layout styles',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:320,height:844});
  await page.goto('/about');
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active');
  await expect(page.locator('.about-hero-copy>p')).toHaveCSS('opacity','1');
  const report=await page.evaluate(async()=>{
    const {changeLocale}=await import('/src/features/i18n/i18n.ts');
    const selectors=['.about-hero-copy','.about-hero-layout','.about-hero'];
    const sizes=()=>selectors.map(selector=>document.querySelector(selector)!.getBoundingClientRect().height);
    const before=sizes(),frames:number[][]=[];
    let finished=false,frame=0;
    const sample=()=>{
      if(document.documentElement.lang==='ru')frames.push(sizes());
      if(!finished)frame=requestAnimationFrame(sample);
    };
    const task=changeLocale('ru');frame=requestAnimationFrame(sample);
    await task;await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    finished=true;cancelAnimationFrame(frame);
    return {before,after:sizes(),frames,styles:selectors.map(selector=>document.querySelector<HTMLElement>(selector)!.style.cssText),temporaryIds:document.querySelectorAll('[data-flip-id^="locale-"]').length};
  });
  const changed=report.before.map((value,index)=>Math.abs(value-report.after[index]));
  const index=changed.indexOf(Math.max(...changed)),distance=changed[index];
  expect(distance).toBeGreaterThan(8);
  expect(report.frames.length).toBeGreaterThan(6);
  const intermediate=report.frames.filter(frame=>Math.abs(frame[index]-report.before[index])>2&&Math.abs(frame[index]-report.after[index])>2);
  expect(intermediate.length).toBeGreaterThan(3);
  const heights=[report.before[index],...report.frames.map(frame=>frame[index]),report.after[index]];
  const largestStep=Math.max(...heights.slice(1).map((value,i)=>Math.abs(value-heights[i])));
  expect(largestStep).toBeLessThan(distance*.65);
  expect(report.temporaryIds).toBe(0);
  expect(report.styles.every(style=>!/(?:^|;)\s*(?:height|width|transform):/.test(style))).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});

test('new copy only appears at its final width and keeps its line breaks',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>localStorage.setItem('aquanode.locale','en'));
  for(const width of [1440,320]){
    await page.setViewportSize({width,height:1000});
    await page.goto('/about');
    await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active');
    await expect(page.locator('.about-hero-copy>p')).toHaveCSS('opacity','1');
    const report=await page.evaluate(async()=>{
      const {changeLocale}=await import('/src/features/i18n/i18n.ts');
      const rows=(rects:DOMRect[])=>{
        const tops:number[]=[];
        for(const rect of rects)if(rect.width&&!tops.some(top=>Math.abs(top-rect.top)<1.5))tops.push(rect.top);
        return tops.length;
      };
      const read=()=>{
        const copy=document.querySelector<HTMLElement>('.about-hero-copy>p')!,heading=document.querySelector<HTMLElement>('h1')!;
        const range=document.createRange();range.selectNodeContents(copy);
        return {phase:document.documentElement.dataset.localePhase,copyLines:rows([...range.getClientRects()]),headingLines:rows([...heading.querySelectorAll('.heading-word-mask')].map(word=>word.getBoundingClientRect())),copyWidth:copy.getBoundingClientRect().width,copyOpacity:Number(getComputedStyle(copy).opacity),headingOpacity:Math.max(...[...heading.querySelectorAll('.heading-word')].map(word=>Number(getComputedStyle(word).opacity))),temporaryIds:document.querySelectorAll('[data-flip-id^="locale-"]').length};
      };
      const frames:ReturnType<typeof read>[]=[];
      let frame=0,done=false;
      const sample=()=>{if(document.documentElement.lang==='ru')frames.push(read());if(!done)frame=requestAnimationFrame(sample)};
      const task=changeLocale('ru');frame=requestAnimationFrame(sample);
      await task;await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
      done=true;cancelAnimationFrame(frame);return {frames,final:read()};
    });
    const resizing=report.frames.filter(frame=>frame.phase==='resizing');
    expect(resizing.length).toBeGreaterThan(3);
    for(const frame of resizing){expect(frame.copyOpacity).toBe(0);expect(frame.headingOpacity).toBe(0)}
    const visible=report.frames.filter(frame=>frame.copyOpacity>.01||frame.headingOpacity>.01);
    expect(visible.length).toBeGreaterThan(3);
    for(const frame of visible){
      expect(frame.temporaryIds).toBe(0);
      expect(frame.copyWidth).toBeCloseTo(report.final.copyWidth,0);
      expect(frame.copyLines).toBe(report.final.copyLines);
      expect(frame.headingLines).toBe(report.final.headingLines);
    }
  }
});
