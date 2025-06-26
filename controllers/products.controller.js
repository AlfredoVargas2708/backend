const pool = require('../database/config.db')

class ProductsController {

    async addProduct(req, res) {
        try {
            const { productName, productPrice, productImage, productLink }  = req.body;

            if (!productName || !productPrice || !productImage || !productLink) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const query = `INSERT INTO products (product_name, product_price, product_image, product_link) 
                           VALUES ($1, $2, $3, $4)
                           RETURNING *`;
            const values = [productName, productPrice, productImage, productLink];
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(500).json({ error: 'Failed to add product' });
            }
            res.status(201).json({ data: result.rows[0] });
        } catch (error) {
            console.error('Error in addProduct:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getProductByCode(req, res) {
        try {
            const { code } = req.params;

            if (!code) {
                return res.status(400).json({ error: 'Product code is required' });
            }

            const query = `SELECT * FROM products WHERE product_code = $1`;
            const result = await pool.query(query, [code]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json({ data: result.rows[0] });
        } catch (error) {
            console.error('Error in getProductByCode:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAllProducts(req, res) {
        try {
            // Validación y parseo de parámetros
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;

            if (page < 1 || limit < 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Los parámetros page y limit deben ser números positivos'
                });
            }

            const offset = (page - 1) * limit;

            // Usamos una transacción para asegurar consistencia entre las dos consultas
            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                // Consulta para los productos (con ordenación)
                const productsQuery = `
                SELECT * FROM products 
                LIMIT $1 OFFSET $2
            `;
                const productsResult = await client.query(productsQuery, [limit, offset]);

                // Consulta para el total de productos
                const countQuery = 'SELECT COUNT(*) FROM products';
                const countResult = await client.query(countQuery);

                await client.query('COMMIT');

                const totalProducts = parseInt(countResult.rows[0].count, 10);
                const totalPages = Math.ceil(totalProducts / limit);

                res.status(200).json({
                    data: {
                        products: productsResult.rows,
                        pagination: {
                            currentPage: page,
                            itemsPerPage: limit,
                            totalItems: totalProducts,
                            totalPages: totalPages,
                            hasNextPage: page < totalPages,
                            hasPrevPage: page > 1
                        }
                    }
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error in getAllProducts:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
}

module.exports = ProductsController;