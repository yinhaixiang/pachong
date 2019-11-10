const puppeteer = require('puppeteer');

let totalComments = [];


// 获取当前页的评论内容列表
async function getCurrentPageComments(page) {
  let currentPageComments = await page.$$eval('#comments > div', eles => {
    let tmpComments = [];
    eles.forEach(async ele => {
      let comment = $(ele).find('div.comment > p > span').text();
      if (comment.includes('傻白甜')) {
        tmpComments.push(comment);
      }
    });
    return tmpComments;
  });
  return currentPageComments;
}


async function main() {
  const browser = await puppeteer.launch({headless: false, slowMo: 0});
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(msg.text());
  });


  // 设置视窗大小
  await page.setViewport({width: 1500, height: 0});

  // 先登录
  await page.goto('https://accounts.douban.com/passport/login');
  await page.click('#account > div.login-wrap > div.login-right > div > div.account-body-tabs > ul.tab-start > li.account-tab-account');
  await page.type('#username', 'xxx');
  await page.type('#password', 'xxx');
  await page.click('#tmpl_phone > div.account-form-field-submit > a');
  await page.waitForNavigation();


  // 进入首页
  await page.goto('https://movie.douban.com/subject/26741568/comments?status=P');


  let currentPageComments = await getCurrentPageComments(page);
  console.log(currentPageComments);
  console.log("-------------------");
  totalComments = totalComments.concat(currentPageComments);
  let nextPageBtn = await page.$eval('#paginator > a.next', ele => ele.text);
  while (nextPageBtn == '后页 >') {
    await page.click('#paginator > a.next');
    await page.waitFor('#paginator > a.next');
    let currentPageComments = await getCurrentPageComments(page);
    console.log(currentPageComments);
    console.log("-------------------");
    totalComments = totalComments.concat(currentPageComments);
  }


  browser.close();
};


main();