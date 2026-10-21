import {test,expect} from '@playwright/test';

declare global{
 interface Window{
  oceanAudioTest:{media:HTMLAudioElement[];filters:BiquadFilterNode[];volumes:GainNode[];contexts:AudioContext[]};
 }
}

test.beforeEach(async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.addInitScript(()=>{
  const state=window.oceanAudioTest={media:[],filters:[],volumes:[],contexts:[]} as Window['oceanAudioTest'];
  window.Audio=new Proxy(Audio,{construct(target,args){const audio=Reflect.construct(target,args) as HTMLAudioElement;state.media.push(audio);return audio}});
  window.AudioContext=new Proxy(AudioContext,{construct(target,args){
   const context=Reflect.construct(target,args) as AudioContext;
   state.contexts.push(context);
   const filter=context.createBiquadFilter.bind(context),gain=context.createGain.bind(context);
   context.createBiquadFilter=()=>{const node=filter();state.filters.push(node);return node};
   context.createGain=()=>{const node=gain();state.volumes.push(node);return node};
   return context;
  }});
 });
});

test('opt-in ocean sound follows the camera and pauses outside the ocean chapters',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 await expect(page.locator('.ocean-stage.is-presented')).toBeVisible();
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 expect(await page.evaluate(()=>window.oceanAudioTest.media.length)).toBe(0);
 await page.getByRole('button',{name:'≈ Sound off'}).click();
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.media[0]?.paused)).toBe(false);
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.volumes[0].gain.value)).toBeGreaterThan(.2);
 await expect(page.locator('.audio-control')).toHaveAttribute('data-environment','surface');
 await page.getByRole('link',{name:'Explore below the surface',exact:true}).click();
 // Selecting a chapter must not muffle the sound before the camera dives.
 await expect(page.locator('.audio-control')).toHaveAttribute('data-environment','surface');
 await expect(page.locator('.ocean-stage.is-sensing-ready')).toBeVisible();
 await expect(page.locator('.audio-control')).toHaveAttribute('data-environment','underwater');
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.filters[0].frequency.value)).toBeLessThan(1000);
 await page.getByRole('link',{name:'See inside the buoy',exact:true}).click();
 await expect(page.locator('.ocean-stage.is-inside-ready')).toBeVisible();
 await expect(page.locator('.audio-control')).toHaveAttribute('data-environment','surface');
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.filters[0].frequency.value)).toBeGreaterThan(15000);
 await page.evaluate(()=>document.querySelector('#progress')!.scrollIntoView({behavior:'instant'}));
 await expect(page.locator('.audio-control')).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.media[0].paused)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.contexts[0].state)).toBe('suspended');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await expect(page.getByRole('button',{name:'Ⅱ Sound on'})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.media[0].paused)).toBe(false);
 await page.locator('.site-header').getByRole('link',{name:'The project',exact:true}).click();
 await expect(page.locator('.audio-control')).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.media[0].paused)).toBe(true);
 await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
 await page.locator('.site-header').getByRole('link',{name:'Overview',exact:true}).click();
 await expect(page.getByRole('button',{name:'Ⅱ Sound on'})).toBeVisible({timeout:20000});
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.media[0].paused)).toBe(false);
 await page.getByRole('button',{name:'Ⅱ Sound on'}).click();
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.media[0].paused)).toBe(true);
 expect(await page.evaluate(()=>window.oceanAudioTest.media.length)).toBe(1);
 expect(errors).toEqual([]);
});

test('static ocean chapters still change the underwater mix',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await page.getByRole('button',{name:'≈ Sound off'}).click();
 await page.getByRole('link',{name:'Explore below the surface',exact:true}).click();
 await expect(page.locator('.audio-control')).toHaveAttribute('data-environment','underwater');
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.filters[0].frequency.value)).toBeLessThan(1000);
 await page.getByRole('link',{name:'View the surface',exact:true}).click();
 await expect(page.locator('.audio-control')).toHaveAttribute('data-environment','surface');
 await expect.poll(()=>page.evaluate(()=>window.oceanAudioTest.filters[0].frequency.value)).toBeGreaterThan(15000);
});
