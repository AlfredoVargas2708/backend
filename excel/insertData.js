const pool = require('../database/config.db');

async function insertData(data) {
    try {
        const selectQuery = 'SELECT * FROM products';
        const existingProducts = await pool.query(selectQuery);

        const productsCode = data.map(product => product.map(item => {
            return {
                code: item.codigobarra,
                name: item.nombre,
            }
        })).flat();

        for (const product of productsCode) {
            for (const existingProduct of existingProducts.rows) {
                if (existingProduct.product_name === product.name) {
                    const updateQuery = `
                        UPDATE products
                        SET product_code = $1
                        WHERE product_name = $2
                    `;
                    const values = [Number(product.code), product.name];
                    await pool.query(updateQuery, values);

                    console.log(`Updated product: ${product.name} with code: ${product.code}`);
                }
            }
        }

    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

module.exports = { insertData };