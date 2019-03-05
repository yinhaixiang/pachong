const puppeteer = require('puppeteer');
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({headless: true, slowMo: 0});
  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 0});
  page.on('console', msg => {
    console.log(msg.text());
  });


  const handle = await page.evaluateHandle(() => ({window, document}));
  const properties = await handle.getProperties();
  const windowHandle = properties.get('window');


  await page.exposeFunction('dateDiff', (nowDate, diffString) => {
    function fmtDate(obj, needTime) {
      var date = new Date(obj);
      var y = 1900 + date.getYear();
      var m = "0" + (date.getMonth() + 1);
      var d = "0" + date.getDate();
      var h = "0" + date.getHours();                  //时
      var min = "0" + date.getMinutes();              //分
      var s = "0" + date.getSeconds();              //秒
      if (needTime) {
        return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length) +
          ' ' + h.substring(h.length - 2, h.length) + ":00:00";
      } else {
        return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length) + ' 00:00:00';
      }
    }

    nowDate = new Date(nowDate);

    const minuteReg = /分钟前/;
    const hourReg = /小时前/;
    const dayReg = /天前/;
    const monthReg = /月前/;
    const yearReg = /年前/;
    if (minuteReg.test(diffString)) {
      return fmtDate(nowDate.getTime(), true);
    }

    if (hourReg.test(diffString)) {
      const hourTimestamp = Number(diffString.split('小时前')[0]) * 3600 * 1000;
      return fmtDate(nowDate.getTime() - hourTimestamp, true);
    }
    if (dayReg.test(diffString)) {
      const dayTimestamp = Number(diffString.split('天前')[0]) * 24 * 3600 * 1000;
      return fmtDate(nowDate.getTime() - dayTimestamp, false);
    }
    if (monthReg.test(diffString)) {
      const monthTimestamp = Number(diffString.split('月前')[0]) * 30 * 24 * 3600 * 1000;
      return fmtDate(nowDate.getTime() - monthTimestamp, false);
    }
    if (yearReg.test(diffString)) {
      const yearTimestamp = Number(diffString.split('年前')[0]) * 365 * 24 * 3600 * 1000;
      return fmtDate(nowDate.getTime() - yearTimestamp, false);
    }
    return '时间格式有误';


  });


  await page.goto('https://juejin.im/welcome/backend');
  await page.waitFor('#juejin > div.view-container > main > div > div.feed.welcome__feed > ul > li > div > div > a > div > div.info-box');


  let preScrollHeight = 0;
  let scrollHeight = -1;
  let cnt = 0;
  while (preScrollHeight !== scrollHeight) {
  // while (cnt < 10000) {
    // 详情信息是根据滚动异步加载，所以需要让页面滚动到屏幕最下方，通过延迟等待的方式进行多次滚动
    let scrollH1 = await page.evaluate(async () => {
      let h1 = document.body.scrollHeight;
      window.scrollTo(0, h1);
      return h1;
    });
    await page.waitFor(500);
    let scrollH2 = await page.evaluate(async () => {
      return document.body.scrollHeight;
    });
    let scrollResult = [scrollH1, scrollH2];
    preScrollHeight = scrollResult[0];
    scrollHeight = scrollResult[1];
    cnt++;
    console.log(scrollResult, cnt);
  }

  let blogs = await page.$$eval('#juejin > div.view-container > main > div > div.feed.welcome__feed > ul > li > div > div > a > div > div.info-box', async eles => {
    let tmpBlogs = [];
    eles.forEach(async ele => {
      let old_date = ele.querySelector('div.info-row.meta-row > ul.meta-list > li:nth-last-child(2)').innerText;
      let blog_date = await window.dateDiff(new Date(), old_date);
      let title = ele.querySelector('div.info-row.title-row > a').innerText;
      let content = ele.querySelector('div.info-row.title-row > a').href;
      tmpBlogs.push({
        title: title,
        content: content,
        blog_date: blog_date
      });
    });
    return tmpBlogs;
  });

  let writerStream = fs.createWriteStream('juejin.json');
  writerStream.write(JSON.stringify(blogs));
  writerStream.end();
  console.log('write done');


  // browser.close();
};


main();


