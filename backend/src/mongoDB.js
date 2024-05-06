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
catch(error){
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

  // saveShopProducts
  
  
async function CheckMongoDB(data, collectionName) {
    const database = client.db('mydatabase');
    const collection = database.collection(collectionName);
    const options = { upsert: true };
  
    for (const item of data) {
      try {
        const log = {
          $or: [
          {sourceId: item.SourceID},
          {link: item.link}
          ]
        };
      const update = {
        $set :{
            sourceId: item.SourceID,
            link: item.link,
            shopId: item.shopId,
            name: item.name,
            createdAt: item.createdAt
        }
      };
  
    const collectionA = await collection.updateOne(log, update, options);
    if (collectionA.upsertedCount > 0 ) {
    console.log('Data updated to MongoDB');
    } else {
      console.log('Data already exist in MongoDB');
    }
      }
      catch(error){
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
          {name: item.name}
          ]
        };
      const update = {
        $set :{
            name: item.name
        }
      };
  
    const collectionA = await collection.updateOne(log, update, options);
    if (collectionA.upsertedCount > 0 ) {
    console.log('Data updated to MongoDB');
    } else {
      console.log('Data already exist in MongoDB');
    }
      }
      catch(error){
        console.error('Error - please try again later ?');
      }
    }
  }

 
  async function SaveProductPrice(data, collectionName, mycollectionId) {
    const database = client.db('mydatabase');
    const collection = database.collection(collectionName);


    for (const item of data) {
      const shopProductId = mycollectionId[item.SourceID];
      
      const update = {
            sourceId: item.SourceID,
            price: item.price,
            shopProductId: shopProductId,
            createdAt: item.createdAt
      };
      try{
        await collection.insertOne(update);
        console.log('Price saved')
      } catch (error) {
        console.log('ERROR - Price not found')
      }
  }
}

async function UpdateShopProduct(data, collectionName) {
  const database = client.db('mydatabase');
  const collection = database.collection(collectionName);
  const options = { upsert: true };
  const mycollectionId = [];

  for (const item of data) {
    try {
      const log = {
        $or: [
        {sourceId: item.SourceID},
        {link: item.link}
        ]
      };
    const update = {
      $set :{
          sourceId: item.SourceID,
          link: item.link,
          shopId: item.shopId,
          name: item.name,
          createdAt: item.createdAt
      }
    };

  const collectionA = await collection.updateOne(log, update, options);
  if (collectionA.upsertedCount > 0 ) {
    const addIdCollection = result.upsertedId;
    mycollectionId[item.SourceID] = addIdCollection;
  console.log('Data updated to MongoDB');
  } else {
    const existCollection = await collection.findOne(log);
    mycollectionId[item.SourceID] = existCollection._id
    console.log('Data already exist in MongoDB');
  }
    }
    catch(error){
      console.error('Error - please try again later ?');
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // Czeka dany czas
  }
module.exports={saveToMongoDB,CheckMongoDB,sleep,SaveName,SaveProductPrice,UpdateShopProduct}
