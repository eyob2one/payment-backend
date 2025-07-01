const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

exports.registerBusiness = async (businessData) => {
  try {
    // Prepare business data
    const businessRecord = {
      business_name: businessData.business_name,
      email: businessData.email,
      phone: businessData.phone,
      website: businessData.website || null,
      category: businessData.category,
      subcategory: businessData.subcategory,
      description: businessData.description,
      location: businessData.location,
      address: businessData.address,
      services: businessData.services,
      plan: businessData.plan,
      amount: businessData.amount || 0,
      payment_status: 'pending'
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('business_registrations')
      .insert([businessRecord])
        
    if (error) throw new Error(error.message);
    
    return {
      success: true,
      businessId: data[0].id,
      business: data[0]
    };
  } catch (error) {
    console.error('Business registration error:', error);
    throw new Error('Failed to register business: ' + error.message);
  }
};

exports.updatePaymentStatus = async (businessId, status, transactionId = null) => {
  try {
    const updateData = {
      payment_status: status,
      payment_date: status === 'completed' ? new Date().toISOString() : null,
      transaction_id: transactionId
    };

    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId)
      .select();

    if (error) throw new Error(error.message);
    
    return {
      success: true,
      business: data[0]
    };
  } catch (error) {
    console.error('Update payment status error:', error);
    throw new Error('Failed to update payment status: ' + error.message);
  }
};

exports.getBusinessById = async (businessId) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Get business by ID error:', error);
    throw new Error('Failed to retrieve business details');
  }
};

exports.getPaymentStatus = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('payment_status, business_name, email')
      .eq('order_id', orderId)
      .single();

    if (error) throw new Error(error.message);
    
    return {
      success: true,
      status: data.payment_status,
      businessName: data.business_name,
      email: data.email
    };
  } catch (error) {
    console.error('Get payment status error:', error);
    throw new Error('Failed to retrieve payment status');
  }
};

// Additional helper functions
exports.updateBusinessOrderId = async (businessId, orderId) => {
  try {
    const { error } = await supabase
      .from('businesses')
      .update({ order_id: orderId })
      .eq('id', businessId);

    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error('Update order ID error:', error);
    return false;
  }
};

exports.getBusinessByOrderId = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Get business by order ID error:', error);
    return null;
  }
};