const winston = require('winston');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Create a logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'server.log' }),
        new winston.transports.Console()
    ]
});

// Function to scrape the website
async function scrapePetrolOfisi() {
    try {
        const { data } = await axios.get('https://www.petrolofisi.com.tr/akaryakit-fiyatlari/izmir-akaryakit-fiyatlari');
        const $ = cheerio.load(data);

        // Replace with actual selectors
        const firstPrice = $('span.with-tax').first().text().trim();


        return firstPrice;
    } catch (error) {
        console.error('Error occurred while scraping:', error);
        throw error;
    }
}


// Define the /scrape endpoint
app.get('/izmir/price', async (req, res) => {
    try {
        // Call the scrape function
        const data = await scrapePetrolOfisi();

        // Log the request details
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const clientPort = req.connection.remotePort;
        logger.info(`Request from IP: ${clientIp}, Port: ${clientPort}.`);

        // Respond with a plain text message
        res.status(200).send(`Izmir Kursunsuz Fiyatı:${data} TL`);
    } catch (error) {
        // Handle errors
        console.error('Error occurred while scraping:', error);
        res.status(500).send('Error occurred while scraping data.');
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});
