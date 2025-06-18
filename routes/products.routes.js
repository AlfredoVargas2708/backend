const express = require('express');
const router = express.Router();

const { ProductsController } = require('../controllers');
const ProdCtrl = new ProductsController();

router.get('/:code', ProdCtrl.getProductByCode);

module.exports = router;