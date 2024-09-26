const cron = require('node-cron');
const winston = require('winston');
require('winston-mongodb');
const { ObjectId, MongoClient, ServerApiVersion } = require('mongodb');
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

async function getCategoryName(categoryId) {
        const database = client.db('mydatebase');
        const categoryCollection = database.collection('Categories');
        const category = await categoryCollection.findOne({ _id: new ObjectId(categoryId) });

        if (category){
            return category.name;
        }
        return 'Unknown Category';
}

let logger;

async function scrapperCron(link, categoryId, shopId){
    let productCount = 0;

    if (shopId === '6626adc5a5b15d56ea2cb5dc'){
        productCount = await ScrapeObi(link, categoryId);
        logger.info(`Products scrapped : ${productCount} from link : ${link}`)
    } else if (shopId === '66255aee1b80af46d117b52b'){
        productCount = await ScrapeCastorama(link, categoryId);
        logger.info(`Products scrapped : ${productCount} from link : ${link}`)
    } else {
        logger.info(`No shop found for this Id : ${shopId}`)
    }

    return productCount;
}

async function startScrapper() {
    const scrapeLogger = {};
    try {
    logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            new winston.transports.File({ filename: 'scrapper.log'}),
            new winston.transports.Console(),
            new winston.transports.MongoDB({collection: 'logs',  db: await Promise.resolve(client)})
        ]
    });

    const database = client.db('mydatabase');
    const scrapperCollection = database.collection('Scrapper');
    const links = await scrapperCollection.find().toArray();

    for (const link of links){
       const productCount = await scrapperCron(link.link, link.categoryId, link.shopId)

       if (!scrapeLogger[link.categoryId]) {
        scrapeLogger[link.categoryId] = 0;
       }
       scrapeLogger[link.categoryId] += productCount;
    }

    for (const [categoryId, productCount] of Object.entries(scrapeLogger)) {
        const categoryName = await getCategoryName(categoryId);
        logger.info(`Scrapped ${productCount} products from category: ${categoryName}`)
    }

    const totalCategories = Object.keys(scrapeLogger).length;
    const totalProducts = Object.values(scrapeLogger).reduce((sum, count) => sum + count, 0)

    logger.info(`Scrapping completed : Total products scrapped - ${totalProducts} from ${totalCategories} categories`)


} catch (error) {
        logger.error('Error :', error)
        await client.close();
    } finally {
        console.log('Scrapping Ended');
    }
}

function exitHandler(options, exitCode) {
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

async function start() {
    await client.connect();
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

cron.schedule('20 12 * * *', async () => {
    //logger.info('Running scheduled scrapper...');
    startScrapper();
});

start();