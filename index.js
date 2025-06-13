const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const scrapeWebsite = require('./web/scrapping');
const insertCodes = require('./excel/insertInDB,');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

setTimeout(async () => {
    //await scrapeWebsite(); // Initial scrape when the server starts
    await insertCodes('./excel/ALOGAR_table_productos.xlsx'); // Insert codes after scraping
}, 5000);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});