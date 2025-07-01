const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
// FIXED: Update import path to match actual filename
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

// Apply H5 token
router.post(
  '/apply-h5-token',
  paymentController.applyH5Token
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

// Payment status check
router.get(
  '/check-status/:orderId',
  paymentController.checkPaymentStatus
);

module.exports = router;