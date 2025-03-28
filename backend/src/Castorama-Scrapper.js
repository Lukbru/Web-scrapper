const puppeteer = require('puppeteer');
const fs = require('fs');
const { saveToMongoDB, CheckMongoDB, sleep, SaveName, saveToCollection ,savePrice, upsertShopProduct,SaveProduct,findShopByName,randomDelay, saveDetail, CheckDetails, retry } = require('./mongoDB.js');
const { setTimeout } = require('node:timers/promises')

async function saveCookies(page){
  const cookies = await page.cookies();
  fs.writeFileSync('cookies.json',JSON.stringify(cookies,null,2));
}

async function loadCookies(page) {
  if (fs.existsSync('cookies.json')){
    const cookies = JSON.parse(fs.readFileSync('cookies.json','utf8'));
    await page.setCookie(...cookies);
  }
}

async function ScrapeCastorama (link,categoryId) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });   //({ headless : false }) - pokazuje nam  ze otwiera przegladarke
    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  await loadCookies(page);

    page.setExtraHTTPHeaders({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0'
    })  

    const shop = await findShopByName("Castorama");
    const shopId = shop._id.toString();
    let hasNextPage = true;
    let currentPage = 1;
    let productInfo = [];
    let scrapperCount = 0;
    const createdAt = new Date();
    
  while (hasNextPage){
    const url = `${link}?page=${currentPage}`;
    console.log(`Scraping page ${url}...`);

    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    await retry(() => page.goto(url),17);

    const noResult = await page.evaluate(()=>{
      return document.querySelectorAll('._64ca4dc5._66091259').length < 1;
    });

    if (noResult) {
      hasNextPage = false;
    } else if (currentPage >= 120 ){
      hasNextPage = false;
    }

    const {ProductList, ProductNameList} = await page.evaluate(function (shopId, createdAt,categoryId) { //for Each product -> pętla czy istnieje jesśli nie to...
      const ProductEvent = document.querySelectorAll('.b9bdc658');
      const ProductList = [];
      const ProductNameList = [];
  
      ProductEvent.forEach(ShopProduct => {
  
        const SourceIDNAME = ShopProduct.querySelector('._64ca4dc5._66091259');
        const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';
  
        const LinkName = ShopProduct.querySelector('._64ca4dc5._66091259');
        const link = LinkName ? LinkName.href : null;
  
        const TitleName = ShopProduct.querySelector('.ccb9d67a');
        const name = TitleName ? TitleName.innerText.trim() : '-';

        const PriceName = ShopProduct.querySelector('._5d34bd7a ');
        const priceString = PriceName ? PriceName.innerText.trim() : '-';
        const price = parseFloat(priceString.replace(/\s/g, '').replace(',', '.'));
   
        ProductNameList.push({ name, categoryId });
        console.log(createdAt)
  
        if (href) {
          const part = href.split('/');
          let sourceId = part[part.length - 1];

          if (sourceId.endsWith('_CAPL.prd')) {
            sourceId = sourceId.replace('_CAPL.prd', '');
        }
  
        ProductList.push({product: { link, sourceId, shopId, name, createdAt, categoryId}, price: {price, createdAt}});
        }
      });
      return {ProductList,ProductNameList};
    }, shopId, createdAt, categoryId);

    productInfo.push(...ProductList);

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

    await saveCookies(page);

    await SaveProduct(ProductNameList, 'Products');
    console.log(ProductNameList);
    await SaveName(Shop, 'Shops');
    console.log(Shop); 

    for (const productDesc of ProductList){
      const productLink = productDesc.product.link;
      const sourceId = productDesc.product.sourceId;
      const shopId = productDesc.product.shopId;
      const detailsExists = await CheckDetails(shopId, sourceId);
      if (!detailsExists){
        if (!productLink){
          console.error("Link doesn't exist");
          console.error(productLink);
          continue;
        } else {
      console.log(`Scrapping ${productLink} for details...`)
      await page.goto(productLink);
      const description = await page.evaluate(() => {
        const descriptionA = document.querySelector('.ccb9d67a._17d3fa36._4fd271c8._49e8bd5b.cc6bbaee')
        details = descriptionA ? descriptionA.innerText.trim().replace(/\n/g, ' ') : null;

        const ImageSRC = document.querySelector('._2fc6e0e9.b4d87c1d._78f9416e._4076e307.ce5065a9');
        const imageUrl = ImageSRC ? ImageSRC.src : null;

        return { details, imageUrl }
      });
      const shopProductDetails = {shopId, sourceId, description: description.details, imageUrl: description.imageUrl };
      await saveDetail([shopProductDetails], 'ShopProduct')
      scrapperCount++;
      console.log(shopProductDetails);
      await randomDelay(7000, 8000);
 }} else {
  scrapperCount++;
  console.log(`Details exists for ${sourceId}...`)
 }
}

    currentPage++;
    
    await randomDelay(7000, 8000);
  }
    await browser.close();

    return scrapperCount;
  };

module.exports={ScrapeCastorama}