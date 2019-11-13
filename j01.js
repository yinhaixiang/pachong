const puppeteer = require('puppeteer');
const MongoClient = require('mongodb').MongoClient;
let CronJob = require('cron').CronJob;
const url = "mongodb://egg_cnode:bojun1234@106.54.233.42:27127/egg_cnode?authSource=egg_cnode";


async function main() {
  const browser = await puppeteer.launch({headless: true, slowMo: 0});
  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 0});
  await page.setExtraHTTPHeaders({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'});

  const client = await MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = client.db('egg_cnode');

  let topics = await db.collection('topics')
    .find(
      {tab: 'tuicool', content: {$not: /原文/}}
    ).limit(30).sort({create_at: -1})
    .toArray();

  for (let i = 0; i < topics.length; i++) {
    let topic = topics[i];
    console.log(i + '.......', topic.title);
    if (!topic.content.includes('原文')) {
      try {
        await page.goto(topic.content, {waitUntil: 'domcontentloaded'});
        await page.waitFor(3000 + Math.floor(Math.random() * (1000)));
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
          console.log('发生异常了, url为', page.url());
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


new CronJob('0 57 8,9,10,11,12,13,14,15,16,17,18,19,21,22,23 * * *', function () {
  console.log((new Date()).toLocaleString(), '开始执行任务...');
  main();
}, null, true);
