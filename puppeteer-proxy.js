const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({
    args: [
      '--proxy-server=http://183.164.239.50:9999',
    ],
    ignoreHTTPSErrors: true,
    headless: false,
  });


  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 0});
  await page.setExtraHTTPHeaders({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'});


  await page.goto('http://baidu.com/');

}

main();