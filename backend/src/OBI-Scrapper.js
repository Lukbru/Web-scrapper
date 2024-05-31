const puppeteer = require('puppeteer');
const { saveToMongoDB, CheckMongoDB, sleep, SaveName, saveToCollection ,savePrice, upsertShopProduct,SaveProduct,findShopByName } = require('./mongoDB.js');

async function ScrapeObi(link,categoryId) {
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage();

  await page.goto(link);
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
  const ShopProduct = await page.evaluate(function (shopId, createdAt) { 
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
      const priceString = PriceName ? PriceName.innerText.trim() : '-';

      const priceArray = priceString.match(/(\d+,\d+)\s*zł/g);

      let discountedPrice = null;

      if (priceArray.length > 1){
        discountedPrice = parseFloat(priceArray[1].replace(/[^\d,]/g, '').replace(',','.'));
      } else {
        discountedPrice = parseFloat(priceArray[0].replace(/[^\d,]/g, '').replace(',','.'));
      }

      console.log(createdAt)

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

        ProductList.push({product: { link, SourceID, shopId, name, createdAt }, price: {price: discountedPrice, createdAt}});

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

  await CheckMongoDB(ShopProduct, 'ShopProduct');
 console.log(ShopProduct);
 await sleep(7000);
  await SaveProduct(Product, 'Products');
  console.log(Product);
  await sleep(10000);
  await SaveName(Shop, 'Shops');
  console.log(Shop); 

  await browser.close();
};

module.exports = {ScrapeObi}