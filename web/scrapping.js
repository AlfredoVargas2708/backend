const puppeteer = require('puppeteer');
const jsdom = require('jsdom');

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
                        element.querySelector('.price-item.price-item--sale').textContent.trim() :
                        element.querySelector('.price-item.price-item--regular').textContent.trim(),
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

        await browser.close();
    } catch (error) {
        console.error('Error during web scraping:', error);
    }
};

module.exports = scrapeWebsite;