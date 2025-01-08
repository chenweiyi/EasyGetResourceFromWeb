import { chromium } from 'playwright';
import 'dotenv/config';
import debugLibrary from 'debug';
import { type ITaskField } from '../service/task';
import * as cheerio from 'cheerio';

const debug = debugLibrary('crawler');

export type ICrawlerOptions = {
  url: string;
  useProxy: number;
  fields: ITaskField[];
};

export type IPatchCrawlerOptions = Array<ICrawlerOptions & { id: number }>;

export type IFlowItem = Array<IFlowItem> | number;
export type IFlowData = Array<IFlowItem>;

const crawler = async (crawlerOptions: ICrawlerOptions, pre?: ITaskField[]) => {
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
      const func = new Function('$', 'pre', code)();
      val = func($, pre);
    }
    result.push({
      ...field,
      value: val,
    });
  }

  await browser.close();
  return result;
};

const crawlerPatch = async (
  tasks: IPatchCrawlerOptions,
  taskFlow: IFlowData,
) => {
  let result: ITaskField[] = [];
  let pre: ITaskField[] = [];
  for (let i = 0; i < taskFlow.length; i++) {
    const id = taskFlow[i];
    if (typeof id === 'number') {
      const task = tasks.find(t => t.id === id);
      if (!task) {
        throw new Error('任务不存在');
      }
      const { url, useProxy, fields } = task;
      const crawlerOptions: ICrawlerOptions = {
        url,
        useProxy,
        fields,
      };
      const res = await crawler(crawlerOptions, pre);
      result = pre = res;
    } else if (Array.isArray(id)) {
      if (id.some(d => typeof d !== 'number')) {
        throw new Error('最多只能嵌套一层数组');
      }
      const res = await Promise.all(
        id.map(d => {
          const task = tasks.find(t => t.id === d);
          if (!task) {
            throw new Error('任务不存在');
          }
          const { url, useProxy, fields } = task;
          const crawlerOptions: ICrawlerOptions = {
            url,
            useProxy,
            fields,
          };
          return crawler(crawlerOptions, pre);
        }),
      );
      result = pre = res.flat();
    } else {
      throw new Error(`task_flow 格式错误: ${JSON.stringify(taskFlow)} `);
    }
  }
  return result;
};

export { crawler, crawlerPatch };
