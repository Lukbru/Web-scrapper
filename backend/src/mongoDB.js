const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  }
  catch (error) {
    console.error("ERROR");
  }
}
run();
///////////////////////////////////////////////////////////////////////////////
async function saveToMongoDB(data, collectionName) {
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);

  await collection.insertMany(data);
  console.log('Data saved to MongoDB');
}

//Number(cena.slice(0, cena.length-3).replace(',', '.')) 


async function CheckMongoDB(data, collectionName) { //TODO CHANGE THE NAMES
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);
  const options = { upsert: true };

  for (const item of data) {
    try {
      const filter = {
        $or: [
          { sourceId: item.SourceID }
        ]
      };
      const update = {
        $set: {
          sourceId: item.SourceID,
          link: item.link,
          shopId: item.shopId,
          name: item.name,
          categoryId: item.categoryId
        },
        $setOnInsert:{
          createdAt: product.createdAt
        }
      };

      const collectionA = await collection.updateOne(filter, update, options);
      if (collectionA.upsertedCount > 0) {
        console.log('Data updated to MongoDB');
      } else {
        console.log('Data already exist in MongoDB');
      }
    }
    catch (error) {
      console.error('Error - please try again later ?');
    }
  }
}
async function SaveName(data, collectionName) {
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);
  const options = { upsert: true };

  for (const item of data) {
    try {
      const log = {
        $or: [
          { name: item.name }
        ]
      };
      const update = {
        $set: {
          name: item.name
        }
      };

      const collectionA = await collection.updateOne(log, update, options);
      if (collectionA.upsertedCount > 0) {
        console.log('Data updated to MongoDB');
      } else {
        console.log('Data already exist in MongoDB');
      }
    }
    catch (error) {
      console.error('Error - please try again later ?');
    }
  }
}

async function SaveProduct(data, collectionName) {
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);
  const options = { upsert: true };

  for (const item of data) {
    try {
      const log = {
        $or: [
          { name: item.name },
        ]
      };
      const update = {
        $set: {
          name: item.name,
          categoryId: item.categoryId
        }
      };

      const collectionA = await collection.updateOne(log, update, options);
      if (collectionA.upsertedCount > 0) {
        console.log('Data updated to MongoDB');
      } else {
        console.log('Data already exist in MongoDB');
      }
    }
    catch (error) {
      console.error('Error - please try again later ?');
    }
  }
}

async function savePrice(data) {
  const database = client.db('mydatabase');
  const collection = database.collection('ShopProductPrice');

  await collection.insertOne({
    version: 2,
    price: data.price,
    shopProductId: data.shopProductId,
    createdAt: new Date(data.createdAt)
  });
}

async function saveToCollection(data) {
  for (const item of data) {
    await upsertShopProduct(item);
  }
}

async function upsertShopProduct(product) {
  const database = client.db('mydatabase');
  const collection = database.collection('ShopProduct');
  try {
    const update = {
      $set: {
        sourceId: product.sourceId,
        link: product.link, 
        shopId: product.shopId,
        name: product.name,
        categoryId: product.categoryId
      },
      $setOnInsert:{
        createdAt: product.createdAt
      }
    };

    const dbShopProduct = await collection.findOneAndUpdate({ sourceId: product.sourceId }, update, { upsert: true });
    console.log(dbShopProduct);
    
    if (dbShopProduct.upsertedCount > 0) {
      console.log('Data updated to MongoDB');
    } else {
      console.log('Data already exist in MongoDB');
    }
    return dbShopProduct._id.toString();
  }
  catch (error) {
    console.error('Error - please try again later ?');
  }
}

async function findShopByName(shopName) {
  const database = client.db('mydatabase');
  const shopsCollection = database.collection("Shops");
  const shop = await shopsCollection.findOne({ name: shopName });
  if (!shop) {
    throw new Error("Shop not found.");
  }
  return shop;
}

async function saveDetail(data, collectionName){
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);
  const options = { upsert: true };

  for (const item of data) {
    try {
      const log = {
        shopId: item.shopId,
        sourceId: item.sourceId
      };
      const update = {
        $set: {
          sourceId: item.sourceId,
          description: item.description,
          imageUrl : item.imageUrl
      }
      };

      const collectionA = await collection.updateOne(log, update, options);
      if (collectionA.upsertedCount > 0) {
        console.log('Description added to MongoDB');
      } else {
        console.log('Description already exist in MongoDB');
      }
    }
    catch (error) {
      console.error('Error - please try again later ?');
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms)); // Czeka dany czas
}

async function randomDelay(max, min){
  return Math.floor(Math.random()* (max - min + 1) + min);
}

module.exports = { saveToMongoDB, CheckMongoDB, sleep, SaveName,SaveProduct, saveToCollection, savePrice, upsertShopProduct, findShopByName,randomDelay, saveDetail}
