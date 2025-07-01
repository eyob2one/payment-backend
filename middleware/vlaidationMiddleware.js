const { check, validationResult } = require('express-validator');

exports.validatePaymentOrder = [
  check('title').notEmpty().withMessage('Title is required'),
  check('amount').isFloat({ gt: 0 }).withMessage('Valid amount is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateBusinessRegistration = [
  check('business_name').notEmpty().withMessage('Business name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('phone').isMobilePhone().withMessage('Valid phone number is required'),
  check('category').notEmpty().withMessage('Category is required'),
  check('subcategory').notEmpty().withMessage('Subcategory is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('plan').isIn(['Free', 'Featured', 'Premium']).withMessage('Invalid plan selected'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];