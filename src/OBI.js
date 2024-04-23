const puppeteer = require('puppeteer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";
const { saveToMongoDB, CheckMongoDB, sleep, SaveName } = require('./mongoDB.js');


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function TestWebScraping() {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
  await page.goto('https://www.obi.pl/maszyny-ogrodnicze/glebogryzarki/c/1402');
  const shop = await findShopByName("OBI");
  const shopId = shop._id.toString();

  const Item = await page.evaluate(function () {
    const ItemEvent = document.querySelectorAll('.product.large');
    const ItemList = [];

    ItemEvent.forEach(Item => {

      const TitleName = Item.querySelector('a.product-wrapper.wt_ignore');
      const title = TitleName ? TitleName.href : '-';

      const PriceName = Item.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';

      const DesName = Item.querySelector('.description');
      const description = DesName ? DesName.innerText.trim() : '-';


      ItemList.push({ title, price, description });
    });

    return ItemList;
  });

  const Product = await page.evaluate(function () {
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(Product => {

      const TitleName = Product.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      ProductList.push({ name });
    });
    return ProductList;
  });

  const createdAt = new Date(); 
  const ShopProduct = await page.evaluate(function (shopId, createdAt) { //for Each product -> pętla czy istnieje jesśli nie to...
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(ShopProduct => {

      const SourceIDNAME = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';

      const LinkName = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const link = LinkName ? LinkName.href : '-';

      const TitleName = ShopProduct.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

     
      console.log(createdAt)

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

        ProductList.push({ link, SourceID, shopId, name, createdAt });
      }
    });
    return ProductList;
  }, shopId, createdAt);

  const ProductPrice = await page.evaluate(function ( createdAt) { 
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(ProductPrice => {

      const PriceName = ProductPrice.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';
      
      ProductList.push({ price, createdAt });
      
    });
    return ProductList;
  }, createdAt);

  const Shop = await page.evaluate(() => {
    const Shop = [];
    const name = 'OBI';
    Shop.push({ name });
    return Shop;
  });


  await CheckMongoDB(ShopProduct, 'ShopProduct');
  console.log(ShopProduct);
  await sleep(7000);
  await saveToMongoDB(ProductPrice, 'ProductPrice');
  //await saveToMongoDB(Item, 'OBI-Glebogryzarki');
  //console.log(Item);
  await sleep(10000);
  await SaveName(Product, 'Products');
  console.log(Product);
  await sleep(10000);
  await SaveName(Shop, 'Shops');
  console.log(Shop); 

  await browser.close();
};

async function findShopByName(shopName) {
  const database = client.db('mydatabase');
  const shopsCollection = database.collection("Shops");
  const shop = await shopsCollection.findOne({ name: shopName });
  if (!shop) {
    throw new Error("Shop not found.");
  }
  return shop;
}
/*
async function MoveProductId(){
  const database = client.db('mydatabase');
  const productsCollection = database.collection("Products");
  const ShopProductCollection = database.collection("ShopProduct");
  const ShopProducts = await ShopProductCollection.find().toArray();

  for(const ShopProduct of ShopProducts){
    const ShopProductId = ShopProduct.link;
    const products = await productsCollection.find().toArray();

    for(const product of products){
      if (ShopProductId.toLowerCase().includes(product.name.toLowerCase())){
        await ShopProductId.updateOne(
          { _id: ShopProduct._id},
          {$set: {productId:product._id}}
        );
        console.log(productId);
        break;
      }
    }
  }
}
*/
module.exports = { TestWebScraping, findShopByName }