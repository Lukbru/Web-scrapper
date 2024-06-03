const puppeteer = require('puppeteer');
const cron = require('node-cron');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";
const {saveToMongoDB, CheckMongoDB, sleep} = require('./mongoDB.js');
const {TestWebScraping, findShopByName, OBiRozbierzaczeGalezi,OBiNozyceZywoplotu,OBItelefonyp1,OBItelefonyp2 } = require('./OBI.js');
const {TestWebScraping2,CastoramaRozbierzaczeGalezi} = require('./CASTORAMA.js');


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    //await createShopProducts();
    //await CastoramaRozbierzaczeGalezi();
    
    await TestWebScraping();
    await sleep(7000);
    await OBiRozbierzaczeGalezi();
    // await sleep(7000);
    // await OBiNozyceZywoplotu();
    // await sleep(7000);
    // await OBItelefonyp1();
    // await sleep(7000);
    // await OBItelefonyp2();

    // await sleep(7000);
    // await TestWebScraping2();
    // await sleep(7000);
    // await CastoramaRozbierzaczeGalezi();

    //await OBiRozbierzaczeGalezi();
    //await OBiNozyceZywoplotu();


  } finally {
    await client.close();
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

run().catch(console.dir);
cron.schedule('0 0 12 * * *',run);
