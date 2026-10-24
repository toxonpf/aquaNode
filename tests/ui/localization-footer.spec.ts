import {test,expect} from '@playwright/test';

test.use({reducedMotion:'reduce',storageState:{cookies:[],origins:[]}});

test('Russian is the default and language selection survives navigation and reload',async({page})=>{
  await page.goto('/journal');
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(page.locator('h1')).toHaveText('Наша работа на сегодня.');
  await expect(page).toHaveTitle('Журнал — AquaNode');
  await expect(page.locator('.journal-cover')).toHaveCSS('border-left-width','0px');
  const cover=await page.locator('.journal-cover').boundingBox();
  const curve=await page.locator('.journal-cover-current').boundingBox();
  expect(Math.abs(cover!.height-curve!.height)).toBeLessThan(1);
  await page.locator('header.site-header').getByRole('button',{name:'English',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('h1')).toHaveText('The work, as it stands.');
  await page.locator('#navigation').getByRole('link',{name:'The project',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('Understanding starts with observing.');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.locator('.site-footer').getByRole('button',{name:'Русский',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','ru');
  await expect(page.locator('h1')).toHaveText('Понимание начинается с наблюдения.');
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content',/наблюдения за водой/);
});

test('Russian pages and footer fit desktop and narrow phones',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});
    for(const path of ['/journal','/about','/technology','/build','/team','/']){
      await page.goto(path);
      await expect(page.locator('h1')).toBeAttached();
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      await page.evaluate(()=>document.fonts.ready);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      expect(overflow,`${path} at ${width}px`).toBeLessThanOrEqual(1);
      const footer=page.locator('.site-footer');
      await expect(footer.getByRole('navigation',{name:'Навигация в подвале'}).getByRole('link')).toHaveCount(6);
      const language=await footer.locator('.language-switch').boundingBox();
      expect(language!.x+language!.width).toBeLessThanOrEqual(width);
      if(width<760)expect((await page.locator('.menu-button').boundingBox())!.height).toBeLessThanOrEqual(56);
      if(path==='/journal'){
        const style='.site-header,.skip-link{visibility:hidden!important}';
        await footer.screenshot({path:`test-results/footer-ru-${width}.png`,style});
        await page.locator('.journal-hero').screenshot({path:`test-results/journal-ru-${width}.png`,style});
      }
    }
  }
  expect(errors).toEqual([]);
});

test('footer links and return control work',async({page})=>{
  await page.goto('/journal');
  await page.locator('.site-footer').getByRole('button',{name:'Наверх',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  await page.locator('.site-footer nav').getByRole('link',{name:/Устройство/}).click();
  await expect(page).toHaveURL('/technology');
  await expect(page.locator('h1')).toContainText('Устройство');
});

test('Russian chapter controls and member profiles stay usable on phones',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('.ocean-stage.is-presented')).toBeVisible();
  for(const [label,shot] of [['Познакомиться с буем','detail'],['Заглянуть под воду','sensing'],['Заглянуть внутрь буя','inside'],['Проследить сигнал','signal']]){
    await page.getByRole('navigation',{name:'История буя'}).getByRole('link',{name:label,exact:true}).click();
    await expect(page.locator('.ocean-stage')).toHaveAttribute('data-shot',shot);
    await expect(page.locator(`.story-panel[data-reader=${shot}]`)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.goto('/team');
  await page.getByRole('button',{name:'Открыть профиль: Тимур Куандыков',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{name:'Тимур Куандыков',exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:'Следующий участник',exact:true}).click();
  await expect(dialog.getByRole('heading',{name:'Роман Бенцлер',exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:'Закрыть',exact:true}).click();
  await expect(dialog).not.toBeVisible();
});
