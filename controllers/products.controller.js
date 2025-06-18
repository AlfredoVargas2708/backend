const pool = require('../database/config.db')

class ProductsController {

    getProductByCode(req, res) {
        try {
            const { code } = req.params;

            const query = 'SELECT * FROM products WHERE product_code = $1';
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
}

module.exports = ProductsController;