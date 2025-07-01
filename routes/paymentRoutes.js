const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePaymentOrder } = require('../middleware/validationMiddleware');

// Create regular payment order
router.post(
  '/create-order', 
  validatePaymentOrder,
  paymentController.createOrder
);

// Create recurring payment order
router.post(
  '/create-mandate-order', 
  validatePaymentOrder,
  paymentController.createMandateOrder
);

// Verify payment
router.post(
  '/verify',
  paymentController.verifyPayment
);

// Payment notification handler
router.post(
  '/notify',
  paymentController.handlePaymentNotification
);

module.exports = router;