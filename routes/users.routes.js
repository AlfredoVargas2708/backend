const express = require('express');
const router = express.Router();

const { UserController } = require('../controllers/index')
let UserCtrl = new UserController();

router.post('/login', UserCtrl.Login);
router.post('/signup', UserCtrl.SignUp);
router.get('/confirm-email/:email', UserCtrl.ConfirmEmail);
router.get('/check-email/:email', UserCtrl.CheckEmail);
router.get('/check-email-verified/:email', UserCtrl.CheckEmailVerified);
router.post('/reset-password', UserCtrl.ResetPassword);
router.get('/verify-email/:email', UserCtrl.VerifyEmail);


module.exports = router;