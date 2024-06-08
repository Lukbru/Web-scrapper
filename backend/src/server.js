const cors = require('cors');
const classValidator = require('class-validator');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";

const express = require('express');
const bodyParser = require('body-parser');

const {ScrapeObi} = require('./OBI-Scrapper.js')
const {ScrapeCastorama} = require('./Castorama-Scrapper.js')

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());


client.connect().then(() => {
  const db = client.db('mydatabase');
  const product_collection = db.collection('Products');
  const category_collection = db.collection('Categories');
  const shops_collection = db.collection('Shops');
  const shopProduct_collection = db.collection('ShopProduct');
  const productPrice_collection = db.collection('ShopProductPrice');
  const scrapper_collection = db.collection('Scrapper');

  app.get('/shops', async (req, res) => {
    const shops = await shops_collection.find().toArray();
    res.json(shops.map(shop => ({ 
      id: shop._id.toString(),
      name: shop.name
    })));
  });

  app.get('/products', async (req, res) => {
    const products = await product_collection.find().toArray();
    res.json(products);
  });


  app.get('/shopproduct', async (req, res) => {
    const shopProduct = await shopProduct_collection.find().toArray();
    res.json(shopProduct);
  });


  app.put('/connect', async (req, res) => {
    const { shopProductId, productId } = req.body;

    if (!shopProductId || !productId) {
      return res.status(400).json({ error: 'shopProductId and productId must exist' });
    }

    if (!ObjectId.isValid(shopProductId)){
      return res.status(400).json({ error: 'such shopProductId Id doesnt exist in database' });
    }

    const shopProduct = await shopProduct_collection.findOne({ _id: new ObjectId(shopProductId) });
    if (!shopProduct) {
      return res.status(400).json({ error: 'shopProduct Id doesnt exist ' })
    }

    const product = await product_collection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(400).json({ error: 'Product Id doesnt exist ' })
    }

    const up_result = await shopProduct_collection.updateOne(
      { _id: new ObjectId(shopProductId) },
      { $set: { productId: new ObjectId(productId) } }
    );

    if (up_result.matchedCount === 0) {
      return res.status(400).json({ error: 'Failed to connect ' })
    }
    res.json({
      message: 'Connected collections together',
      shopProductId: shopProductId,
      productId: productId
    });
  });

  app.get('/category', async (req, res) => {  
    const categories = await category_collection.find({}, { sort: {level: 1} }).toArray();
    res.json(categories);
  });

  app.post('/category', async (req, res) => {  
    const {name, level, parentCategoryId} = req.body;
    if (!name || typeof level !== 'number'){
      return res.status(400).json({ message: 'Wrong inputs - please try again.'})
    }
  
    const newCategory = {name, level, parentCategoryId: level<2?null:parentCategoryId};
    const categbox = await category_collection.insertOne(newCategory);
    res.status(200).json({
      id: categbox.insertedId
    });
  });

   app.get('/products/:productId', async (req, res)=> {
    const {productId} = req.params;
    const product = await product_collection.findOne({ _id: new ObjectId(productId) });
    if (!product){
      return res.status(400).json({ error: 'Failed to find product ' })
    }

    const shopProducts = await shopProduct_collection.find({productId: product._id}).toArray();
    if (!shopProducts){
      return res.status(400).json({ error: 'Failed to load shop products' })
    }

    const shopsProductPricesData = await Promise.all(
      shopProducts.map(async shopProduct => 
        {
          const pricesData = await productPrice_collection.find({shopProductId: shopProduct._id.toString()}, { sort: { createdAt: 1 }, projection: { price: 1, createdAt: 1}}).toArray()
          return {
            shopProductId: shopProduct._id.toString(),
            pricesData: pricesData.map(data => ({ price: data.price, createdAt: data.createdAt}))
          }
        }
      )
    );

    const groupedShopsProductPrices = shopsProductPricesData.reduce((acc, element) => {
      acc[element.shopProductId] = element.pricesData;
      return acc;
    }, {});

    res.json({
      name: product.name,
      shopProducts: shopProducts.map(shopProduct => ({
        id: shopProduct._id.toString(),
        shopId: shopProduct.shopId,
        name: shopProduct.name,
        link: shopProduct.link,
        prices: groupedShopsProductPrices[shopProduct._id.toString()] 
      }))
    });
   });
   
   app.put('/productsCategory', async (req, res) => {

    const {productId, categoryId} = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is missing' }); 
    }

    if (!productId) {
      return res.status(400).json({ error: 'productId is missing' }); 
    }

    if (!classValidator.isMongoId(categoryId)) {
      return res.status(400).json({ error: 'categoryId must be mongo id' }); 
    }
    
    if (!classValidator.isMongoId(productId)) {
      return res.status(400).json({ error: 'productId must be mongo id' }); 
    }

    const category = await category_collection.findOne({ _id: new ObjectId(categoryId) });
    if (!category) {
      return res.status(400).json({ error: 'category Id doesnt exist ' })
    }

    const product = await product_collection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return res.status(400).json({ error: 'Product Id doesnt exist ' })
    }

    const up_result = await product_collection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { categoryId } }
    );

    if (up_result.matchedCount === 0) {
      return res.status(400).json({ error: 'Failed to connect ' })
    }
    res.json({
      categoryId: categoryId,
      productId: productId

  });
});

app.post('/Scrapper', async (req, res) => {
  const {link, categoryId, shopId} = req.body;
  if (!link){ 
    return res.status(400).json({error: 'Link is missing'})
  }
  if (!classValidator.isURL(link)){
    return res.status(400).json({error: 'Link must be url'})
  }
  if (!categoryId){
    return res.status(400).json({error: 'Category is missing'})
  }
  if (!shopId){
    return res.status(400).json({error: 'Shop is missing'})
  }

  const newScrapper={link,categoryId,shopId};
  const scrapbox = await scrapper_collection.insertOne(newScrapper);
  res.status(200).json({ id: scrapbox.insertedId });
});
 
app.get('/Scrapper', async (req, res) => {
  const scrappers = await scrapper_collection.find().toArray();
  res.json(scrappers);
});

app.post('/Scrapper/Run', async (req, res) => {
  const scrappers = await scrapper_collection.find().toArray(); //TODO Filtr w Find
  const ObiShopId = '6626adc5a5b15d56ea2cb5dc';
  const CastoramaShopId = '66255aee1b80af46d117b52b';

  for (const scapper of scrappers){
    if (scapper.shopId.toString() === ObiShopId){
      await ScrapeObi(scapper.link, scapper.categoryId);
    }
    if (scapper.shopId.toString() === CastoramaShopId){
      await ScrapeCastorama(scapper.link, scapper.categoryId);
    }
  }
  res.json();
});

  app.listen(port, () => {
    console.log('Server running on port: 3000')
  });
});



/*
app.post('/Scrapper/Run', async (req, res) => {
  const shops = await shops_collection.find().toArray();
  const shopIdScrapper = [];
  const shopScrapeMap={
    'OBI' : ScrapeObi,
    'Castorama': ScrapeCastorama
  }

  shops.forEach(shop=>{ if (shopScrapeMap[shop.name]){
    shopIdScrapper[shop._id.toString()]=shopScrapeMap[shop.name];
  }});


  const scrappers = await scrapper_collection.find().toArray(); //TODO Filtr w Find


  for (const scapper of scrappers){
    const scrapeFunction = shopIdScrapper[scapper.shopId.toString()];
    if (scrapeFunction){
      await scrapeFunction(scapper.link, scapper.categoryId);
    }
  }
  res.json();
});
*/