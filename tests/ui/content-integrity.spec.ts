import {chooseLanguage} from '../helpers/language';
import {test,expect} from '@playwright/test';

test('all three languages have valid page anchors, unique ids and no repeated visible paragraphs',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://tile.openstreetmap.org/**',route=>route.abort());
 for(const route of ['/','/about','/technology','/build','/journal','/team','/map']){
  await page.goto(route);
  for(const language of ['Русский','English','繁體中文']){
   await chooseLanguage(page,language,'.site-header');
   const issues=await page.evaluate(()=>{
    const ids=new Map<string,number>(),paragraphs=new Map<string,number>();
    document.querySelectorAll('[id]').forEach(node=>ids.set(node.id,(ids.get(node.id)||0)+1));
    document.querySelectorAll('main p').forEach(node=>{
     const box=node.getBoundingClientRect();if(!box.width||!box.height||node.closest('[inert],[aria-hidden=true]'))return;
     const text=node.textContent!.trim().replace(/\s+/g,' ');if(text.length>65)paragraphs.set(text,(paragraphs.get(text)||0)+1);
    });
    return {duplicateIds:[...ids].filter(([,count])=>count>1),duplicateParagraphs:[...paragraphs].filter(([,count])=>count>1),missingAnchors:[...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].filter(node=>node.hash.length>1&&!document.getElementById(decodeURIComponent(node.hash.slice(1)))).map(node=>node.hash)};
   });
   expect(issues,route+' '+language).toEqual({duplicateIds:[],duplicateParagraphs:[],missingAnchors:[]});
  }
 }
});

test('the status stays readable on dark heroes and the light build panel at narrow widths',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const route of ['/about','/technology','/build'])for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.goto(route);
  const notice=page.locator('.revision-notice');await notice.scrollIntoViewIfNeeded();
  const reading=await notice.evaluate(node=>{
   const title=node.querySelector('strong')!,copy=node.querySelector('.revision-notice-copy>p')!,mark=node.querySelector('svg')!;
   return {title:getComputedStyle(title).color,copy:getComputedStyle(copy).color,stroke:getComputedStyle(mark).stroke,overflow:node.scrollWidth-node.clientWidth};
  });
  const brightness=(color:string)=>{const rgb=color.match(/[\d.]+/g)!.map(Number);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
  if(route==='/build')expect(brightness(reading.title)).toBeLessThan(125);
  else expect(brightness(reading.title)).toBeGreaterThan(200);
  expect(reading.stroke).not.toBe('none');expect(reading.overflow).toBeLessThanOrEqual(1);
  await expect(notice.locator('time')).toHaveAttribute('datetime','2026-10-29');
 }
});
