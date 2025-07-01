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
      plan: req.body.plan,
      // Add other fields
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select();

    if (error) throw new Error(error.message);

    // For free plan, return success
    if (businessData.plan === 'Free') {
      return res.json({ success: true, businessId: data[0].id });
    }

    // For paid plans, initiate payment
    const amount = businessData.plan === 'Featured' ? 500 : 800;
    const paymentResult = await telebirrService.createOrder(
      `Business Registration - ${businessData.business_name}`,
      amount,
      data[0].id // business ID as reference
    );

    res.json({
      paymentUrl: paymentResult.paymentUrl,
      businessId: data[0].id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { businessId, status, transactionId } = req.body;
    
    // Update payment status in Supabase
    const { error } = await supabase
      .from('businesses')
      .update({ 
        payment_status: status,
        payment_date: new Date(),
        transaction_id: transactionId
      })
      .eq('id', businessId);

    if (error) throw new Error(error.message);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};