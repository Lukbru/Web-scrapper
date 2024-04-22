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
            shopId: item.shopId
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
///////////////////////////////////////////////////////////////////////////////////////
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)); // Czeka dany czas
  }
module.exports={saveToMongoDB,CheckMongoDB,sleep,SaveName}
