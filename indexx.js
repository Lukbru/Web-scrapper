const puppeteer = require('puppeteer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();   
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");

    await TestWebScraping();
    await sleep(7000);
    await TestWebScraping2();
    await sleep(7000);
    await TestWebScraping3();
    await sleep(7000);
    //await TestWebScraping4(); // Zablokowali mnie :/
    //await sleep(7000); 
    await MeterialyBud();
    await sleep(7000);

  } finally {
    await client.close();
  }
}

async function TestWebScraping () {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
   await page.goto('https://www.amazon.com/s?k=tables&crid=2CO8WEICUJ17K&sprefix=table%2Caps%2C251&ref=nb_sb_noss_1');

  const Item = await page.evaluate( function(){
    const ItemEvent = document.querySelectorAll('.s-result-item');
    const ItemList = [];

    ItemEvent.forEach(Item => {

      const TitleName = Item.querySelector('h2 a');
      const title = TitleName ? TitleName.innerText.trim() : 'No Product';

      const PriceName = Item.querySelector('.a-price .a-offscreen');
      const price = PriceName ? PriceName.innerText.trim() : '-';

      ItemList.push({ title, price});
    });

    return ItemList;
   });
   await saveToMongoDB(Item, 'AmazonItemTable');
   console.log(Item);
   await browser.close();
};

async function TestWebScraping2 () {
  const browser = await puppeteer.launch();   
  const page = await browser.newPage();
   await page.goto('https://www.amazon.com/s?k=anvils&crid=ULV30MK29AU1&sprefix=anvil%2Caps%2C189&ref=nb_sb_noss_1');

  const Item = await page.evaluate( function(){
    const ItemEvent = document.querySelectorAll('.s-result-item');
    const ItemList = [];

    ItemEvent.forEach(Item => {

      const TitleName = Item.querySelector('h2 a');
      const title = TitleName ? TitleName.innerText.trim() : 'No Product';

      const PriceName = Item.querySelector('.a-price .a-offscreen');
      const price = PriceName ? PriceName.innerText.trim() : '-';

      ItemList.push({ title, price});
    });

    return ItemList;
   });
   await saveToMongoDB(Item, 'AmazonItemAnvils');
   console.log(Item);
   await browser.close();
};

async function TestWebScraping3 () {
  const browser = await puppeteer.launch();   
  const page = await browser.newPage();
   await page.goto('https://www.ebay.pl/deals');

  const Item = await page.evaluate( function(){
    const ItemEvent = document.querySelectorAll('.dne-itemtile');
    const ItemList = [];

    ItemEvent.forEach(Item => {

      const TitleName = Item.querySelector('.dne-itemtile-title');
      const title = TitleName ? TitleName.innerText.trim() : 'No Product';

      const PriceName = Item.querySelector('.dne-itemtile-price');
      const price = PriceName ? PriceName.innerText.trim() : '-';

      ItemList.push({ title, price });
    });

    return ItemList;
   });
   await saveToMongoDB(Item, 'EBayDEALS');
   console.log(Item);
   await browser.close();
};

async function TestWebScraping4 () {
  const browser = await puppeteer.launch();   
  const page = await browser.newPage();
      
   let status;
   do {
    const httpResponse = await page.goto('https://allegro.pl/strefaokazji');
      status = httpResponse.status();
      console.log("403 - blok. Waiting to get unblocked.")
      await sleep(60000);
   } while(status === 403) // Allegro blokuje ,więc trzeba odczekać

  const Item = await page.evaluate( function(){
    const ItemEvent = document.querySelectorAll('.mp4t_0');
    console.log("PAGE", ItemEvent)
    const ItemList = [];

    ItemEvent.forEach(Item => {

      const TitleName = Item.querySelector('.lsaqd');
      const title = TitleName ? TitleName.innerText.trim() : 'No Product';

      const PriceName = Item.querySelector('.mli8_k4');
      const price = PriceName ? PriceName.innerText.trim() : '-';

      ItemList.push({ title, price });
    });

    return ItemList;
   });
   console.log("BEFORE SAVE")
   console.log(Item);
   await saveToMongoDB(Item, 'AllegroDeal');
   await browser.close();
};

async function MeterialyBud () {
  const browser = await puppeteer.launch();   
  const page = await browser.newPage();
  await page.goto('https://www.wnp.pl/budownictwo/notowania/materialy-budowlane/');

  await page.waitForSelector('.table-3');

  const Item = await page.evaluate( function(){
    const ItemEvent = Array.from(document.querySelectorAll('.table-3 tr')).slice(1);
    const ItemList = [];

    ItemEvent.forEach(Item => {

      const TabelaWiersz = Array.from(Item.querySelectorAll('td'));
      const Tabela = TabelaWiersz.map(TabelaWiersz => TabelaWiersz.innerText.trim());

      ItemList.push({ Tabela });
    });

    return ItemList;
   });
   await saveToMongoDB(Item, 'MeterialyBud');
   console.log(Item);
   await browser.close();
};

async function saveToMongoDB(data, collectionName) {
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);

  await collection.insertMany(data);
  console.log('Data saved to MongoDB');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms)); // Czeka dany czas
}

run().catch(console.dir);