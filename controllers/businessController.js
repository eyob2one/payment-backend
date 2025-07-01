const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const telebirrService = require('../services/telebirrService');

const supabase = createClient(config.supabase.url, config.supabase.key);

exports.registerBusiness = async (req, res) => {
  try {
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
      amount: req.body.amount || 0,
      payment_status: 'pending'
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select();

    if (error) throw new Error(error.message);
    
    const businessId = data[0].id;

    // Handle file uploads (simplified - in production, upload to cloud storage)
    if (req.files) {
      const logoFile = req.files['logo'] ? req.files['logo'][0] : null;
      const imageFiles = req.files['images[]'] || [];
      
      // In real app, upload to S3/Cloudinary and save URLs
      const updates = {
        logo_url: logoFile ? `uploads/${logoFile.filename}` : null,
        images_url: imageFiles.map(file => `uploads/${file.filename}`)
      };

      await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId);
    }

    // For free plan, return success
    if (businessData.plan === 'Free') {
      return res.json({ 
        success: true, 
        businessId,
        message: "Registration successful! Your business is being processed."
      });
    }

    // For paid plans, initiate payment
    const amount = businessData.plan === 'Featured' ? 500 : 800;
    const paymentResult = await telebirrService.createOrder(
      `Business Registration - ${businessData.business_name}`,
      amount,
      businessId
    );

    // Save payment record
    await supabase
      .from('payments')
      .insert([{
        business_id: businessId,
        amount: amount,
        status: 'pending',
        payment_url: paymentResult.paymentUrl,
        order_id: paymentResult.orderId
      }]);

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
    
    // Update business payment status
    const { error } = await supabase
      .from('businesses')
      .update({ 
        payment_status: status,
        payment_date: new Date(),
        transaction_id: transactionId
      })
      .eq('id', businessId);

    if (error) throw new Error(error.message);
    
    // Update payment record
    await supabase
      .from('payments')
      .update({ 
        status: status,
        updated_at: new Date()
      })
      .eq('business_id', businessId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(500).json({ error: error.message });
  }
};