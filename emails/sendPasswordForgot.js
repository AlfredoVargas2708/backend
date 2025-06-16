const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Cargar el contenido del archivo HTML
const htmlTemplate = fs.readFileSync(path.join(__dirname, 'passwordForgot.html'), 'utf8');

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
    to: 'vargasgandolini34@gmail.com',
    subject: 'Recuperación de contraseña',
    text: 'Recuperación de contraseña',
    html: htmlTemplate.replace('{{reset_link}}', 'http://localhost:4200')
};

transport.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.error('Error al enviar correo:', error);
    }
    console.log('Correo enviado:', info.messageId);
});
