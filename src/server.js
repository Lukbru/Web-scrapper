const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";

const express = require('express');
const bodyParser = require('body-parser');

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


client.connect().then(() => {
  const db = client.db('mydatabase');
  const product_collection = db.collection('Products');
  const shops_collection = db.collection('Shops');
  const shopProduct_collection = db.collection('ShopProduct');
  const productPrice_collection = db.collection('ProductPrice');

  app.get('/products', async (req, res) => {
const products = await product_collection.find().toArray();
res.json(products);
  });


  app.get('/shopproduct', async (req, res) => {
const shopProduct = await shopProduct_collection.find().toArray();
res.json(shopProduct);
  });


  // REST api ??? POCZYTAJ

  app.put('/connect', async (req, res) => { // TODO renane ProductPrice to ShopProductPrice to be more meaningful
const { shopProductId, productId } = req.body; 
// TODO add validaiton if missing - throw 400

// TODO throw 400 if shop product id doesn't exist
// TODO throw 400 if product id not found

await shopProduct_collection.updateOne(
  { _id: new ObjectId(shopProductId)},
  {$set: { productId: new ObjectId(productId)}}
   );
res.send('Connected Product')
   });

  app.listen(port,() => {
console.log('Server running on port: 3000')
  });


});
/*
async function ConnectDatabase(){
  try{
    await client.connect();
    console.log('Connected to Database.');
    const db = client.db('mydatabase');

    const product_collection = db.collection('Products');
    const shops_collection = db.collection('Shops');
    const shopProduct_collection = db.collection('ShopProduct');
    const productPrice_collection = db.collection('ProductPrice');

    const product = await product_collection.find().toArray();
    console.log('Products :',product);

    const shops = await shops_collection.find().toArray();
    console.log('Shops :',shops);

    const shopProducts = await shopProduct_collection.find().toArray();
    console.log('Shop Products :',shopProducts);

    const productPrice = await productPrice_collection.find().toArray();
    console.log('Products Price :',productPrice);

  } catch(error){
    console.log('Failed to connect to Database :(');
  } finally {
    await client.close();
  }
}

async function FindProduct(productname){
  try{
    await client.connect();
    const db = client.db('mydatabase');
    const product_collection = db.collection('Products');
    const shops_collection = db.collection('Shops');
    const shopProduct_collection = db.collection('ShopProduct');
    const productPrice_collection = db.collection('ProductPrice');

    const shopProduct = await shopProduct_collection.findOne({name: new RegExp(productname)});

    if (!shopProduct){
      console.log('Producnt not found.');
      return null;
    } 
    
    const shop = await shops_collection.findOne({ _id: shopProduct.shopId});

    const productPrice = await productPrice_collection.find({link: shopProduct.link}).toArray();

    const product_data = {
      productName: shopProduct.name,
      shopName: shop ? shop.name: 'unknow',
      productLink: shopProduct.link
    };
    return product_data;

  } catch (error){
    console.error('Error');
    return null;
  } finally {
    await client.close();
  }
}
FindProduct('Glebogryzarka').then(result => {
console.log(result);
});
*/
//ConnectDatabase();
