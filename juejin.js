const puppeteer = require('puppeteer');


async function main() {
  const browser = await puppeteer.launch({headless: true, slowMo: 0});
  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 0});
  page.on('console', msg => {
    console.log(msg.text());
  });

  await page.exposeFunction('abc', (nowDate) => {
    console.log(nowDate);
  });

  await page.exposeFunction('dateDiff', (nowDate) => {
    // page.window.abc(nowDate);
  });



  await page.goto('https://juejin.im/welcome/backend');
  await page.waitFor('#juejin > div.view-container > main > div > div.feed.welcome__feed > ul > li > div > div > a > div > div.info-box');


  let preScrollHeight = 0;
  let scrollHeight = -1;
  let cnt = 0;
  // while (preScrollHeight !== scrollHeight) {
  while (cnt < 0) {
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
    console.log(scrollResult);
    preScrollHeight = scrollResult[0];
    scrollHeight = scrollResult[1];
    cnt++;
  }

  let blogs = await page.$$eval('#juejin > div.view-container > main > div > div.feed.welcome__feed > ul > li > div > div > a > div > div.info-box', async eles => {
    // let tmpBlogs = [];
    // eles.forEach(async ele => {
    //   debugger;
    //   let blog_date = window.dateDiff(new Date(), ele.querySelector('div.info-row.meta-row > ul.meta-list > li:nth-last-child(2)').innerText);
    //   console.log(blog_date);
    //   tmpBlogs.push({});
    // });
    // return tmpBlogs;

    // console.log(window);
    let result = await window.dateDiff('dfasdfsadf');
    // console.log(result);


  });

  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxx');


  // browser.close();
};


main();


