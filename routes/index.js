const express = require('express');
const router = express.Router();

const userRoutes = require('./users.routes');
const emailsRoutes = require('./emails.routes');
const productsRoutes = require('./products.routes');

router.use('/emails', emailsRoutes);
router.use('/users', userRoutes);
router.use('/products', productsRoutes);

module.exports = router;   