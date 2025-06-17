const sendPasswordForgotEmail = require('../emails/sendPasswordForgot');

class EmailController {

    async sendPasswordForgotEmail(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            // Call the function to send the password forgot email
            await sendPasswordForgotEmail(email);

            // Here you would typically call a service to send the email
            // For example, using a mail service like Nodemailer or SendGrid
            // await emailService.sendPasswordForgotEmail(email);

            console.log(`Password forgot email sent to: ${email}`);
            res.status(200).json({ message: 'Password forgot email sent successfully' });
        } catch (error) {
            console.error('Error sending password forgot email:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = EmailController;