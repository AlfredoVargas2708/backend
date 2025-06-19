const pool = require('../database/config.db')

class SalesController {

    async getSalesCount(req, res) {
        try {
            const query = 'SELECT COUNT(*) AS count FROM sales';
            const count = await pool.query(query);

            if (count.rows.length === 0) {
                return res.send(0);
            }

            const totalCount = count.rows[0].count;
            res.send(totalCount.toString());
        } catch (error) {
            console.error('Error fetching sales count:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createSale(req, res) {
        try {
            const { sale, products } = req.body;
            if (!sale || !products || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ error: 'Invalid sale data' });
            }

            const { date, total } = sale;

            const query = 'INSERT INTO sales (fecha_venta, total) VALUES ($1, $2) RETURNING id';
            const values = [date, total];

            const result = await pool.query(query, values);
            const saleId = result.rows[0].id;

            const insertProductPromises = products.map(p => {
                return pool.query(
                    'INSERT INTO sales_products (sale_id, product_id, cant, price) VALUES ($1, $2, $3, $4)',
                    [saleId, p.id, p.cant, p.price]
                );
            });
            await Promise.all(insertProductPromises);

            res.status(201).json({ id: saleId });
        } catch (error) {
            console.error('Error creating sale:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = SalesController;