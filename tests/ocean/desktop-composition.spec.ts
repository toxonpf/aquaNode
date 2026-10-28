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

test('all five scenes keep readable UI and reflow across viewport shapes',async({page})=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1920,height:1080});await page.goto('/');
  const stage=page.locator('.ocean-stage');
  for(const language of ['Русский','English']){
    await page.locator('.site-header').getByRole('button',{name:language,exact:true}).click();
    await page.evaluate(()=>document.fonts.ready);
    for(const [width,height] of [...viewports,[1430,983],[1024,1366],[768,1024],[844,390],[390,844]]){
      await page.setViewportSize({width,height});
      for(const [href,chapter] of chapters){
        await page.locator(`.ocean-chapters a[href="${href}"]`).click();
        await expect(stage).toHaveAttribute('data-camera-state','settled');
        await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
        const metrics=await page.locator(`[data-reader=${chapter}]`).evaluate(panel=>{
          const reader=panel.querySelector<HTMLElement>('[data-story-scroll]')!,heading=reader.querySelector('h2')!,body=reader.querySelector('p:not(.kicker)')!,r=reader.getBoundingClientRect();
          const rows=new Set([...heading.querySelectorAll('.heading-word-mask')].map(word=>Math.round(word.getBoundingClientRect().top)));
          const navigation=document.querySelector('.ocean-chapters')!.getBoundingClientRect();
          return {x:r.x,y:r.y,right:r.right,height:r.height,body:parseFloat(getComputedStyle(body).fontSize),rows:rows.size,navHorizontal:navigation.width>navigation.height,navBottom:navigation.bottom};
        });
        expect(metrics.x,`${chapter} left at ${width}`).toBeGreaterThanOrEqual(0);
        expect(metrics.right,`${chapter} right at ${width}`).toBeLessThanOrEqual(width);
        expect(metrics.body,`${chapter} readable copy at ${width}`).toBeGreaterThanOrEqual(16);
        expect(metrics.rows,`${chapter} heading rows at ${width}`).toBeLessThanOrEqual(2);
        expect(metrics.height).toBeGreaterThanOrEqual(64);
        if(metrics.navHorizontal)expect(metrics.y,`${chapter} clears chapter navigation at ${width}`).toBeGreaterThanOrEqual(metrics.navBottom+4);
      }
      await page.locator('.ocean-chapters a[href="#ocean-title"]').click();
      expect(await page.locator('.buoy-annotation>span').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(24);
      expect(await page.locator('.ocean-chapters-skip-label').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(12);
      expect((await page.locator('.site-header').boundingBox())!.height).toBeCloseTo(width<=760?56:64,1);
      await expect(page.locator(width>1180?'.site-header>nav':'.site-header .menu-button')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
});
