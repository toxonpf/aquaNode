import {test,expect} from '@playwright/test';

test('all member profiles fit the viewport and preserve faces and Timur’s raised hand',async({browser})=>{
 test.setTimeout(90000);
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 await context.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
 const page=await context.newPage();
 try{
  for(const locale of ['ru','en']){
   await context.addInitScript(value=>localStorage.setItem('aquanode.locale',value),locale);
   for(const [width,height] of [[320,568],[390,844],[430,932],[683,384],[1093,614],[1440,1000]]){
    await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:5173/team');
    await page.locator('.team-portrait-trigger').first().tap();
    for(let index=0;index<5;index++){
     await page.evaluate(()=>document.fonts.ready);
     const overflow=await page.locator('.team-profile-content,.team-profile-info-viewport,.team-profile-info').evaluateAll(nodes=>nodes.map(node=>node.scrollHeight-node.clientHeight));
     expect(overflow,`${locale} ${width}×${height} member ${index}`).toEqual([0,0,0]);
     const bounds=await page.getByRole('dialog').boundingBox();
     expect(bounds!.y).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(height);
     await expect(page.locator('.team-profile-pagination')).toBeInViewport({ratio:1});
     if(index<2){
      await expect(page.locator('.team-profile-portrait img')).toHaveJSProperty('complete',true);
      const crop=await page.locator('.team-profile-portrait img').evaluate((image:HTMLImageElement,index)=>{
       const style=getComputedStyle(image),r=image.getBoundingClientRect(),p=style.objectPosition.split(' ').map(Number.parseFloat);
       const scale=Math.max(r.width/image.naturalWidth,r.height/image.naturalHeight);
       const offset=(r.height-image.naturalHeight*scale)*p[1]/100;
       return {top:offset+(index===0?365:450)*scale,bottom:offset+(index===0?995:765)*scale,height:r.height};
      },index);
      expect(crop.top,`${locale} ${width}×${height} upper landmark`).toBeGreaterThanOrEqual(0);
      expect(crop.bottom,`${locale} ${width}×${height} whole face`).toBeLessThanOrEqual(crop.height);
     }
     if(index<4)await page.getByRole('button',{name:locale==='ru'?'Следующий участник':'Next team member',exact:true}).tap();
    }
    await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
   }
  }
 }finally{await context.close()}
});

test('board links remain centred on their modules during text entrance, resize and selection',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/technology');
 for(const width of [1920,1440,1024,768]){
  await page.setViewportSize({width,height:900});
  await page.locator('.circuit-network').scrollIntoViewIfNeeded();
  for(const active of [0,1,3]){
   await page.locator(`.circuit-node--${active}`).click();
   const errors=await page.locator('.circuit-traces>g:nth-child(3)>path').first().evaluate((path:SVGPathElement)=>{
    const matrix=path.getScreenCTM()!;
    return [0,path.getTotalLength()].map((length,index)=>{
     const p=path.getPointAtLength(length),point=new DOMPoint(p.x,p.y).matrixTransform(matrix);
     const r=document.querySelector(index===0?'.circuit-node--1':'.circuit-node--0')!.getBoundingClientRect();
     return Math.hypot(point.x-r.left-r.width/2,point.y-r.top-r.height/2);
    });
   });
   expect(errors.every(error=>error<1),`${width}: ${errors}`).toBe(true);
  }
 }
});

test('footer page links retain their arrow treatment and readable labels on phones',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:568});
 await page.goto('/team');
 const links=page.locator('.footer-directory nav a');await expect(links).toHaveCount(7);
 for(const link of await links.all()){
  await expect(link.locator('.footer-nav-label')).toBeVisible();
  await expect(link.locator('.flexible-arrow--up-right')).toBeVisible();
  const fits=await link.evaluate(node=>node.scrollWidth<=node.clientWidth+1);expect(fits).toBe(true);
 }
});
