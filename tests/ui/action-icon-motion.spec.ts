import {test,expect} from '@playwright/test';

test('outbound icon keeps only its tail moving until hover or focus',async({page})=>{
 await page.goto('/about');
 const icon=page.locator('.footer-legal .external-link-icon').first();
 await icon.scrollIntoViewIfNeeded();
 expect(await icon.evaluate(node=>parseFloat(getComputedStyle(node).width))).toBe(12);
 await page.mouse.move(0,0);
 await expect(icon.locator('.external-link-arrow')).toHaveCSS('animation-name','none');
 await expect(icon.locator('.external-link-shaft')).toHaveCSS('animation-name','external-link-wave');
 const link=page.locator('.footer-legal .external-inline').first();
 await link.hover();
 await expect(icon.locator('.external-link-arrow')).toHaveCSS('animation-iteration-count','1');
 const samples=await icon.locator('.external-link-arrow').evaluate(node=>{
  const animation=node.getAnimations().find(animation=>animation instanceof CSSAnimation&&animation.animationName==='external-link-depart')!;
  const duration=Number(animation.effect!.getTiming().duration);
  animation.pause();
  return [0,.38,.46,.65].map(phase=>{
   animation.currentTime=phase*duration;
   const style=getComputedStyle(node),matrix=new DOMMatrix(style.transform);
   return {x:matrix.e,y:matrix.f,opacity:Number(style.opacity)};
  });
 });
 expect(samples[1].x-samples[0].x).toBeGreaterThan(3.5);
 expect(samples[1].y-samples[0].y).toBeLessThan(-3.5);
 expect(samples[2].opacity).toBeLessThan(.05);
 expect(samples[3].opacity).toBeGreaterThan(.95);
 await page.mouse.move(0,0);
 await expect(icon.locator('.external-link-arrow')).toHaveCSS('animation-name','none');
 await expect(icon.locator('.external-link-shaft')).toHaveCSS('animation-name','external-link-wave');
 await link.focus();
 await expect(icon.locator('.external-link-arrow')).toHaveCSS('animation-name','external-link-depart');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(icon.locator('.external-link-arrow')).toHaveCSS('animation-name','none');
 await expect(icon.locator('.external-link-shaft')).toHaveCSS('animation-name','none');
});

test('download icon waves its tail at rest and lands only on hover or focus',async({page})=>{
 await page.goto('/build');
 const card=page.locator('.action-download').first();await card.scrollIntoViewIfNeeded();
 await page.mouse.move(0,0);
 for(const selector of ['.download-link-arrow','.download-link-tray','.download-link-ripple'])await expect(card.locator(selector)).toHaveCSS('animation-name','none');
 await expect(card.locator('.download-link-shaft')).toHaveCSS('animation-name','download-link-wave');
 await card.hover();
 await expect(card.locator('.download-link-arrow')).toHaveCSS('animation-iteration-count','1');
 const motion=await card.evaluate(node=>{
  const sample=(selector:string,name:string,phase:number)=>{
   const element=node.querySelector(selector)!;
   const animation=element.getAnimations().find(animation=>animation instanceof CSSAnimation&&animation.animationName===name)!;
   animation.pause();animation.currentTime=Number(animation.effect!.getTiming().duration)*phase;
   const style=getComputedStyle(element);return {y:new DOMMatrix(style.transform).f,scale:new DOMMatrix(style.transform).d,opacity:Number(style.opacity)};
  };
  return {arrow:sample('.download-link-arrow','download-link-arrive',.34),tray:sample('.download-link-tray','download-link-catch',.38),ripple:sample('.download-link-ripple','download-link-ripple',.38)};
 });
 expect(motion.arrow.y).toBeGreaterThan(3.5);expect(motion.tray.scale).toBeLessThan(.7);expect(motion.ripple.opacity).toBeGreaterThan(.5);
 await page.mouse.move(0,0);
 for(const selector of ['.download-link-arrow','.download-link-tray','.download-link-ripple'])await expect(card.locator(selector)).toHaveCSS('animation-name','none');
 await expect(card.locator('.download-link-ripple')).toHaveCSS('opacity','0');
 await card.focus();
 await expect(card.locator('.download-link-arrow')).toHaveCSS('animation-name','download-link-arrive');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(card.locator('.download-link-arrow')).toHaveCSS('animation-name','none');
 await expect(card.locator('.download-link-ripple')).toHaveCSS('display','none');
});
