import { test, expect } from '@playwright/test';

// test('京东获取五粮液价格', async ({ page }) => {
//   await page.goto('https://item.jd.com/100005907830.html');
//   await page.locator('.w .unlisted-bottom .right > .login-btn').click();
//   await page.getByPlaceholder('账号名/手机号/邮箱').click();
//   await page.getByPlaceholder('账号名/手机号/邮箱').fill('17762363290');
//   await page.getByPlaceholder('账号名/手机号/邮箱').press('Enter');
//   await page.getByPlaceholder('密码').fill('cwy@jd829');
//   await page.getByRole('link', { name: '登    录' }).click();
// });

test('【酒仙网】【五粮液】价格', async ({ page }) => {
  await page.goto('https://www.jiuxian.com/goods-88665.html');
  const price = await page.locator('#nowPrice strong').innerText()
  console.log('price:', price);
})
