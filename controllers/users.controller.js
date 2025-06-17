const pool = require('../database/config.db');
const bcrypt = require('bcrypt');

class UserController {
    async ResetPassword(req, res) {
        try {
            const { email, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }

            const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userExists.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            await pool.query('UPDATE users SET password = $1 WHERE email = $2', [password, email]);

            res.status(200).json({ message: 'Password reset successfully' });

        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = UserController;