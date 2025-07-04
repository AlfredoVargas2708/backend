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
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Start date and end date are required' });
            }

            const query = `
                SELECT 
                    TO_CHAR(fecha_venta, 'DD-MM') AS sale_date,
                    COUNT(*) AS sales_count
                FROM 
                    sales
                WHERE 
                    fecha_venta >= $1 AND fecha_venta <= $2
                GROUP BY 
                    sale_date
                ORDER BY 
                    sale_date ASC
            `;
            const result = await pool.query(query, [startDate, endDate]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching sales:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getProductsSalesInMonth(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Start date and end date are required' });
            }

            const query = `
                SELECT 
                    p.product_id AS product_id,
                    p.product_name AS product_name,
                    SUM(sp.cant) AS total_quantity,
                    SUM(sp.price * sp.cant) AS total_sales,
                FROM 
                    sales_products sp
                JOIN 
                    sales s ON sp.sale_id = s.id
                JOIN 
                    products p ON sp.product_id = p.product_id
                WHERE 
                    s.fecha_venta >= $1 AND s.fecha_venta < $2::date + INTERVAL '1 day'
                GROUP BY 
                    p.product_id, p.product_name
                ORDER BY 
                    total_sales DESC;
            `;
            const result = await pool.query(query, [startDate, endDate]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching product sales in month:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getSalesBetweenDates(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ error: 'Start date and end date are required' });
            }

            const query = `
                SELECT 
                sale_day,
                json_agg(
                    json_build_object(
                    'product_id', product_id,
                    'product_name', product_name,
                    'total_quantity', total_quantity,
                    'unit_price', unit_price,
                    'total_amount', total_amount
                    ) ORDER BY product_name
                ) AS products,
                SUM(total_amount) AS total_vendido_dia
                FROM (
                SELECT 
                    DATE(s.fecha_venta) AS sale_day,
                    p.product_id,
                    p.product_name,
                    SUM(sp.cant) AS total_quantity,
                    sp.price AS unit_price,
                    SUM(sp.cant * sp.price) AS total_amount
                FROM 
                    sales s
                JOIN 
                    sales_products sp ON s.id = sp.sale_id
                JOIN 
                    products p ON sp.product_id = p.product_id
                WHERE 
                    s.fecha_venta >= $1
                    AND s.fecha_venta < $2::date + INTERVAL '1 day'
                GROUP BY 
                    sale_day, p.product_id, p.product_name, sp.price
                ) AS daily_products
                GROUP BY sale_day
                ORDER BY sale_day;
            `;

            const result = await pool.query(query, [startDate, endDate]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching sales between dates:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = SalesController;