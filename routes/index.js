const express = require('express');
const router = express.Router();
const apiRoutes = require('./api');
const paymentRoutes = require('./paymentRoutes');
const businessRoutes = require('./businessRoutes');

// API Routes
router.use('/api', apiRoutes);

// Payment Routes
router.use('/api/payment', paymentRoutes);

// Business Routes
router.use('/api/business', businessRoutes);

module.exports = router;