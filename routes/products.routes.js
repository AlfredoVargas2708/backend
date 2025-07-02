const express = require('express');
const router = express.Router();

const { ProductsController } = require('../controllers');
const ProdCtrl = new ProductsController();

router.get('/search/:code', ProdCtrl.getProductByCode);
router.get('/', ProdCtrl.getAllProducts);
router.get('/count', ProdCtrl.getCountProducts);
router.post('/', ProdCtrl.addProduct);
router.put('/:id', ProdCtrl.updateProduct);
router.get('/filter/search', ProdCtrl.filterProducts);

module.exports = router;