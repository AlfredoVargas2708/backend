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
        let productsNotFound = [];

        for (const product of productsCodes) {
            const existingProduct = existingProducts.rows.find(p => p.product_name === product.nombre);
            if (existingProduct) {
                productsFound.push({
                    codigobarra: product.codigobarra,
                    nombre: product.nombre,
                    id: existingProduct.id
                });
            }else {
                productsNotFound.push({
                    codigobarra: product.codigobarra,
                    nombre: product.nombre,
                });
            }
        }
        

    } catch (error) {
        console.error('Error inserting codes into the database:', error);
    }
}

module.exports = insertCodes;