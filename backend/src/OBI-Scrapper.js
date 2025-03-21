const puppeteer = require('puppeteer');
const fs = require('fs');
const { saveToMongoDB, CheckMongoDB, sleep, SaveName, saveToCollection, savePrice, upsertShopProduct, SaveProduct, findShopByName, randomDelay, saveDetail, CheckDetails, retry } = require('./mongoDB.js');
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

async function ScrapeObi(link, categoryId) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
});

await loadCookies(page);

  page.setExtraHTTPHeaders({
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0'
  })

  console.log(link)
  await retry( async () => await page.goto(link, {waitUntil: 'domcontentloaded', timeout: 60000}), 12);

  const shop = await findShopByName("OBI");
  const shopId = shop._id.toString();
  let hasNextPage = true;
  let productInfo = [];

  const createdAt = new Date();

  while (hasNextPage) {
    console.log(`Scraping page...`);

    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    const { ProductList, ProductNameList } = await page.evaluate(function (shopId, createdAt, categoryId) {
      const ProductEvent = document.querySelectorAll('.product.large')
      const ProductList = [];
      const ProductNameList = [];

      ProductEvent.forEach(async (ShopProduct) => {

        const SourceIDNAME = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
        const href = SourceIDNAME ? SourceIDNAME.getAttribute('href') : '-';

        const LinkName = ShopProduct.querySelector('a.product-wrapper.wt_ignore');
        const link = LinkName ? LinkName.href : null;

        const TitleName = ShopProduct.querySelector('.description');
        const name = TitleName ? TitleName.innerText.trim() : '-';
       
        const DiscountedPriceName = ShopProduct.querySelector('.red.big-font.mb-10.tw-font-bold');
        let priceString = '-';

        if (DiscountedPriceName) {
          priceString = DiscountedPriceName ? DiscountedPriceName.innerText.trim() : '-';
        } else {
          const PriceName = ShopProduct.querySelector('.new-price');
          priceString = PriceName ? PriceName.innerText.trim() : '-';
        }

        ProductNameList.push({ name, categoryId });

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

         // removes suffix from prices like "80,00 zł / kg."
         const weightSuffix = " / kg.";
         const isWeightSuffix = priceString.endsWith(weightSuffix);
         if (isWeightSuffix) {
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
          const sourceId = part[part.length - 1];

          ProductList.push({ product: { link, sourceId, shopId, name, createdAt, categoryId }, price: { price: parsedPrice, createdAt } });

        }
      });
      return { ProductList, ProductNameList };
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
      const name = 'OBI';
      Shop.push({ name });
      return Shop;
    });

    await SaveProduct(ProductNameList, 'Products');
    console.log(ProductNameList);
    await sleep(8000);
    await SaveName(Shop, 'Shops');
    console.log(Shop); 

    await saveCookies(page);

    hasNextPage = await page.evaluate(() => {
      const nextPageButton = document.querySelector('button.pagination-bar__btn[data-ui-name="content.pagination.next-page.link"]:not(.disabled)');
      if (nextPageButton) {
        nextPageButton.click();
        return true;
      } 
      const nextPageLink = document.querySelector('a.pagination-bar__btn[data-ui-name="content.pagination.next-page.link"]:not(.disabled)');
      if (nextPageLink) {
        nextPageLink.click();
        return true;
      } 
      else {
        console.log ('No more pages :]')
        return false;
      }
    })

    if (hasNextPage) {
      console.log ('There is next page !!!')
      await randomDelay(7000, 8000);
    }
  }

  for (const productDesc of productInfo) {
    const productLink = productDesc.product.link;
    if (!productLink) {
      continue;
    }

    const sourceId = productDesc.product.sourceId;
    const shopId = productDesc.product.shopId;
    const detailsExists = await CheckDetails(shopId, sourceId);
    if (detailsExists) {
      console.log(`Details exists for ${sourceId}...`)
      continue;
    }
    await retry(() => page.goto(productLink),12);
    const description = await page.evaluate(() => {
      const descriptionA = document.querySelector('.overview__detail-list.normal.black')
      details = descriptionA ? descriptionA.innerText.trim().replace(/\n/g, ' ') : null;

      const ImageSRC = document.querySelector('.ads-slider__image.ads-slider__sm-image.jqzoom');
      const imageUrl = ImageSRC ? ImageSRC.src : null;

      return { details, imageUrl }
    });
    const shopProductDetails = { shopId, sourceId, description: description.details, imageUrl: description.imageUrl };
    await saveDetail([shopProductDetails], 'ShopProduct')
    console.log(shopProductDetails);
    await randomDelay(7000, 8000);

  }

  await browser.close();

  return productInfo.length;
};

module.exports = { ScrapeObi }