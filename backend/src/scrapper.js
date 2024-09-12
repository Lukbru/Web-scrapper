const cron = require('node-cron');
const winston = require('winston');
require('winston-mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'scrapper.log'}),
        new winston.transports.MongoDB({collection: 'logs'})
    ]
});

async function scrapperCron(link, categoryId, shopId){
    if (shopId === '6626adc5a5b15d56ea2cb5dc'){
        logger.info(`Scrapping : ${link}`)
        await ScrapeObi(link, categoryId);
    } else if (shopId === '66255aee1b80af46d117b52b'){
        logger.info(`Scrapping : ${link}`)
        await ScrapeCastorama(link, categoryId);
    } else {
        logger.info(`No shop found for this Id : ${shopId}`)
    }
}

async function startScrapper() {
    try {
    await client.connect();
    const database = client.db('mydatabase');
    const scrapperCollection = database.collection('Scrapper');
    const links = await scrapperCollection.find().toArray();

    for (const link of links){
        await scrapperCron(link.link, link.categoryId, link.shopId)
    }} catch (error) {
        console.error('Error :', error)
    } finally {
        await client.close();
    }
}

cron.schedule('10 12 * * *', () => {
    console.log('Running scheduled scrapper...');
    startScrapper();
});

startScrapper();