import { test as base } from '@playwright/test';
import 'dotenv/config';

export const test = base.extend({
  // @ts-ignore
  page: async ({ browser }, use) => {
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
    await use(page);
  },
});
