const puppeteer = require('puppeteer');

async function TestWebScraping () {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
  await page.goto('https://www.chess.com/news');

  const info = await page.evaluate( function(){
    const events = document.querySelectorAll('.post-preview-component');
    const tab = [];

    for(i=0; i<events.length;i++){
      tab.push({
        title: events[i].querySelector('.post-preview-titlecontainer').innerText,
        description: events[i].querySelector('.post-preview-excerpt').innerText,
        date: events[i].querySelector('.post-preview-meta').innerText,
      })
    }
    return tab;
  })
  console.log(info);
  await browser.close();
};
async function TestWebScraping2 () {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
  await page.goto('https://www.chess.com/ratings');

  const info = await page.evaluate( function(){
    const ranks = document.querySelectorAll('.master-players-rating-rank');
    const usernames = document.querySelectorAll('.master-players-rating-username');
    const tab1 = [];

    for(i=0; i<ranks.length;i++){
      tab1.push({
        Ranks: ranks[i].innerText,
        Name: usernames[i].innerText,
      })
    }
    return tab1;
  })
  console.log(info);
  await browser.close();
};

TestWebScraping();
TestWebScraping2();
