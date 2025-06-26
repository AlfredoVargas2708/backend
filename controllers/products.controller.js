const pool = require('../database/config.db')

class ProductsController {

    getProductByCode(req, res) {
        try {
            const { code } = req.params;

            const query = 'SELECT * FROM products WHERE product_code = $1 LIMIT 10 OFFSET 0';
            pool.query(query, [code], (error, result) => {
                if (error) {
                    console.error('Error executing query:', error);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                if (result.rows.length === 0) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                res.status(200).json(result.rows[0]);
            });
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