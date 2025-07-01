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

exports.validateMandateOrder = [
  check('title').trim().notEmpty().withMessage('Payment title is required'),
  check('amount').isFloat({ gt: 0 }).withMessage('Valid payment amount is required'),
  check('ContractNo').isString().isLength({ min: 5 }).withMessage('Valid contract number required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];