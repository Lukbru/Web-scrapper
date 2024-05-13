const cors = require('cors');

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
app.use(cors());


client.connect().then(() => {
  const db = client.db('mydatabase');
  const product_collection = db.collection('Products');
  const category_collection = db.collection('Categories');
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


  app.put('/connect', async (req, res) => {
    const { shopProductId, productId } = req.body;

    if (!shopProductId || !productId) {
      return res.status(400).json({ error: 'shopProductId and productId must exist' });
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
    const categories = await category_collection.find().toArray();
    res.json(categories);
  });
 
  app.listen(port, () => {
    console.log('Server running on port: 3000')
  });
});

