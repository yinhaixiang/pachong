const puppeteer = require('puppeteer');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://egg_cnode:bojun1234@106.54.233.42:27127/egg_cnode?authSource=egg_cnode";

async function main() {
  console.time('aa');
  const browser = await puppeteer.launch({headless: false, slowMo: 0});
  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 0});
  await page.setExtraHTTPHeaders({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'});

  const client = await MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = client.db('egg_cnode');

  let topics = await db.collection('topics')
    .find(
      {tab: 'toutiao', content: /https:\/\/toutiao.io/}
    ).skip(0).limit(10000).sort({create_at: -1})
    .toArray();

  for (let i = 0; i < topics.length; i++) {
    let topic = topics[i];
    try {
      console.log(i + '.......', topic.title, topic.content);
      await page.goto(topic.content, {timeout: 3 * 1000, waitUntil: 'domcontentloaded'});
      let content = page.url();
      let result = await db.collection('topics').updateOne({_id: topic._id}, {
        $set: {
          content: content
        }
      });
      console.log(i, topics.length, content);
    } catch (e) {
      console.log('xxxxxxxxxxxxxxxxxx');
      let content = page.url();
      let result = await db.collection('topics').updateOne({_id: topic._id}, {
        $set: {
          content: content
        }
      });
      console.log(i, topics.length, content);
      console.log('yyyyyyyyyyyyyy');
    }
  }

  console.timeEnd('aa');
  browser.close();
  client.close();

}

main();