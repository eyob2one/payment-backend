const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { validateBusinessRegistration } = require('../middleware/validation');

// POST register new business
router.post(
  '/register', 
  validateBusinessRegistration, 
  businessController.registerBusiness
);

// Add other routes as needed
module.exports = router;