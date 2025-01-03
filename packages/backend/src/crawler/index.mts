import { chromium } from 'playwright';
import 'dotenv/config';
import debugLibrary from 'debug';
import { type ITaskField } from '../service/task.mjs';
import * as cheerio from 'cheerio';

const debug = debugLibrary('crawler');

type ICrawlerOptions = {
  url: string;
  useProxy: number;
  fields: ITaskField[];
};

const crawler = async (crawlerOptions: ICrawlerOptions) => {
  debug('crawlerOptions:', crawlerOptions);
  const { url, useProxy, fields } = crawlerOptions;
  const result: ITaskField[] = [];
  const browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true',
  });
  let page;

  if (useProxy && !process.env.PROXY_URL) {
    throw new Error('未配置代理, 但是 useProxy 为 true');
  }

  if (useProxy) {
    const context = await browser.newContext({
      proxy: {
        server: process.env.PROXY_URL,
      },
    });
    page = await context.newPage();
  } else {
    page = await browser.newPage();
  }
  await page.goto(url);
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const { value, access, accessArgs, code } = field;
    let val: string = '';
    if (!code) {
      const locator = await page.locator(value);
      if (access === 'attr') {
        if (!accessArgs) {
          throw new Error('当 access 为 attr 时, accessArgs 不能为空');
        }
        val = await locator.getAttribute(accessArgs);
      } else if (access === 'innerText') {
        val = await locator.innerText();
      }
    } else {
      const content = await page.content();
      const $ = cheerio.load(content);
      const func = new Function('$', code)();
      val = func($);
    }
    result.push({
      ...field,
      value: val,
    });
  }

  await browser.close();
  debug('result:', result);
  return result;
};

export { crawler };
