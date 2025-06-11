const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const scrapeWebsite = require('./web/scrapping');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

setInterval(async () => {
    await scrapeWebsite();
}, 15000);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});