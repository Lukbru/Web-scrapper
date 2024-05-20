// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";

// const client = new MongoClient(uri, {
//     serverApi: {
//       version: ServerApiVersion.v1,
//       strict: true,
//       deprecationErrors: true,
//     }
//   });

// async function run(){
//     try {
//     await client.connect();
//     const database = client.db('mydatabase')
//     const collection = database.collection('ShopProductPrice');
//     const aaa = collection.find({price:{$type: "string"}});
//     while ( await aaa.hasNext()){
//         const doc = await aaa.next();
//         const priceString = doc.price;
//         let updated = false;
//         if (priceString){
//             const price = parseFloat(priceString.replace(/[^\d,]/g, '').replace(',','.'));
//             if ( !isNaN(price)){
//                 doc.price = price;
//                 updated = true;
//             }
//         }
//         if (updated){
//             await collection.updateOne(
//                 {_id: doc._id},
//                 {$set: {price: doc.price}}
//             );
//         }
//     }
    
//       } finally {
//         await client.close();
//       }
// }

// run().catch(console.dir);