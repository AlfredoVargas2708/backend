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

    async getSalesByMonth(req, res) {
        try {
            const query = `
                SELECT 
                    TO_CHAR(fecha_venta, 'MM-YYYY') AS mes,
                    SUM(total) AS total
                FROM 
                    sales
                GROUP BY 
                    TO_CHAR(fecha_venta, 'MM-YYYY')
                ORDER BY 
                    mes;
            `;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching sales:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getProductsSalesByMonth(req, res) {
        try {
            const query = `
                SELECT 
                    p.product_name,
                    sp.price,
                    TO_CHAR(s.fecha_venta, 'YYYY-MM') AS mes,
                    SUM(sp.cant) AS total_vendido
                FROM 
                    sales s
                JOIN 
                    sales_products sp ON s.id = sp.sale_id
                JOIN 
                    products p ON sp.product_id = p.product_id
                GROUP BY 
                    p.product_name, TO_CHAR(s.fecha_venta, 'YYYY-MM'),
                    sp.price
                ORDER BY 
                    mes, p.product_name;
            `;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching product sales by month:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = SalesController;