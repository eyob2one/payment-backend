const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { validateBusinessRegistration } = require('../middleware/validationMiddleware');

// POST register new business
router.post(
  '/register', 
  validateBusinessRegistration,
  businessController.registerBusiness
);

// PUT update payment status
router.put(
  '/payment-status',
  businessController.updatePaymentStatus
);

// GET payment status
router.get(
  '/payment-status/:orderId',
  businessController.getPaymentStatus
);

module.exports = router;