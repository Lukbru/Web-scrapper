const cron = require('node-cron');
const { MongoClient } = require('mongodb');
const { ScrapeCastorama } = require('./Castorama-Scrapper');
const { ScrapeObi } = require('./OBI-Scrapper');

const uri = "mongodb+srv://bruzdalukasz1c:evsPCoHvQN7TERdZ@scrap.mez5fky.mongodb.net/?retryWrites=true&w=majority&appName=Scrap";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function scrapperCron(link, categoryId, shopId){
    if (shopId === '6626adc5a5b15d56ea2cb5dc'){
        await ScrapeObi(link, categoryId);
    } else if (shopId === '66255aee1b80af46d117b52b'){
        await ScrapeCastorama(link, categoryId);
    } else {
        console.log(`No shopId for: ${shopId}`);
    }
}

async function startScrapper() {
    try {
    await client.connect();
    const database = client.db('mydatabase');
    const scrapperCollection = database.collection('Scrapper');
    const links = await scrapperCollection.find().toArray();

    for (const link of links){
        await scrapperCron(link, categoryId, shopId)
    }} catch (error) {
        console.error('Error :', error)
    } finally {
        await client.close
    }
}

cron.schedule('12 12 * * *', () => {
    console.log('Running scheduled scrapper...');
    startScrapper();
});

startScrapper();