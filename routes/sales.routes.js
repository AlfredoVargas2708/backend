const express = require('express');
const router = express.Router();

const { SalesController } = require('../controllers/index');
const SaleCtrl = new SalesController();

router.get('/count', SaleCtrl.getSalesCount);

module.exports = router;