const telebirrService = require('../services/telebirrService');
const businessService = require('../services/businessService');
const { validationResult } = require('express-validator');

// Unified error response handler
const handleError = (res, error, context) => {
  console.error(`[${new Date().toISOString()}] ${context} Error:`, error);
  return res.status(500).json({ 
    success: false,
    error: error.message || `Failed to ${context}`
  });
};

exports.createOrder = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, amount } = req.body;
    
    // Enhanced amount validation
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }
    if (amountValue <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }
    if (amountValue > 1000000) {
      return res.status(400).json({ error: 'Amount exceeds maximum limit' });
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const result = await telebirrService.createOrder(title, amountValue, orderId);
    
    res.json({
      success: true,
      paymentUrl: result.paymentUrl,
      orderId: result.orderId
    });
  } catch (error) {
    handleError(res, error, 'create payment order');
  }
};

exports.createMandateOrder = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, amount, ContractNo } = req.body;
    
    // Enhanced amount validation
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }
    if (amountValue <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    if (!ContractNo || typeof ContractNo !== 'string' || ContractNo.length < 5) {
      return res.status(400).json({ 
        error: 'Valid contract number is required (min 5 characters)'
      });
    }

    // Generate unique order ID
    const orderId = `MANDATE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const result = await telebirrService.createMandateOrder(
      title, 
      amountValue, 
      ContractNo,
      orderId
    );
    
    res.json({
      success: true,
      paymentUrl: result.paymentUrl,
      orderId: result.orderId,
      contractNo: ContractNo
    });
  } catch (error) {
    handleError(res, error, 'create mandate payment order');
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId || typeof orderId !== 'string' || orderId.length < 10) {
      return res.status(400).json({ error: 'Valid order ID is required' });
    }

    const verificationResult = await telebirrService.verifyPayment(orderId);
    
    if (!verificationResult.verified) {
      return res.status(400).json({
        success: false,
        error: verificationResult.message || 'Payment verification failed',
        details: verificationResult.details
      });
    }

    res.json({
      success: true,
      verified: true,
      paymentDetails: verificationResult.paymentDetails
    });
  } catch (error) {
    handleError(res, error, 'verify payment');
  }
};

exports.handlePaymentNotification = async (req, res) => {
  try {
    const paymentNotification = req.body;
    
    // Enhanced notification validation
    if (!paymentNotification.orderId || 
        typeof paymentNotification.orderId !== 'string' ||
        !paymentNotification.status ||
        !['SUCCESS', 'FAILED', 'PENDING'].includes(paymentNotification.status)) {
      console.warn('Invalid payment notification:', paymentNotification);
      return res.status(400).json({ error: 'Invalid payment notification format' });
    }

    // Process payment notification
    const result = await telebirrService.processPaymentNotification(paymentNotification);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false,
        error: result.error 
      });
    }

    // Update business registration status
    if (paymentNotification.status === 'SUCCESS') {
      try {
        await businessService.updatePaymentStatus(
          result.businessId, 
          'completed',
          paymentNotification.orderId,
          paymentNotification.transactionId
        );
        
        // Send confirmation email
        await businessService.sendConfirmationEmail(result.businessId);
      } catch (updateError) {
        console.error('Error updating business status:', updateError);
        // Don't fail the notification - we'll retry later
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    handleError(res, error, 'process payment notification');
  }
};

// New endpoint for payment status check
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'Valid order ID is required' });
    }

    const status = await businessService.getPaymentStatus(orderId);
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    handleError(res, error, 'check payment status');
  }
};