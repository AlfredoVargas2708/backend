const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const pool = require('../database/config.db');

async function scrapeWebsite() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const baseUrl = 'https://alogar.cl/collections/all';

        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

        const content = await page.content();
        const { window: { document } } = new jsdom.JSDOM(content);

        const totalPages = parseInt(document.querySelector('.pagination__text')?.textContent.trim().split(' ')[3]) || 1;
        
        const products = [];
        
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                await page.goto(`${baseUrl}?page=${i}`, { waitUntil: 'domcontentloaded' });
                const pageContent = await page.content();
                const { window: { document } } = new jsdom.JSDOM(pageContent);

                const productElements = document.querySelectorAll('.grid-view-item');
                productElements.forEach(productElement => {
                    const productName = productElement.querySelector('.grid-view-item__title')?.textContent.trim();
                    const productPrice = productElement.querySelector('.price-item.price-item--regular')?.textContent.trim();
                    const productImage = productElement.querySelector('.grid-view-item__image-wrapper').getElementsByTagName('div')[0].getElementsByTagName('img')[0].getAttribute('data-src') ?
                        'https:' + productElement.querySelector('.grid-view-item__image-wrapper').getElementsByTagName('div')[0].getElementsByTagName('img')[0].getAttribute('data-src').split('?')[0].replace('{width}', '600') :
                        'https:' + productElement.querySelector('.grid-view-item__image-wrapper').getElementsByTagName('div')[0].getElementsByTagName('img')[0].getAttribute('data-srcset').replace('{width}', '600').split('?')[0];
                    const productLink = productElement.querySelector('.grid-view-item__link')?.href;

                    if (productName) {
                        products.push({
                            name: productName,
                            price: parseInt(productPrice.replace('$', '').replace('.', '')),
                            image: productImage,
                            link: productLink ? baseUrl + productLink : null,
                        });
                    }
                });
            }
        }

        if (products.length > 0) {
            const selectQuery = 'SELECT * FROM products';
            const existingProducts = await pool.query(selectQuery);

            const existingProductNames = new Set(existingProducts.rows.map(p => p.product_name));
            const newProducts = products.filter(p => !existingProductNames.has(p.name));

            if (newProducts.length > 0) {
                const insertQuery = `
                    INSERT INTO products (product_name, product_price, product_image, product_link)
                    VALUES ($1, $2, $3, $4)`;

                for (const product of newProducts) {
                    const values = [product.name, product.price, product.image, product.link];
                    const result = await pool.query(insertQuery, values);
                }

                console.log(`${newProducts.length} new products inserted into the database.`);
            } else {
                console.log('No new products to insert.');
            }
        }

        await browser.close();
    } catch (error) {
        console.error('Error during web scraping:', error);
    }
};

module.exports = { scrapeWebsite };