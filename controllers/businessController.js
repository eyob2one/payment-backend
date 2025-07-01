const businessService = require('../services/businessService');
const { validationResult } = require('express-validator');

exports.createOrder = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, amount } = req.body;
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount specified' });
        }

        const result = await telebirrService.createOrder(title, amount);
        
        res.json({
            success: true,
            paymentUrl: result.paymentUrl,
            orderId: result.orderId
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to create payment order'
        });
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
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount specified' });
        }

        if (!ContractNo) {
            return res.status(400).json({ error: 'Contract number is required' });
        }

        const result = await telebirrService.createMandateOrder(title, amount, ContractNo);
        
        res.json({
            success: true,
            paymentUrl: result.paymentUrl,
            orderId: result.orderId
        });
    } catch (error) {
        console.error('Error creating mandate order:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to create mandate payment order'
        });
    }
};

exports.applyH5Token = async (req, res) => {
    try {
        const { authToken } = req.body;
        
        if (!authToken) {
            return res.status(400).json({ error: 'Auth token is required' });
        }

        const result = await telebirrService.applyH5Token(authToken);
        
        res.json({
            success: true,
            token: result.token
        });
    } catch (error) {
        console.error('Error applying H5 token:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to apply H5 token'
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const verificationResult = await telebirrService.verifyPayment(orderId);
        
        if (!verificationResult.verified) {
            return res.status(400).json({
                success: false,
                error: verificationResult.message || 'Payment verification failed'
            });
        }

        res.json({
            success: true,
            verified: true,
            paymentDetails: verificationResult.paymentDetails
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to verify payment'
        });
    }
};

exports.handlePaymentNotification = async (req, res) => {
    try {
        const paymentNotification = req.body;
        
        // Validate notification
        if (!paymentNotification.orderId || !paymentNotification.status) {
            return res.status(400).json({ error: 'Invalid payment notification' });
        }

        // Process payment notification
        const result = await telebirrService.processPaymentNotification(paymentNotification);
        
        if (result.success) {
            // Update business registration status if payment was successful
            if (paymentNotification.status === 'SUCCESS') {
                await businessService.updatePaymentStatus(
                    result.businessId, 
                    'completed',
                    paymentNotification.orderId
                );
            }
            
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ 
            success: false,
            error: result.error 
        });
    } catch (error) {
        console.error('Error handling payment notification:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to process payment notification'
        });
    }
};