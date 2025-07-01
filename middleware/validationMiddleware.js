const { check, validationResult } = require('express-validator');

exports.validatePaymentOrder = [
  check('title').trim().notEmpty().withMessage('Payment title is required'),
  check('amount').isFloat({ gt: 0 }).withMessage('Valid payment amount is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateBusinessRegistration = [
  check('business_name').trim().notEmpty().withMessage('Business name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('phone').isMobilePhone().withMessage('Valid phone number is required'),
  check('category').notEmpty().withMessage('Category is required'),
  check('subcategory').notEmpty().withMessage('Subcategory is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('location').notEmpty().withMessage('Location is required'),
  check('address').notEmpty().withMessage('Address is required'),
  check('services').notEmpty().withMessage('Services are required'),
  check('plan').isIn(['Free', 'Featured', 'Premium']).withMessage('Invalid plan selected'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];