const puppeteer = require('puppeteer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";
const {saveToMongoDB, CheckMongoDB, sleep, SaveName,savePrice, upsertShopProduct} = require('./mongoDB.js');


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
     const shop = await findShopByName("Castorama");
    const shopId = shop._id.toString();
  
    const Product = await page.evaluate(function () {
      const ProductEvent = document.querySelectorAll('.b9bdc658');
      const ProductList = [];
  
      ProductEvent.forEach(Product => {
  
        const TitleName = Product.querySelector('.ccb9d67a');
        const name = TitleName ? TitleName.innerText.trim() : '-';
  
        ProductList.push({ name });
      });
      return ProductList;
    });
  
    const createdAt = new Date(); 
    const ShopProduct = await page.evaluate(function (shopId, createdAt) { //for Each product -> pętla czy istnieje jesśli nie to...
      const ProductEvent = document.querySelectorAll('.b9bdc658');
      const ProductList = [];
  
      ProductEvent.forEach(ShopProduct => {
  
        const SourceIDNAME = ShopProduct.querySelector('._64ca4dc5._66091259');
        const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';
  
        const LinkName = ShopProduct.querySelector('._64ca4dc5._66091259');
        const link = LinkName ? LinkName.href : '-';
  
        const TitleName = ShopProduct.querySelector('.ccb9d67a');
        const name = TitleName ? TitleName.innerText.trim() : '-';

        const PriceName = ShopProduct.querySelector('._36cb0914 ');
        const price = PriceName ? PriceName.innerText.trim() : '-';
   
        console.log(createdAt)
  
        if (href) {
          const part = href.split('/');
          let SourceID = part[part.length - 1];

          if (SourceID.endsWith('_CAPL.prd')) {
            SourceID = SourceID.replace('_CAPL.prd', '');
        }
  
        ProductList.push({product: { link, SourceID, shopId, name, createdAt }, price: {price, createdAt}});
        }
      });
      return ProductList;
    }, shopId, createdAt);

    await Promise.all(ShopProduct.map( async(data) => {
      const shopProductId = await upsertShopProduct(data.product);
      await savePrice({
        price: data.price.price,
        shopProductId: shopProductId,
        createdAt: data.price.createdAt
      });
    }))
  
    const Shop = await page.evaluate(() => {
      const Shop = [];
      const name = 'Castorama';
      Shop.push({ name });
      return Shop;
    });
  
    console.log(ShopProduct);
    await sleep(7000);
    await SaveName(Product, 'Products');
    console.log(Product);
    await sleep(10000);
    await SaveName(Shop, 'Shops');
    console.log(Shop); 
  
    await browser.close();
  };
//////////////////////////////////////////////////////////////////////////////////
  async function CastoramaRozbierzaczeGalezi() {
    const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
    const page = await browser.newPage();
    await page.goto('https://www.castorama.pl/ogrod-i-otoczenie/maszyny-ogrodnicze/nozyce-do-zywoplotu.cat');
    const shop = await findShopByName("Castorama");
    const shopId = shop._id.toString();
  
    const Product = await page.evaluate(function () {
      const ProductEvent = document.querySelectorAll('.b9bdc658');
      const ProductList = [];
  
      ProductEvent.forEach(Product => {
  
        const TitleName = Product.querySelector('.ccb9d67a');
        const name = TitleName ? TitleName.innerText.trim() : '-';
  
        ProductList.push({ name });
      });
      return ProductList;
    });
  
    const createdAt = new Date(); 
    const ShopProduct = await page.evaluate(function (shopId, createdAt) { //for Each product -> pętla czy istnieje jesśli nie to...
      const ProductEvent = document.querySelectorAll('.b9bdc658');
      const ProductList = [];
  
      ProductEvent.forEach(ShopProduct => {
  
        const SourceIDNAME = ShopProduct.querySelector('._64ca4dc5._66091259');
        const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';
  
        const LinkName = ShopProduct.querySelector('._64ca4dc5._66091259');
        const link = LinkName ? LinkName.href : '-';
  
        const TitleName = ShopProduct.querySelector('.ccb9d67a');
        const name = TitleName ? TitleName.innerText.trim() : '-';

        const PriceName = ShopProduct.querySelector('._36cb0914 ');
        const price = PriceName ? PriceName.innerText.trim() : '-';
   
        console.log(createdAt)
  
        if (href) {
          const part = href.split('/');
          let SourceID = part[part.length - 1];

          if (SourceID.endsWith('_CAPL.prd')) {
            SourceID = SourceID.replace('_CAPL.prd', '');
        }
  
        ProductList.push({product: { link, SourceID, shopId, name, createdAt }, price: {price, createdAt}});
        }
      });
      return ProductList;
    }, shopId, createdAt);

    await Promise.all(ShopProduct.map( async(data) => {
      const shopProductId = await upsertShopProduct(data.product);
      await savePrice({
        price: data.price.price,
        shopProductId: shopProductId,
        createdAt: data.price.createdAt
      });
    }))
  
    const Shop = await page.evaluate(() => {
      const Shop = [];
      const name = 'Castorama';
      Shop.push({ name });
      return Shop;
    });
  
    console.log(ShopProduct);
    await sleep(7000);
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

module.exports={TestWebScraping2,CastoramaRozbierzaczeGalezi}