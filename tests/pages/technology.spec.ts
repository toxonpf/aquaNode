import {test,expect} from '@playwright/test';

test('technology switches original drawings and explains board paths',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/technology');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Inside the buoy.');
 await expect(page.locator('.tech-drawings img')).toHaveAttribute('src','/assets/engineering/ec-revb-architecture-en.svg');
 await expect(page.locator('.tech-drawings')).toContainText('not a prototype photograph');
 await page.getByRole('button',{name:'02 Estimate EC',exact:true}).click();
 await expect(page.locator('#tech-path-detail')).toContainText('independent standards');
 await page.getByRole('button',{name:'04 Record',exact:true}).click();
 await expect(page.locator('#tech-path-detail')).toContainText('USB logging');
 for(const width of [1920,1440,1024,768,390,320]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'test-results/technology-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'test-results/technology-mobile.png',fullPage:true});
 expect(errors).toEqual([]);
});

test('supporting text retains the reference reading sizes within the shared scale',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/','/about','/technology','/build','/journal','/team']){
   await page.goto(route);
   const tooSmall=await page.evaluate(()=>Array.from(document.querySelectorAll('header,main,footer')).flatMap(root=>Array.from(root.querySelectorAll('*'))).filter(node=>{
    if(node.closest('svg,[aria-hidden="true"],.sr-only'))return false;
    if(matchMedia('(hover:hover) and (pointer:fine)').matches&&node.closest('.ocean-stage,.site-header.ocean-header:not(.is-solid)'))return false;
    if(!Array.from(node.childNodes).some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent?.trim()))return false;
    const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
    const scale=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;
    return rect.width>0&&rect.height>0&&style.display!=='none'&&Number.parseFloat(style.fontSize)/scale<13.99;
   }).map(node=>({element:node.tagName,class:node.className,size:getComputedStyle(node).fontSize,text:node.textContent?.slice(0,45)})));
   expect(tooSmall,`${route} at ${width}px`).toEqual([]);
   const prose={
    '/':'.status-grid p',
    '/about':'.about-idea-copy>p:not(.kicker)',
    '/technology':'.tech-hero-copy>p:not(.kicker)',
    '/build':'.build-step-content>p',
    '/journal':'.journal article p:not(.kicker)',
    '/team':'.team-person-info>p',
   }[route]!;
   const sizes=await page.locator(prose).evaluateAll(nodes=>nodes.map(node=>{
    const style=getComputedStyle(node);
    const scale=parseFloat(getComputedStyle(document.documentElement).fontSize)/16;
    return {size:parseFloat(style.fontSize)/scale,spacing:Number((parseFloat(style.lineHeight)/parseFloat(style.fontSize)).toFixed(3))};
   }));
   expect(sizes.length,`${route} has reading text`).toBeGreaterThan(0);
   for(const text of sizes){
    expect(text.size,`${route} body text at ${width}px`).toBeGreaterThanOrEqual(16);
    expect(text.spacing,`${route} line spacing at ${width}px`).toBeGreaterThanOrEqual(1.6);
   }
  }
 }
});

test('mobile aerial scene renders across the full viewport',async({page})=>{
 await page.setViewportSize({width:406,height:900});
 await page.goto('/');
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.getByRole('link',{name:'Follow the signal',exact:true}).click();
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-camera-state','settled');
 await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot','signal');
 await expect(page.locator('.signal-introduction')).toHaveCSS('opacity','1');
 await expect.poll(()=>page.locator('#signal-story-title .heading-word').first().evaluate(node=>getComputedStyle(node).opacity)).toBe('1');
 const bounds=await page.locator('.ocean-hero canvas').boundingBox();
 expect(bounds?.width).toBe(406);expect(bounds?.height).toBe(900);
 await page.screenshot({path:'test-results/mobile-ocean-aerial.png'});
});
