const puppeteer = require('puppeteer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";
const {saveToMongoDB, CheckMongoDB, sleep} = require('./mongoDB.js');
const {TestWebScraping, findShopByName} = require('./OBI.js');
const {TestWebScraping2} = require('./CASTORAMA.js');

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
    
    await TestWebScraping();
    //await sleep(7000);
    //await TestWebScraping2();
    //await sleep(7000)


  } finally {
    await client.close();
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createShopProducts(shopId) {
  const database = client.db('mydatabase'); 
    const shopsCollection = database.collection("Shops");
    const productsCollection = database.collection("Products");
    const shopsProductsCollection = database.collection("ShopsProducts");

    const shops = await shopsCollection.find().toArray();
    const products = await productsCollection.find().toArray();

    for (const shop of shops) {
        for (const product of products) {

            await shopsProductsCollection.updateOne(
                { shopId: shop._id, productId: product._id },
                { $set: {shopId: shop._id, productId: product._id,}
              },
                { upsert: true }
            );
        }
    }
}

run().catch(console.dir);
