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
}

module.exports = SalesController;