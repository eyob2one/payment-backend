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
      return res.status(400).json({ error: 'Amount exceeds maximum limit of 1,000,000 ETB' });
    }

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create payment order
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

    // Contract number validation
    if (!ContractNo || typeof ContractNo !== 'string' || ContractNo.length < 5) {
      return res.status(400).json({ 
        error: 'Valid contract number is required (minimum 5 characters)'
      });
    }

    // Generate unique order ID
    const orderId = `MANDATE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create recurring payment order
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

exports.applyH5Token = async (req, res) => {
  try {
    const { authToken } = req.body;
    
    // Validate auth token
    if (!authToken || typeof authToken !== 'string') {
      return res.status(400).json({ error: 'Valid auth token is required' });
    }

    const result = await telebirrService.applyH5Token(authToken);
    
    res.json({
      success: true,
      token: result.token
    });
  } catch (error) {
    handleError(res, error, 'apply H5 token');
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Validate order ID
    if (!orderId || typeof orderId !== 'string' || orderId.length < 10) {
      return res.status(400).json({ error: 'Valid order ID is required' });
    }

    // Verify payment with Telebirr
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

    // Update business registration status if payment was successful
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
        // Don't fail the entire notification - log error for manual follow-up
      }
    }
    
    // Always return success to payment provider
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Payment notification processing error:', error);
    // Still return success to prevent repeated notifications
    res.status(200).json({ success: true });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Validate order ID
    if (!orderId || typeof orderId !== 'string' || orderId.length < 10) {
      return res.status(400).json({ error: 'Valid order ID is required' });
    }

    // Check payment status from database
    const status = await businessService.getPaymentStatus(orderId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Payment record not found'
      });
    }

    res.json({
      success: true,
      status: status.paymentStatus,
      lastChecked: status.lastChecked,
      businessId: status.businessId
    });
  } catch (error) {
    handleError(res, error, 'check payment status');
  }
};