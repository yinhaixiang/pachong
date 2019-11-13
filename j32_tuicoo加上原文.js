const puppeteer = require('puppeteer');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://egg_cnode:bojun1234@106.54.233.42:27127/egg_cnode?authSource=egg_cnode";

async function main() {
  const browser = await puppeteer.launch({headless: true, slowMo: 0});
  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 0});
  await page.setExtraHTTPHeaders({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'});

  // await page.goto('https://www.tuicool.com/login');
  // await page.type('#xlEmail', 'yinhaixiang@qq.com');
  // await page.type('#xlPassword', 'sean0410');
  // await page.click('body > div.container-fluid > div.center_container.container-top > form > fieldset > div > div:nth-child(4) > button');
  // await page.waitFor(1000);

  const client = await MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = client.db('egg_cnode');

  let topics = await db.collection('topics')
    .find(
      {tab: 'tuicool', content: {$not: /原文/}}
    ).skip(0).limit(10000).sort({create_at: -1})
    .toArray();

  for (let i = 0; i < topics.length; i++) {
    let topic = topics[i];
    console.log(i + '.......', topic.title);
    if (!topic.content.includes('原文')) {
      try {
        await page.goto(topic.content, {timeout: 3 * 1000, waitUntil: 'domcontentloaded'});
        await page.waitFor(1000 + Math.floor(Math.random() * (1000)));
        let real_url = await page.$eval('body > div.container-fluid > div.row-fluid.article_row_fluid > div.span8.contant.article_detail_bg > div.article_meta > div.source > a', el => el.href);
        topic.content = `${topic.content}\r\n原文\r\n${real_url}`;
        let tmpSource = await page.$eval('body > div.container-fluid > div.row-fluid.article_row_fluid > div.span8.contant.article_detail_bg > div.article_meta > div:nth-child(1) > span.from > a', el => el.innerText.trim());
        let blogDate = await page.$eval('body > div.container-fluid > div.row-fluid.article_row_fluid > div.span8.contant.article_detail_bg > div.article_meta > div:nth-child(1) > span.timestamp', el => el.innerText);
        if (tmpSource) {
          topic.source = tmpSource;
        }
        if (blogDate) {
          topic.create_at = topic.update_at = new Date(blogDate.replace('时间', '').trim())
        }
      } catch (e) {
        if (page.url() != topic.content && page.url() != 'chrome-error://chromewebdata/') {
          topic.content = `${topic.content}\r\n原文\r\n${page.url()}`;
        } else {
          console.log(e.message);
        }
      }
      console.log(i, topics.length, topic.source, topic.create_at, topic.content);
      let result = await db.collection('topics').updateOne({_id: topic._id}, {
        $set: {
          content: topic.content,
          source: topic.source,
          create_at: topic.create_at,
          update_at: topic.update_at
        }
      });
    }
  }

  browser.close();
  client.close();

}

main();