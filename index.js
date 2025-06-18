const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { scrapeWebsite } = require('./web/scrapping');
const routes = require('./routes/index');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

setInterval(async () => {
    await scrapeWebsite(); // Scrape the website every half hour
}, 1800000);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});