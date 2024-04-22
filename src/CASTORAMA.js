const puppeteer = require('puppeteer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";
const {saveToMongoDB, CheckMongoDB, sleep, SaveName} = require('./mongoDB.js');


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function TestWebScraping2 () {
    const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
    const page = await browser.newPage();
     await page.goto('https://www.castorama.pl/search?term=glebogryzarki');
  
    const Item = await page.evaluate( function(){
      const ItemEvent = document.querySelectorAll('.b9bdc658');
      const ItemList = [];
  
      ItemEvent.forEach(Item => {
  
        const TitleName = Item.querySelector('._64ca4dc5._66091259');
        const title = TitleName ? TitleName.href : '-'; 
  
        const PriceName = Item.querySelector('._5d34bd7a');
        const price = PriceName ? PriceName.innerText.trim() : '-';
  
        const DesName = Item.querySelector('.ccb9d67a');
        const description = DesName ? DesName.innerText.trim() : '-';
  
  
        ItemList.push({ title, price, description});
      });
  
      return ItemList;
    });
  
    const Shop = await page.evaluate(() => {
      const Shop = [];
      const title = 'Castorama'; 
      Shop.push({ title });
      return Shop;
    });
  
    await saveToMongoDB(Item, 'Castorama-Glebogryzarki');
    console.log(Item);
    await sleep(4000);
    await CheckMongoDB(Shop, 'Shops');
    console.log(Shop);
  
     await browser.close();
  };
module.exports={TestWebScraping2}