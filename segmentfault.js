const puppeteer = require('puppeteer');


async function main() {
  const browser = await puppeteer.launch({headless: false, slowMo: 0});
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log(msg.text());
  });


  await page.goto('https://segmentfault.com/channel/backend');
  await page.waitFor('.news__item-title.mt0');


  let preScrollHeight = 0;
  let scrollHeight = -1;
  if (preScrollHeight !== scrollHeight) {
    let scrollH1 = await page.evaluate(async () => {
      let h1 = document.body.scrollHeight;
      window.scrollTo(0, h1);
      return h1;
    });

    console.log('xxx');
    console.log(scrollH1);
  }


  // browser.close();
};


main();