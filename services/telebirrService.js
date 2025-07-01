const axios = require('axios');
const config = require('../config/config');
const tools = require('../utils/tools');

class TelebirrService {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.fabricAppId = config.fabricAppId;
    this.appSecret = config.appSecret;
    this.merchantAppId = config.merchantAppId;
    this.merchantCode = config.merchantCode;
  }

  async applyFabricToken() {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payment/v1/token`,
        { appSecret: this.appSecret },
        {
          headers: {
            "Content-Type": "application/json",
            "X-APP-Key": this.fabricAppId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error applying fabric token:', error.message);
      throw new Error('Failed to obtain fabric token');
    }
  }

  async createOrder(title, amount) {
    try {
      const fabricToken = await this.applyFabricToken();
      
      const reqObject = {
        timestamp: tools.createTimeStamp(),
        nonce_str: tools.createNonceStr(),
        method: "payment.preorder",
        version: "1.0",
        biz_content: {
          notify_url: `${config.baseUrl}/api/v1/notify`,
          trade_type: "InApp",
          appid: this.merchantAppId,
          merch_code: this.merchantCode,
          merch_order_id: this.createMerchantOrderId(),
          title: title,
          total_amount: amount.toString(),
          trans_currency: "ETB",
          timeout_express: "120m",
          payee_identifier: this.merchantCode,
          payee_identifier_type: "04",
          payee_type: "5000",
          redirect_url: `${config.baseUrl}/api/v1/notify`,
        }
      };
      
      reqObject.sign = tools.signRequestObject(reqObject);
      reqObject.sign_type = "SHA256WithRSA";
      
      const response = await axios.post(
        `${this.baseUrl}/payment/v1/merchant/preOrder`,
        reqObject,
        {
          headers: {
            "Content-Type": "application/json",
            "X-APP-Key": this.fabricAppId,
            Authorization: fabricToken.token,
          },
        }
      );
      
      const prepayId = response.data.biz_content.prepay_id;
      return {
        paymentUrl: this.createPaymentUrl(prepayId),
        orderId: reqObject.biz_content.merch_order_id
      };
    } catch (error) {
      console.error('Error creating order:', error.message);
      throw new Error('Failed to create payment order');
    }
  }

  async createMandateOrder(title, amount, contractNo) {
    try {
      const fabricToken = await this.applyFabricToken();
      
      const reqObject = {
        timestamp: tools.createTimeStamp(),
        nonce_str: tools.createNonceStr(),
        method: "payment.preorder",
        version: "1.0",
        biz_content: {
          notify_url: `${config.baseUrl}/api/v1/notify`,
          trade_type: "InApp",
          appid: this.merchantAppId,
          merch_code: this.merchantCode,
          merch_order_id: this.createMerchantOrderId(),
          title: title,
          total_amount: amount.toString(),
          trans_currency: "ETB",
          timeout_express: "120m",
          payee_identifier: this.merchantCode,
          payee_identifier_type: "04",
          payee_type: "5000",
          mandate_data: {
            mctContractNo: contractNo,
            mandateTemplateId: "103001",
            executeTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          redirect_url: `${config.baseUrl}/api/v1/notify`,
        }
      };
      
      reqObject.sign = tools.signRequestObject(reqObject);
      reqObject.sign_type = "SHA256WithRSA";
      
      const response = await axios.post(
        `${this.baseUrl}/payment/v1/merchant/preOrder`,
        reqObject,
        {
          headers: {
            "Content-Type": "application/json",
            "X-APP-Key": this.fabricAppId,
            Authorization: fabricToken.token,
          },
        }
      );
      
      const prepayId = response.data.biz_content.prepay_id;
      return {
        paymentUrl: this.createPaymentUrl(prepayId),
        orderId: reqObject.biz_content.merch_order_id,
        contractNo: contractNo
      };
    } catch (error) {
      console.error('Error creating mandate order:', error.message);
      throw new Error('Failed to create mandate payment order');
    }
  }

  async verifyPayment(orderId) {
    try {
      const fabricToken = await this.applyFabricToken();
      
      const reqObject = {
        timestamp: tools.createTimeStamp(),
        nonce_str: tools.createNonceStr(),
        method: "payment.query",
        version: "1.0",
        biz_content: {
          appid: this.merchantAppId,
          merch_code: this.merchantCode,
          merch_order_id: orderId
        }
      };
      
      reqObject.sign = tools.signRequestObject(reqObject);
      reqObject.sign_type = "SHA256WithRSA";
      
      const response = await axios.post(
        `${this.baseUrl}/payment/v1/merchant/query`,
        reqObject,
        {
          headers: {
            "Content-Type": "application/json",
            "X-APP-Key": this.fabricAppId,
            Authorization: fabricToken.token,
          },
        }
      );
      
      return {
        verified: response.data.biz_content.trade_state === 'SUCCESS',
        paymentDetails: response.data.biz_content
      };
    } catch (error) {
      console.error('Error verifying payment:', error.message);
      throw new Error('Failed to verify payment');
    }
  }

  createPaymentUrl(prepayId) {
    const map = {
      appid: this.merchantAppId,
      merch_code: this.merchantCode,
      nonce_str: tools.createNonceStr(),
      prepay_id: prepayId,
      timestamp: tools.createTimeStamp(),
    };
    
    const sign = tools.signRequestObject(map);
    
    return `${this.baseUrl}/payment/v1/merchant/preOrder?${[
      `appid=${map.appid}`,
      `merch_code=${map.merch_code}`,
      `nonce_str=${map.nonce_str}`,
      `prepay_id=${map.prepay_id}`,
      `timestamp=${map.timestamp}`,
      `sign=${sign}`,
      `sign_type=SHA256WithRSA`,
    ].join('&')}`;
  }

  createMerchantOrderId() {
    return Date.now().toString();
  }
}

module.exports = new TelebirrService();