const express = require('express');
const router = express.Router();

const { SalesController } = require('../controllers/index');
const SaleCtrl = new SalesController();

router.get('/count', SaleCtrl.getSalesCount);
router.get('/between', SaleCtrl.getSalesBetweenDates);
router.get('/', SaleCtrl.getSalesByMonth);
router.get('/products', SaleCtrl.getProductsSalesInMonth);
router.post('/', SaleCtrl.createSale);

module.exports = router;