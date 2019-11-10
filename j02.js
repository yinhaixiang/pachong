const puppeteer = require('puppeteer');
const fs = require('fs');
async function main() {
  const browser = await puppeteer.launch({headless: false, slowMo: 0});
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log(msg.text());
  });
  let a = fs.readFileSync('tt.txt');
  var aa = a.toString().split('\n');
  for(var i=0; i<aa.length; i++) {
    console.log(aa[i]);
    try {
      await page.goto(aa[i]);
    } catch (e) {
      console.log(e);
    }
  }
};
main();