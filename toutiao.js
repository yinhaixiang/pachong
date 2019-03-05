const puppeteer = require('puppeteer');

let totalComments = [];


async function main() {
  const browser = await puppeteer.launch({headless: true, slowMo: 0});
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(msg.text());
  });


  // 设置视窗大小
  await page.setViewport({width: 1500, height: 0});


  await page.goto('https://toutiao.io/prev/2019-01-01');
  await page.waitFor('.hide, .jscroll-next');


  let page_date = '2019-01-01';

  page.page_date = page_date;

  let blogs = await page.$$eval('.posts > .post > div.content > h3 > a', eles => {
    let tmpBlogs = [];
    eles.forEach(async ele => {
      console.log('xxx');
      tmpBlogs.push({
        title: ele.innerText,
        content: ele.href
      });
      return tmpBlogs;
    });
    return tmpBlogs;
  });

  console.log(blogs);

  browser.close();
};


main();