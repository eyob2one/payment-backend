const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
// FIXED: Update import path to match actual filename
const { validateBusinessRegistration } = require('../middleware/validationMiddleware');

// POST register new business
router.post(
  '/register', 
  validateBusinessRegistration, 
  businessController.registerBusiness
);

module.exports = router;