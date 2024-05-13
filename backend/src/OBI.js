const puppeteer = require('puppeteer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";
const { saveToMongoDB, CheckMongoDB, sleep, SaveName, saveToCollection ,savePrice, upsertShopProduct,SaveProduct } = require('./mongoDB.js');


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

  const category = await findCategoryByName("Glebogryzarki");
  const categoryId = category._id.toString();


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

  const Product = await page.evaluate(function (categoryId) {
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(Product => {

      const TitleName = Product.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      ProductList.push({ name, categoryId });
    });
    return ProductList;
  },categoryId);

  const createdAt = new Date(); 
  const ShopProduct = await page.evaluate(function (shopId, createdAt) { //for Each product -> pętla czy istnieje jesśli nie to...
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(async (ShopProduct) => {

      const SourceIDNAME = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';

      const LinkName = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const link = LinkName ? LinkName.href : '-';

      const TitleName = ShopProduct.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      const PriceName = ShopProduct.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';
    
      console.log(createdAt)

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

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
    const name = 'OBI';
    Shop.push({ name });
    return Shop;
  });

  const Category = await page.evaluate(() => {
    const Category = [];
    const name = 'Glebogryzarki';
    Category.push({ name });
    return Category;
  });

  await SaveName(Category, 'Categories');
  console.log(Category); 
  await sleep(10000);
  await CheckMongoDB(ShopProduct, 'ShopProduct');
 console.log(ShopProduct);
 await sleep(7000);
 await saveToMongoDB(ProductPrice, 'ShopProductPrice');
 console.log(ProductPrice);
  await sleep(10000);
  await SaveProduct(Product, 'Products');
  console.log(Product);
  await sleep(10000);
  await SaveName(Shop, 'Shops');
  console.log(Shop); 

  await browser.close();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function OBiRozbierzaczeGalezi() {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
  await page.goto('https://www.obi.pl/maszyny-ogrodnicze/rozdrabniacze-do-galezi/c/386');
  const shop = await findShopByName("OBI");
  const shopId = shop._id.toString();

  const category = await findCategoryByName("Rozdrabniacze-do-galezi");
  const categoryId = category._id.toString();

  const Product = await page.evaluate(function (categoryId) {
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(Product => {

      const TitleName = Product.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      ProductList.push({ name, categoryId });
    });
    return ProductList;
  },categoryId);

  const createdAt = new Date(); 
  const ShopProduct = await page.evaluate(function (shopId, createdAt) { //for Each product -> pętla czy istnieje jesśli nie to...
    const ProductEvent = document.querySelectorAll('.product.large');
    const ProductList = [];

    ProductEvent.forEach(async (ShopProduct) => {

      const SourceIDNAME = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';

      const LinkName = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const link = LinkName ? LinkName.href : '-';

      const TitleName = ShopProduct.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      const PriceName = ShopProduct.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';

     
      console.log(createdAt)

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

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
    const name = 'OBI';
    Shop.push({ name });
    return Shop;
  });

  const Category = await page.evaluate(() => {
    const Category = [];
    const name = 'Rozdrabniacze-do-galezi';
    Category.push({ name });
    return Category;
  });
  

  await SaveName(Category, 'Categories');
  console.log(Category); 
  await sleep(10000);
  console.log(ShopProduct);
  await sleep(7000);
  await SaveProduct(Product, 'Products');
  console.log(Product);
  await sleep(10000);
  await SaveName(Shop, 'Shops');
  console.log(Shop); 

  await browser.close();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function OBiNozyceZywoplotu() {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
  await page.goto('https://www.obi.pl/maszyny-ogrodnicze/nozyce-do-zywoplotu/c/405');
  const shop = await findShopByName("OBI");
  const shopId = shop._id.toString();

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

    ProductEvent.forEach(async (ShopProduct) => {

      const SourceIDNAME = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';

      const LinkName = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const link = LinkName ? LinkName.href : '-';

      const TitleName = ShopProduct.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      const PriceName = ShopProduct.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';

     
      console.log(createdAt)

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

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
    const name = 'OBI';
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

////////////////////////////////////////////////////////////////////////////////////////////////

async function OBItelefonyp1() {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
  await page.goto('https://www.obi.pl/elektronika-i-zabezpieczenie-domu/telefony/c/985');
  const shop = await findShopByName("OBI");
  const shopId = shop._id.toString();

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

    ProductEvent.forEach(async (ShopProduct) => {

      const SourceIDNAME = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';

      const LinkName = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const link = LinkName ? LinkName.href : '-';

      const TitleName = ShopProduct.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      const PriceName = ShopProduct.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';

     
      console.log(createdAt)

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

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
    const name = 'OBI';
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

////////////////////////////////////////////////////////////////////////////////////////////////


async function OBItelefonyp2() {
  const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
  const page = await browser.newPage();
  await page.goto('https://www.obi.pl/elektronika-i-zabezpieczenie-domu/telefony/c/985?page=2');
  const shop = await findShopByName("OBI");
  const shopId = shop._id.toString();

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

    ProductEvent.forEach(async (ShopProduct) => {

      const SourceIDNAME = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';

      const LinkName = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
      const link = LinkName ? LinkName.href : '-';

      const TitleName = ShopProduct.querySelector('.description');
      const name = TitleName ? TitleName.innerText.trim() : '-';

      const PriceName = ShopProduct.querySelector('.price');
      const price = PriceName ? PriceName.innerText.trim() : '-';

     
      console.log(createdAt)

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

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
    const name = 'OBI';
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

async function findCategoryByName(categoryName) {
  const database = client.db('mydatabase');
  const categoryCollection = database.collection("Categories");
  const category = await categoryCollection.findOne({ name: categoryName });
  if (!category) {
    throw new Error("Category not found.");
  }
  return category;
}

module.exports = { TestWebScraping, findShopByName,OBiRozbierzaczeGalezi,OBiNozyceZywoplotu,OBItelefonyp1,OBItelefonyp2,findCategoryByName } 
