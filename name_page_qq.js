const puppeteer = require('puppeteer');
const axios = require('axios');


let songsInfo = [];


async function main(singer) {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  
  // 获取歌曲的下载链接
  async function getDownloadUrl(songId) {
    async function getSongKey(songId) {
      try {
        const getKeyUrl = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg' +
          '?g_tk=5381&jsonpCallback=MusicJsonCallback28043834565921555&loginUin=0' +
          '&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq' +
          '&needNewCode=0&cid=205361747&callback=MusicJsonCallback28043834565921555' +
          `&uin=0&songmid=${songId}&filename=C400${songId}.m4a&guid=9506794243`;
        const response = await axios.get(getKeyUrl);
        var p = /key":"(.*?)"/;
        var r = p.exec(response.data);
        return r && r[1];
      } catch (error) {
        console.error(error);
      }
    }
    
    const songKey = await getSongKey(songId);
    // 试听版本
    // const downloadUrl = `http://dl.stream.qqmusic.qq.com/C400${songId}.m4a?vkey=${songKey}&guid=9506794243&uin=0&fromtag=66`;
    
    // 高品质版本
    const downloadUrl = `http://dl.stream.qqmusic.qq.com/M800${songId}.mp3?vkey=${songKey}&guid=9506794243&fromtag=53`;
    return downloadUrl;
  }
  
  // 获取当页歌曲信息: {name, id_url, id}
  async function getCurrentPageSongsInfo() {
    var currentPageSongsInfo = await page.$$eval('#song_box > li', eles => {
      var tmpSongs = [];
      eles.forEach(async ele => {
        var name = $(ele).find('div > div.songlist__songname > span > a').text();
        var song_url = $(ele).find('div > div.songlist__songname > span > a').attr('href');
        var id = await window.getSongId(song_url);
        if (!name.includes('(Live)')) {
          tmpSongs.push({name, song_url, id});
        }
      });
      return tmpSongs;
    });
    return currentPageSongsInfo;
  };
  
  page.on('console', msg => {
    console.log(msg.text());
  });
  
  await page.exposeFunction('getSongId', songUrl => {
    var p = /y.qq.com\/n\/yqq\/song\/(\w+)\.html/;
    return p.exec(songUrl) && p.exec(songUrl)[1];
  });
  
  
  // 设置视窗大小
  await page.setViewport({width: 1500, height: 0});
  
  // 进入首页
  await page.goto('https://y.qq.com/');
  
  // 找到搜索框, 按回车搜索
  await page.waitForSelector('.search_input__input');
  await page.type('.search_input__input', singer);
  await page.waitFor(1000);
  await page.keyboard.press('Enter');
  
  // 点击歌手头像, 进入歌手详情页
  await page.waitForSelector('#zhida_singer > a');
  await page.click('#zhida_singer > a');
  
  // 点击全部按钮
  await page.waitForSelector('#index_tab > div:nth-child(1) > div.part__hd > a');
  await page.click('#index_tab > div:nth-child(1) > div.part__hd > a');
  
  // 获取第一页的歌曲信息
  await page.waitFor(1000);
  var page1SongsInfo = await getCurrentPageSongsInfo();
  
  // 获取第二页的歌曲信息
  await page.click('#song_tab > div.mod_page_nav.js_pager > a:nth-child(2)');
  await page.waitFor(1000);
  var page2SongsInfo = await getCurrentPageSongsInfo();
  
  
  // 获取第三页的歌曲信息
  await page.click('#song_tab > div.mod_page_nav.js_pager > a:nth-child(4)');
  await page.waitFor(1000);
  var page3SongsInfo = await getCurrentPageSongsInfo();
  
  // 合并前三页的歌曲信息
  songsInfo = page1SongsInfo.concat(page2SongsInfo).concat(page3SongsInfo);
  
  // 获取歌曲的下载链接
  for (let song of songsInfo) {
    song.download_url = await getDownloadUrl(song.id);
  }
  
  
  console.log(songsInfo);
  
  
  browser.close();
  
  
};


main('汪峰');