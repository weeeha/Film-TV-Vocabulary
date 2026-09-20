import {test,expect} from '@playwright/test';
async function openSearch(page:import('@playwright/test').Page){await page.getByRole('button',{name:/search/i}).filter({visible:true}).first().click();}
test('search retries a failed load and reaches a stable term',async({page})=>{
 await page.route('**/generated/search.json',r=>r.abort());await page.goto('/wiki/lighting-and-color');await openSearch(page);
 await expect(page.getByText('Search could not load.',{exact:false})).toBeVisible();await page.unroute('**/generated/search.json');await page.getByRole('button',{name:'Retry',exact:true}).click();
 await page.getByRole('dialog').getByRole('textbox').fill('key light');await expect(page.getByRole('option').first()).toContainText('Key light');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#lighting-and-color\.key-light$/);await expect(page.locator('[id="key-light"]')).toBeInViewport();
});
test('loading, empty results, keyboard close and focus restoration',async({page})=>{
 let release:()=>void=()=>{};const gate=new Promise<void>(r=>release=r);await page.route('**/generated/search.json',async r=>{await gate;await r.continue();});
 await page.goto('/');const opener=page.getByRole('button',{name:/search/i}).filter({visible:true}).first();await opener.click();await expect(page.getByText('Loading search…')).toBeVisible();release();
 await page.getByRole('dialog').getByRole('textbox').fill('zzzxunknown');await expect(page.getByText('No results for',{exact:false})).toBeVisible();await page.keyboard.press('Escape');await expect(opener).toBeFocused();
 await page.keyboard.press('ControlOrMeta+k');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
});
