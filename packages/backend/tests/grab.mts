import { chromium } from 'playwright';
import 'dotenv/config';

const grab = async () => {
  const browser = await chromium.launch({ headless: false });
  let page;

  if (process.env.PROXY_URL) {
    const context = await browser.newContext({
      proxy: {
        server: process.env.PROXY_URL,
      },
    });
    page = await context.newPage();
  } else {
    page = await browser.newPage();
  }

  await page.goto('https://www.jiuxian.com/goods-88665.html');
  const price = await page.locator('#nowPrice strong').innerText();
  const img = await page.locator('.show-pic img').getAttribute('src');
  const alt = await page.locator('.show-pic img').getAttribute('alt');
  console.log('price:', price);
  console.log('img:', img);
  console.log('alt:', alt);

  await browser.close();
};

grab();
