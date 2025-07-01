const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const controllers = require('../controllers');

// Payment Routes
router.post('/create/order', 
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('amount').isNumeric().withMessage('Valid amount is required')
    ],
    controllers.createOrder
);

router.post('/create/mandetOrder', 
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('amount').isNumeric().withMessage('Valid amount is required'),
        body('ContractNo').notEmpty().withMessage('Contract number is required')
    ],
    controllers.createMandateOrder
);

router.post('/apply/h5token', 
    [
        body('authToken').notEmpty().withMessage('Auth token is required')
    ],
    controllers.applyH5Token
);

router.post('/payment/verify', 
    [
        body('orderId').notEmpty().withMessage('Order ID is required')
    ],
    controllers.verifyPayment
);

router.post('/payment/notify', controllers.handlePaymentNotification);

// Business Routes
router.post('/business/register', 
    [
        body('business_name').notEmpty().withMessage('Business name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('phone').matches(/^\+251\d{9}$/).withMessage('Valid Ethiopian phone number required'),
        body('category').notEmpty().withMessage('Category is required'),
        body('subcategory').notEmpty().withMessage('Subcategory is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('location').notEmpty().withMessage('Location is required'),
        body('address').notEmpty().withMessage('Address is required'),
        body('services').notEmpty().withMessage('Services are required'),
        body('plan').isIn(['Free', 'Featured', 'Premium']).withMessage('Valid plan is required')
    ],
    controllers.registerBusiness
);

router.get('/business/:id', 
    [
        param('id').notEmpty().withMessage('Business ID is required')
    ],
    controllers.getBusiness
);

router.put('/business/:id', 
    [
        param('id').notEmpty().withMessage('Business ID is required')
    ],
    controllers.updateBusiness
);

router.put('/business/:businessId/payment', 
    [
        param('businessId').notEmpty().withMessage('Business ID is required'),
        body('status').isIn(['pending', 'completed', 'failed']).withMessage('Valid status is required'),
        body('paymentId').notEmpty().withMessage('Payment ID is required')
    ],
    controllers.updatePaymentStatus
);

module.exports = router;