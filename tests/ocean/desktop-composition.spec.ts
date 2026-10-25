import {test,expect} from '@playwright/test';
import {PerspectiveCamera,Vector3} from 'three';
import {desktopOceanFov} from '../../src/features/ocean/scene/desktopFraming';

const viewports=[[1920,1080],[1600,900],[1366,768],[1093,614],[911,512],[683,384],[546,307],[1280,1024],[2560,1080]];
const chapters=[['#buoy-intro','detail'],['#buoy-sensors','sensing'],['#buoy-inside','inside'],['#buoy-signal','signal']];

test('desktop projection keeps the reference shot inside the same scaled frame',()=>{
  const reference=new PerspectiveCamera(43,1920/1080,.1,180);
  reference.position.set(2,28.125,16.875);reference.lookAt(4.3,0,0);reference.updateMatrixWorld();
  const points=[new Vector3(0,0,0),new Vector3(-8,0,6),new Vector3(8,2,-7)];
  const projected=points.map(point=>point.clone().project(reference));
  for(const [width,height] of viewports){
    const camera=new PerspectiveCamera(desktopOceanFov(43,width,height),width/height,.1,180);
    camera.position.copy(reference.position);camera.quaternion.copy(reference.quaternion);camera.updateMatrixWorld();
    const scale=Math.min(width/1920,height/1080),left=(width-1920*scale)/2,top=(height-1080*scale)/2;
    points.forEach((point,index)=>{
      const actual=point.clone().project(camera),base=projected[index];
      expect((actual.x+1)*width/2).toBeCloseTo(left+(base.x+1)*1920/2*scale,5);
      expect((1-actual.y)*height/2).toBeCloseTo(top+(1-base.y)*1080/2*scale,5);
    });
  }
});

test('all five desktop scenes share proportional text, panels and navigation',async({page})=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1920,height:1080});await page.goto('/');
  const stage=page.locator('.ocean-stage');
  for(const language of ['Русский','English']){
    await page.locator('.site-header').getByRole('button',{name:language,exact:true}).click();
    await page.evaluate(()=>document.fonts.ready);
    const reference=new Map<string,{x:number;y:number;width:number;height:number;font:number;body:number;content:number;lines:number[]}>();
    for(const [width,height] of viewports){
      await page.setViewportSize({width,height});
      for(const [href,chapter] of chapters){
        await page.locator(`.ocean-chapters a[href="${href}"]`).click();
        await expect(stage).toHaveAttribute('data-camera-state','settled');
        await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
        const metrics=await page.locator(`[data-reader=${chapter}]`).evaluate(panel=>{
          const reader=panel.querySelector<HTMLElement>('[data-story-scroll]')!,heading=reader.querySelector('h2')!,body=reader.querySelector('p:not(.kicker)')!,r=panel.getBoundingClientRect();
          const lines=[...reader.querySelectorAll('p,h2,h3,.sensor-picker small')].map(node=>Math.round(node.getBoundingClientRect().height/parseFloat(getComputedStyle(node).lineHeight)));
          return {x:r.x,y:r.y,width:r.width,height:r.height,font:parseFloat(getComputedStyle(heading).fontSize),body:parseFloat(getComputedStyle(body).fontSize),content:reader.scrollHeight,lines};
        });
        if(width===1920){reference.set(chapter,metrics);continue}
        const base=reference.get(chapter)!,scale=Math.min(width/1920,height/1080),top=(height-1080*scale)/2;
        const x=['detail','signal'].includes(chapter)?width*.955-base.width*scale:width*.045;
        expect(Math.abs(metrics.x-x)/scale,`${chapter} x at ${width}`).toBeLessThan(2);
        expect(Math.abs((metrics.y-top)/scale-base.y),`${chapter} y at ${width}`).toBeLessThan(3);
        expect(Math.abs(metrics.width/scale-base.width),`${chapter} width at ${width}`).toBeLessThan(2);
        expect(Math.abs(metrics.height/scale-base.height),`${chapter} height at ${width}`).toBeLessThan(3);
        expect(Math.abs(metrics.font/scale-base.font),`${chapter} font at ${width}`).toBeLessThan(.6);
        expect(metrics.body/scale).toBeCloseTo(base.body,1);
        expect(metrics.lines,`${chapter} line wrapping at ${width}`).toEqual(base.lines);
        // Integer scrollHeight and border rounding accumulate at tiny CSS sizes.
        expect(Math.abs(metrics.content/scale-base.content),`${chapter} content proportions at ${width}`).toBeLessThan(Math.max(20,8/scale));
      }
      await page.locator('.ocean-chapters a[href="#ocean-title"]').click();
      const scale=Math.min(width/1920,height/1080);
      expect(await page.locator('.buoy-annotation>span').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeCloseTo(31*scale,1);
      expect((await page.locator('.ocean-chapters').boundingBox())!.width).toBeCloseTo(64*scale,1);
      expect(await page.locator('.ocean-chapters-skip-label').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeCloseTo(14*scale,1);
      expect((await page.locator('.site-header').boundingBox())!.height).toBeCloseTo(64*width/1920,1);
      await expect(page.locator('.site-header>nav')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
});
