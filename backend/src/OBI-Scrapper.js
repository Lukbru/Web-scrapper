const puppeteer = require('puppeteer');
const { saveToMongoDB, CheckMongoDB, sleep, SaveName, saveToCollection ,savePrice, upsertShopProduct,SaveProduct,findShopByName } = require('./mongoDB.js');

async function ScrapeObi(link,categoryId) {
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage();

  await page.goto(link);
  const shop = await findShopByName("OBI");
  const shopId = shop._id.toString();

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
      let priceString = PriceName ? PriceName.innerText.trim() : '-';

       // take second value from prices like "629,00 zł\n499,00 zł"
       const combinedPriceStringElements = priceString.split('\n');
       const isCombinedPrice = combinedPriceStringElements.length === 2;
       if (isCombinedPrice) {
           priceString = combinedPriceStringElements[1];
       }

       // removes suffix from prices like "80,00 zł / szt."
       const piecesSuffix = " / szt.";
       const isPiecesString = priceString.endsWith(piecesSuffix);
       if (isPiecesString) {
           priceString = priceString.substr(0, priceString.length - piecesSuffix.length);
       }

       // remove suffix from prices like "80,00 zł"
       const currencySuffix = " zł";
       priceString = priceString.slice(0, priceString.length - currencySuffix.length);

       // change comma to dot in price like "249,00 zł"
       priceString = priceString.replace(',', '.');

       // remove spaces from price like "1 249,00"
       priceString = priceString.replaceAll(' ', '');

       const parsedPrice = parseFloat(priceString);

      if (href) {
        const part = href.split('/');
        const SourceID = part[part.length - 1];

        ProductList.push({product: { link, SourceID, shopId, name, createdAt }, price: {price: parsedPrice, createdAt}});

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