const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const businessController = require('../controllers/businessController');
const upload = require('../middleware/uploadMiddleware');

// Register new business
router.post('/register', 
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'images', maxCount: 6 }
    ]),
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
    businessController.registerBusiness
);

// Get business details
router.get('/:id', 
    [
        param('id').notEmpty().withMessage('Business ID is required')
    ],
    businessController.getBusiness
);

// Update business details
router.put('/:id', 
    [
        param('id').notEmpty().withMessage('Business ID is required')
    ],
    businessController.updateBusiness
);

// Update payment status
router.put('/:businessId/payment', 
    [
        param('businessId').notEmpty().withMessage('Business ID is required'),
        body('status').isIn(['pending', 'completed', 'failed']).withMessage('Valid status is required'),
        body('paymentId').notEmpty().withMessage('Payment ID is required')
    ],
    businessController.updatePaymentStatus
);

module.exports = router;