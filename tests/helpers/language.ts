import type {Page} from '@playwright/test';
export async function chooseLanguage(page:Page,name:string,scope='.site-header'){
 const control=page.locator(scope).locator('.language-switch');
 await control.locator('.language-trigger').click();
 await control.getByRole('menuitemradio',{name,exact:true}).click();
}
