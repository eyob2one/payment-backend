const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const businessController = require('../controllers/businessController');

// Payment notification handler
router.post('/notify', async (req, res) => {
  try {
    const { outTradeNo, status, transactionId } = req.body;
    
    // Extract business ID from outTradeNo
    const businessId = outTradeNo.split('-')[2];
    
    // Update payment status
    await businessController.updatePaymentStatus({
      body: {
        businessId,
        status: status === 'SUCCESS' ? 'completed' : 'failed',
        transactionId
      }
    }, res);
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error processing notification');
  }
});

// Payment verification endpoint
router.get('/verify/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Check payment status in database
    const { data, error } = await supabase
      .from('businesses')
      .select('payment_status')
      .eq('id', businessId)
      .single();

    if (error) throw error;
    
    res.json({ status: data.payment_status || 'pending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;