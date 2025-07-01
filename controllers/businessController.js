const businessService = require('../services/businessService');
const paymentService = require('../services/paymentService');
const { validationResult } = require('express-validator');

exports.registerBusiness = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract form data
    const businessData = {
      business_name: req.body.business_name,
      email: req.body.email,
      phone: req.body.phone,
      website: req.body.website,
      category: req.body.category,
      subcategory: req.body.subcategory,
      description: req.body.description,
      location: req.body.location,
      address: req.body.address,
      services: req.body.services,
      plan: req.body.plan,
      amount: req.body.amount || 0
    };

    // Set amount based on plan
    if (businessData.plan === 'Featured') {
      businessData.amount = 500;
    } else if (businessData.plan === 'Premium') {
      businessData.amount = 800;
    } else {
      businessData.amount = 0;
    }

    // Save business registration
    const registrationResult = await businessService.registerBusiness(businessData);
    const businessId = registrationResult.businessId;

    // Handle free plan
    if (businessData.plan === 'Free') {
      return res.json({ 
        success: true,
        message: "Registration successful! Your business is being processed."
      });
    }

    // Handle paid plans
    const title = `Business Registration - ${businessData.business_name}`;
    let paymentResult;
    
    if (businessData.plan === 'Featured') {
      paymentResult = await paymentService.createOrder(title, businessData.amount, businessId);
    } else if (businessData.plan === 'Premium') {
      paymentResult = await paymentService.createMandateOrder(title, businessData.amount, businessId);
    }

    // Update business with order ID
    await businessService.updateBusinessOrderId(businessId, paymentResult.orderId);

    res.json({
      paymentUrl: paymentResult.paymentUrl,
      businessId
    });
    
  } catch (error) {
    console.error('Business registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { businessId, status, transactionId } = req.body;
    
    // Update payment status
    await businessService.updatePaymentStatus(businessId, status, transactionId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get payment status
    const status = await businessService.getPaymentStatus(orderId);
    
    res.json(status);
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: error.message });
  }
};