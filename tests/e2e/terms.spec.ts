import {test,expect} from '@playwright/test';
test('shared filters and Back restore the same result set',async({page})=>{
 await page.goto('/terms?q=light&chapter=lighting-and-color');await expect(page.getByLabel('Filter terms')).toHaveValue('light');await expect(page.getByLabel('Chapter',{exact:true})).toHaveValue('lighting-and-color');
 const count=await page.getByRole('status').textContent();await page.getByRole('button',{name:'Clear filters'}).click();await expect(page).toHaveURL(/\/terms$/);await page.goBack();await expect(page.getByLabel('Chapter',{exact:true})).toHaveValue('lighting-and-color');await expect(page.getByRole('status')).toHaveText(count!);
 await page.getByRole('link',{name:'Key light Lighting and color',exact:true}).click();await expect(page).toHaveURL(/#lighting-and-color\.key-light$/);
});
test('typing, invalid chapters and no results behave consistently',async({page})=>{
 await page.goto('/terms?chapter=unknown');await expect(page.getByLabel('Chapter',{exact:true})).toHaveValue('');await expect(page.getByRole('status')).toContainText('643 terms');
 await page.getByLabel('Filter terms').fill('zzzxunknown');await expect(page).toHaveURL(/q=zzzxunknown/);await expect(page.getByRole('status')).toHaveText('0 terms');await expect(page.getByText('No matching terms.')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();await expect(page.getByRole('status')).toContainText('643 terms');
});
test('initial index and filtering work without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});const page=await context.newPage();await page.goto('/terms?q=key+light&chapter=lighting-and-color');await expect(page.getByRole('link',{name:'Key light Lighting and color',exact:true})).toBeVisible();await context.close();
});
