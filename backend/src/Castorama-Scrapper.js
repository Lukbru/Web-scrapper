const puppeteer = require('puppeteer');
const { saveToMongoDB, CheckMongoDB, sleep, SaveName, saveToCollection ,savePrice, upsertShopProduct,SaveProduct,findShopByName,randomDelay } = require('./mongoDB.js');

async function ScrapeCastorama (link,categoryId) {
    const browser = await puppeteer.launch();   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
    const page = await browser.newPage();

    page.setExtraHTTPHeaders({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0'
    })  

     await page.goto(link);
     const shop = await findShopByName("Castorama");
    const shopId = shop._id.toString();
  
    const createdAt = new Date(); 
    const {ProductList, ProductNameList} = await page.evaluate(function (shopId, createdAt,categoryId) { //for Each product -> pętla czy istnieje jesśli nie to...
      const ProductEvent = document.querySelectorAll('.b9bdc658');
      const ProductList = [];
      const ProductNameList = [];
  
      ProductEvent.forEach(ShopProduct => {

        const ProductTytle = ShopProduct.querySelector('.ccb9d67a');
        const productName = ProductTytle ? ProductTytle.innerText.trim() : '-';
        ProductNameList.push({ productName, categoryId });
  
        const SourceIDNAME = ShopProduct.querySelector('._64ca4dc5._66091259');
        const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';
  
        const LinkName = ShopProduct.querySelector('._64ca4dc5._66091259');
        const link = LinkName ? LinkName.href : '-';
  
        const TitleName = ShopProduct.querySelector('.ccb9d67a');
        const name = TitleName ? TitleName.innerText.trim() : '-';

        const PriceName = ShopProduct.querySelector('._5d34bd7a ');
        const priceString = PriceName ? PriceName.innerText.trim() : '-';
        const price = parseFloat(priceString.replace(/\s/g, '').replace(',', '.'));
   
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
      return {ProductList,ProductNameList};
    }, shopId, createdAt, categoryId);

    await Promise.all(ProductList.map( async(data) => {
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

    await CheckMongoDB(ProductList, 'ShopProduct');
   console.log(ProductList);
    await SaveProduct(ProductNameList, 'Products');
    console.log(ProductNameList);
    await sleep(randomDelay(2000,22000));
    await SaveName(Shop, 'Shops');
    console.log(Shop); 
  
    await browser.close();
  };

module.exports={ScrapeCastorama}