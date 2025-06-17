const express = require('express');
const router = express.Router();

const { EmailController } = require('../controllers/index');
let EmailCtrl = new EmailController();

router.post('/send-password-forgot', EmailCtrl.sendPasswordForgotEmail)

module.exports = router;