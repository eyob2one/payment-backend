const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/config');

exports.createOrder = async (title, amount, businessId) => {
  try {
    // Generate unique reference ID
    const outTradeNo = `ORDER-${Date.now()}-${businessId}`;
    
    // Prepare request
    const requestData = {
      appId: config.telebirr.fabricAppId,
      appKey: config.telebirr.appSecret,
      subject: title,
      totalAmount: amount.toString(),
      outTradeNo,
      notifyUrl: `${process.env.BASE_URL}/api/payment/notify`,
      returnUrl: `${process.env.FRONTEND_URL}/payment-callback?businessId=${businessId}`,
      // Add other required parameters
    };

    // Generate signature
    const signature = crypto.createSign('RSA-SHA256')
      .update(JSON.stringify(requestData))
      .sign(config.telebirr.privateKey, 'base64');

    // Send to Telebirr
    const response = await axios.post(
      `${config.telebirr.baseUrl}/createOrder`,
      { ...requestData, sign: signature },
      { timeout: 10000 }
    );

    return {
      paymentUrl: response.data.paymentUrl,
      orderId: outTradeNo
    };
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw new Error('Failed to create payment order');
  }
};

exports.verifyPayment = async (orderId) => {
  // Simplified verification logic
  return { verified: true };
};