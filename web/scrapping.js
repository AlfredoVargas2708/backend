const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const pool = require('../database/config.db');

async function scrapeWebsite() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Configuración inicial
        let currentPage = 1;
        let hasMorePages = true;

        const products = [];

        while (hasMorePages) {
            const url = currentPage === 1
                ? 'https://alogar.cl/collections/all'
                : `https://alogar.cl/collections/all?page=${currentPage}`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            const content = await page.content();
            const { window: { document } } = new jsdom.JSDOM(content);

            // Extraer productos
            const cards = document.querySelectorAll('.grid-view-item.product-card');
            if (cards.length === 0) {
                console.log('No products found on page');
                break;
            }

            cards.forEach((element) => {
                const item = {
                    productName: element.querySelector('.grid-view-item__title.product-card__title')?.textContent.trim(),
                    productPrice: element.querySelector('.price.price--listing.price--sale') ?
                        Number(element.querySelector('.price-item.price-item--sale').textContent.trim().replace('$', '').replace('.', '')) :
                        Number(element.querySelector('.price-item.price-item--regular').textContent.trim().replace('$', '').replace('.', '')),
                    productImage: element.querySelector('.grid-view-item__image-wrapper.product-card__image-wrapper.js').getElementsByTagName('div')[0].getElementsByTagName('img')[0].getAttribute('data-src') ?
                        'https:' + element.querySelector('.grid-view-item__image-wrapper.product-card__image-wrapper.js').getElementsByTagName('div')[0].getElementsByTagName('img')[0].getAttribute('data-src').split('?')[0].replace('{width}', '600') :
                        'https:' + element.querySelector('.grid-view-item__image-wrapper.product-card__image-wrapper.js').getElementsByTagName('div')[0].getElementsByTagName('img')[0].getAttribute('data-srcset').replace('{width}', '600').split('?')[0],
                    productLink: 'https://alogar.cl' + element.querySelector('.grid-view-item__link.grid-view-item__image-container.full-width-link').getAttribute('href')
                };

                products.push(item);
            });

            // Verificar si hay más páginas
            const paginationText = document.querySelector('.pagination__text')?.textContent.trim();
            if (!paginationText) {
                hasMorePages = false;
                break;
            }

            const parts = paginationText.split(' ');
            if (parts.length < 4) {
                hasMorePages = false;
                break;
            }

            const totalPages = parseInt(parts[3].replace(/[()]/g, ''));
            if (currentPage >= totalPages) {
                hasMorePages = false;
            } else {
                currentPage++;
            }
        }

        const createQuery = `
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                product_name VARCHAR(255),
                product_price NUMERIC,
                product_image TEXT,
                product_link TEXT,
                product_code VARCHAR(255) UNIQUE
            );`;

        await pool.query(createQuery);

        const selectQuery = 'SELECT * FROM products;';
        const existingProducts = await pool.query(selectQuery);

        const existingProductsInBBDD = existingProducts.rows.map(product => product);

        existingProductsInBBDD.forEach(async (product) => {
            const index = products.findIndex(p => p.productName.includes(product.product_name))
            if (index !== -1) {
                products.splice(index, 1);
            }
        });

        if (products.length > 0) {
            const insertQuery = `
                INSERT INTO products (product_name, product_price, product_image, product_link)
                VALUES ($1, $2, $3, $4)`;

            for (const product of products) {
                await pool.query(insertQuery, [
                    product.productName,
                    product.productPrice,
                    product.productImage,
                    product.productLink
                ]);
            }
        }
        await browser.close();
    } catch (error) {
        console.error('Error during web scraping:', error);
    }
};

module.exports = scrapeWebsite;