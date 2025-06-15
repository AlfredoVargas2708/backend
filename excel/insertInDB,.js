const pool = require('../database/config.db')
const readExcelFile = require('./read');

async function insertCodes(filePath) {
    try {
        let dataExcel = await readExcelFile(filePath); // Read the Excel file

        if (!dataExcel || dataExcel.length === 0) {
            console.error('No data found in the Excel file.');
            return;
        }

        const selectQuery = 'SELECT * FROM products'
        let existingProducts = await pool.query(selectQuery); // Fetch existing products from the database

        let productsCodes = dataExcel.map(product => {
            return {
                codigobarra: product.codigobarra,
                nombre: product.nombre
            };
        });

        let productsFound = [];

        for (const product of productsCodes) {
            const existingProduct = existingProducts.rows.find(p => p.product_name === product.nombre);
            if (existingProduct) {
                productsFound.push({
                    codigobarra: product.codigobarra,
                    nombre: product.nombre,
                    id: existingProduct.id
                });
            }
        }

        if (productsFound.length === 0) {
            console.log('No matching products found in the database.');
            return;
        }

        const updatePromises = productsFound.map(product => {
            return pool.query('UPDATE products SET product_code = $1 WHERE id = $2', [product.codigobarra, product.id]);
        });
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error inserting codes into the database:', error);
    }
}

module.exports = insertCodes;