const pool = require('../database/config.db')

class ProductsController {

async filterProducts(req, res) {
    try {
        const { search, minValue, maxValue, page, pageSize } = req.query;

        const limit = parseInt(pageSize, 10) || 10;
        const offset = ((parseInt(page, 10) || 1) - 1) * limit;

        if (limit < 1 || offset < 0) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }

        let query = `SELECT * FROM products WHERE 1=1`;
        let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
        const values = [];
        let paramCount = 0;

        if (search && search.trim() !== '') {
            query += ` AND product_name ILIKE $${++paramCount}`;
            countQuery += ` AND product_name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }

        if (minValue && maxValue) {
            const min = parseFloat(minValue);
            const max = parseFloat(maxValue);
            if (!isNaN(min) && !isNaN(max)) {
                query += ` AND product_price BETWEEN $${++paramCount} AND $${++paramCount}`;
                countQuery += ` AND product_price BETWEEN $${paramCount-1} AND $${paramCount}`;
                values.push(min, max);
            }
        }

        // Clone values array for count query
        const countValues = [...values];

        // Add pagination to main query only
        query += ` ORDER BY product_id ASC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        const countResult = await pool.query(countQuery, countValues);
        
        res.status(200).json({
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count, 10),
                page: parseInt(page, 10) || 1,
                pageSize: limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
            }
        });
    } catch (error) {
        console.error('Error in filterProducts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

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

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { productName, productPrice, productImage, productLink } = req.body;

            if (!id || !productName || !productPrice || !productImage || !productLink) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const query = `UPDATE products
                           SET product_name = $1, product_price = $2, product_image = $3, product_link = $4
                           WHERE product_id = $5`;
            const values = [productName, productPrice, productImage, productLink, id];
            const result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json({ message: 'Product updated successfully' });
        } catch (error) {
            console.error('Error in updateProduct:', error);
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
            res.status(200).json( result.rows[0] );
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
                ORDER BY product_id ASC 
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