const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');

// Create regular payment order
router.post('/order', 
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('amount').isNumeric().withMessage('Valid amount is required')
    ],
    paymentController.createOrder
);

// Create mandate payment order
router.post('/mandate-order', 
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('amount').isNumeric().withMessage('Valid amount is required'),
        body('ContractNo').notEmpty().withMessage('Contract number is required')
    ],
    paymentController.createMandateOrder
);

// Apply H5 token
router.post('/h5token', 
    [
        body('authToken').notEmpty().withMessage('Auth token is required')
    ],
    paymentController.applyH5Token
);

// Verify payment
router.post('/verify', 
    [
        body('orderId').notEmpty().withMessage('Order ID is required')
    ],
    paymentController.verifyPayment
);

// Payment notification handler
router.post('/notify', paymentController.handlePaymentNotification);

module.exports = router;