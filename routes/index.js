const express = require('express');
const router = express.Router();

const userRoutes = require('./users.routes');
const emailsRoutes = require('./emails.routes');
const productsRoutes = require('./products.routes');
const salesRoutes = require('./sales.routes');

router.use('/emails', emailsRoutes);
router.use('/users', userRoutes);
router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);

module.exports = router;   