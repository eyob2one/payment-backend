const mongoose = require('mongoose');
const BusinessRegistration = require('../models/BusinessRegistration');
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPassword
  }
});

exports.registerBusiness = async (businessData) => {
  try {
    // Create new business registration
    const newBusiness = new BusinessRegistration({
      ...businessData,
      registrationDate: new Date(),
      paymentStatus: 'pending'
    });

    // Save to database
    const savedBusiness = await newBusiness.save();
    
    return {
      success: true,
      businessId: savedBusiness._id,
      business: savedBusiness
    };
  } catch (error) {
    console.error('Business registration error:', error);
    throw new Error('Failed to register business');
  }
};

exports.updatePaymentStatus = async (businessId, status, orderId, transactionId = null) => {
  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updateData = {
      paymentStatus: status,
      paymentDate: status === 'completed' ? new Date() : null,
      orderId,
      transactionId,
      lastChecked: new Date()
    };

    // Update business registration
    const updatedBusiness = await BusinessRegistration.findByIdAndUpdate(
      businessId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      throw new Error('Business record not found');
    }

    return {
      success: true,
      business: updatedBusiness
    };
  } catch (error) {
    console.error('Update payment status error:', error);
    throw new Error(`Failed to update payment status: ${error.message}`);
  }
};

exports.sendConfirmationEmail = async (businessId) => {
  try {
    // Get business details
    const business = await BusinessRegistration.findById(businessId);
    if (!business) {
      throw new Error('Business record not found');
    }

    // Email content
    const mailOptions = {
      from: `"Business Directory" <${config.emailUser}>`,
      to: business.email,
      subject: 'Business Registration Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0046ad;">Registration Successful!</h2>
          <p>Dear ${business.businessName},</p>
          <p>Your business registration with our directory is now complete.</p>
          
          <h3>Registration Details</h3>
          <ul>
            <li><strong>Business Name:</strong> ${business.businessName}</li>
            <li><strong>Registration Date:</strong> ${business.registrationDate.toDateString()}</li>
            <li><strong>Plan:</strong> ${business.plan}</li>
            <li><strong>Payment Status:</strong> <span style="color: ${business.paymentStatus === 'completed' ? 'green' : 'orange'}">${business.paymentStatus}</span></li>
          </ul>
          
          <p>You can now manage your listing through our partner portal.</p>
          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            This is an automated message - please do not reply directly to this email.
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${business.email}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
};

exports.getPaymentStatus = async (orderId) => {
  try {
    // Find business by order ID
    const business = await BusinessRegistration.findOne({ orderId });
    
    if (!business) {
      return {
        success: false,
        error: 'No business found with that order ID'
      };
    }

    return {
      success: true,
      status: business.paymentStatus,
      businessId: business._id,
      lastChecked: business.lastChecked || null,
      transactionId: business.transactionId || null,
      businessName: business.businessName
    };
  } catch (error) {
    console.error('Get payment status error:', error);
    throw new Error(`Failed to retrieve payment status: ${error.message}`);
  }
};

// Additional helper methods

exports.getBusinessById = async (businessId) => {
  try {
    const business = await BusinessRegistration.findById(businessId);
    if (!business) throw new Error('Business not found');
    return business;
  } catch (error) {
    console.error('Get business by ID error:', error);
    throw new Error('Failed to retrieve business details');
  }
};

exports.updateBusinessImages = async (businessId, logoPath, imagePaths) => {
  try {
    const updatedBusiness = await BusinessRegistration.findByIdAndUpdate(
      businessId,
      {
        logo: logoPath,
        images: imagePaths
      },
      { new: true }
    );
    
    return updatedBusiness;
  } catch (error) {
    console.error('Update business images error:', error);
    throw new Error('Failed to update business images');
  }
};

exports.getAllBusinesses = async () => {
  try {
    return await BusinessRegistration.find({}).sort({ registrationDate: -1 });
  } catch (error) {
    console.error('Get all businesses error:', error);
    throw new Error('Failed to retrieve businesses');
  }
};