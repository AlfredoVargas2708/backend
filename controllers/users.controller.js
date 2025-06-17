const pool = require('../database/config.db');
const bcrypt = require('bcrypt');
const sendConfirmationEmail = require('../emails/sendConfirmation');

class UserController {
    async Login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Here you would typically generate a JWT token and send it back to the client
            res.status(200).json({ message: 'Login successful', user: user.rows[0] });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async SignUp(req, res) {
        try {
            const { email, password, role } = req.body;
            if (!email || !password || !role) {
                return res.status(400).json({ message: 'Email, password, and role are required' });
            }

            const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(409).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await pool.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
                [email, hashedPassword, role]
            );

            await sendConfirmationEmail(email);

            res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

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

            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
            res.status(200).json({ message: 'Password reset successful' });

        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = UserController;