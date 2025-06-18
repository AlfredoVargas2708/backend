const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function sendConfirmationEmail(email) {
    // Load the HTML template
    const htmlTemplate = fs.readFileSync(path.join(__dirname, 'confirmationEmail.html'), 'utf8');

    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "6bd6aa2e7d52ed",
            pass: "770503dab8d876"
        }
    });

    const mailOptions = {
        from: 'Alogar <noreply@alogar.com>',
        to: email,
        subject: 'Email Confirmation',
        html: htmlTemplate.replace('{{nombre}}', email).replace('{{url_confirmacion}}', `http://localhost:4200/confirm-email/${email}`)
    };

    try {
        await transport.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

module.exports = { sendConfirmationEmail };