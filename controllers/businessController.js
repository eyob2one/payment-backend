const businessService = require('../services/businessService');
const { validationResult } = require('express-validator');
// Add at the top of businessController.js
const fileService = require('../services/fileService');
const supabase = fileService.supabase; // Access the Supabase client from fileService

exports.registerBusiness = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract form data
        const businessData = {
            name: req.body.business_name,
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
            payment_status: req.body.payment_status || 'pending',
            payment_id: req.body.payment_id || null
        };

        // Handle file uploads
        if (req.files) {
            if (req.files.logo) {
                businessData.logo_url = await businessService.uploadFile(req.files.logo[0]);
            }
            
            if (req.files.images) {
                businessData.image_urls = await Promise.all(
                    req.files.images.map(file => businessService.uploadFile(file))
                );
            }
        }

        // Save to database
        const business = await businessService.createBusiness(businessData);
        
        // If this is a paid registration, we might need to send to WordPress
        if (businessData.plan !== 'Free') {
            await businessService.sendToWordPress(business);
        }

        res.status(201).json({
            success: true,
            businessId: business.id,
            message: 'Business registration successful'
        });
    } catch (error) {
        console.error('Error registering business:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to register business'
        });
    }
};

exports.getBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        
        const business = await businessService.getBusinessById(id);
        
        if (!business) {
            return res.status(404).json({ 
                success: false,
                error: 'Business not found' 
            });
        }

        res.json({
            success: true,
            business
        });
    } catch (error) {
        console.error('Error getting business:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to get business details'
        });
    }
};

exports.updateBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updatedBusiness = await businessService.updateBusiness(id, updateData);
        
        res.json({
            success: true,
            business: updatedBusiness
        });
    } catch (error) {
        console.error('Error updating business:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to update business'
        });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { businessId } = req.params;
        const { status, paymentId } = req.body;
        
        if (!status || !paymentId) {
            return res.status(400).json({ 
                success: false,
                error: 'Status and payment ID are required' 
            });
        }

        const updatedBusiness = await businessService.updatePaymentStatus(
            businessId, 
            status, 
            paymentId
        );
        
        // If payment is completed, send to WordPress
        if (status === 'completed') {
            await businessService.sendToWordPress(updatedBusiness);
        }

        res.json({
            success: true,
            business: updatedBusiness
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to update payment status'
        });
    }
};