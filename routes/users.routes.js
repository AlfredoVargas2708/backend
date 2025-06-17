const express = require('express');
const router = express.Router();

const { UserController } = require('../controllers/index')
let UserCtrl = new UserController();

router.post('/login', UserCtrl.Login);
router.post('/reset-password', UserCtrl.ResetPassword);

module.exports = router;