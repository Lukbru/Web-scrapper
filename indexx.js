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

    await createShopProducts();
/*
    await TestWebScraping();
    await sleep(7000);
    await TestWebScraping2();
    await sleep(7000)
*/

  } finally {
    await client.close();
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function TestWebScraping () {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
   await page.goto('https://www.obi.pl/maszyny-ogrodnicze/glebogryzarki/c/1402');

  const Item = await page.evaluate( function(){
    const ItemEvent = document.querySelectorAll('.product.large');
    const ItemList = [];

    ItemEvent.forEach(Item => {

      const TitleName = Item.querySelector('a.product-wrapper.wt_ignore');
      const title = TitleName ? TitleName.href : '-'; 

      const PriceName = Item.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';

      const DesName = Item.querySelector('.description');
      const description = DesName ? DesName.innerText.trim() : '-';


      ItemList.push({ title, price, description});
    });

    return ItemList;
  });

  const Product = await page.evaluate( function(){
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(Product => {

      //const TitleName = Product.querySelector('a.product-wrapper.wt_ignore');
      //const title = TitleName ? TitleName.href : '-'; 

      const TitleName = Product.querySelector('.description');
      const title = TitleName ? TitleName.innerText.trim() : '-';

      ProductList.push({ /*title,*/ title});
    });
    return ProductList;
  });

  const Shop = await page.evaluate(() => {
    const Shop = [];
    const title = 'OBI'; 
    Shop.push({ title });
    return Shop;
  });

   await saveToMongoDB(Item, 'OBI-Glebogryzarki');
   console.log(Item);
   await sleep(10000);
   await CheckMongoDB(Product, 'Products');
   console.log(Product);
   await sleep(10000);
   await CheckMongoDB(Shop, 'Shops');
   console.log(Shop);


   await browser.close();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createShopProducts() {
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
                { $set: {
                  shopId: shop._id, 
                  productId: product._id, 
                }
              },
                { upsert: true }
            );
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function saveToMongoDB(data, collectionName) {
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);

  await collection.insertMany(data);
  console.log('Data saved to MongoDB');
}

async function CheckMongoDB(data, collectionName) {
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);
  const options = { upsert: true };

  for (const item of data) {
    try {
      const log = {
        $or: [
        {title: item.title}
        ]
      };
    const update = {
      $set :{
        title: item.title
      }
    };

  const collectionA = await collection.updateOne(log, update, options);
  if (collectionA.upsertedCount > 0 ) {
  console.log('Data updated to MongoDB');
  } else {
    console.log('Data already exist in MongoDB');
  }
    }
    catch(error){
      console.error('Error - please try again later ?');
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms)); // Czeka dany czas
}

run().catch(console.dir);
