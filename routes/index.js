const express = require('express');
const router = express.Router();

const userRoutes = require('./users.routes');
const emailsRoutes = require('./emails.routes');

router.use('/emails', emailsRoutes);
router.use('/users', userRoutes);

module.exports = router;   