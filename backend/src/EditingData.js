// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";

// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });
// async function run() {
//     try {
//         await client.connect();
//         const database = client.db('mydatabase');
//         const collection = database.collection('ShopProductPrice');
//         console.log('start');

//         // Define the date ranges for 04.12.2024 and 05.12.2024
//         const date04Start = new Date("2024-12-04T00:00:00.000Z"); // Start of 04.12.2024
//         const date04End = new Date("2024-12-05T00:00:00.000Z");   // End of 04.12.2024 (start of 05.12.2024)

//         const date05Start = new Date("2024-12-05T00:00:00.000Z"); // Start of 05.12.2024
//         const date05End = new Date("2024-12-06T00:00:00.000Z");   // End of 05.12.2024 (start of 06.12.2024)

//         // Find all documents for 05.12.2024 to get prices for each product
//         const products05 = await collection.find({
//             createdAt: { $gte: date05Start, $lt: date05End }
//         }).toArray();

//         if (products05.length > 0) {
//             console.log("Found products for 05.12.2024:", products05.length);

//             // Now, for each product, find matching documents from 04.12.2024 and update the price
//             for (const doc05 of products05) {
//                 if (doc05.price && doc05.shopProductId) {
//                     console.log(`Found price for product ${doc05.shopProductId} on 05.12.2024:`, doc05.price);

//                     // Find the same product on 04.12.2024 using shopProductId
//                     const result = await collection.updateMany(
//                         {
//                             createdAt: { $gte: date04Start, $lt: date04End },
//                             shopProductId: doc05.shopProductId  // Matching by shopProductId
//                         },
//                         {
//                             $set: { price: doc05.price }  // Set the price to match 05.12.2024
//                         }
//                     );

//                     console.log(`Updated ${result.modifiedCount} documents for product ${doc05.shopProductId} on 04.12.2024.`);
//                 }
//             }
//         } else {
//             console.log("No products found for 05.12.2024.");
//         }

//     } finally {
//         console.log('finished');
//         await client.close();
//     }
// }

// run().catch(console.dir);