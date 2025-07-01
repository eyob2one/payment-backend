const axios = require('axios');
const config = require('../config/config');

class WordPressService {
  constructor() {
    this.baseUrl = config.wordpress.url;
    this.apiKey = config.wordpress.apiKey;
  }

  async createBusinessPost(businessData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/wp-json/business-registration/v1/register`,
        {
          title: businessData.name,
          content: businessData.description,
          meta: {
            business_email: businessData.email,
            business_phone: businessData.phone,
            business_category: businessData.category,
            business_subcategory: businessData.subcategory,
            business_location: businessData.location,
            business_address: businessData.address,
            business_services: businessData.services,
            business_plan: businessData.plan,
            business_logo: businessData.logo_url,
            business_images: businessData.image_urls,
            payment_status: businessData.payment_status,
            payment_id: businessData.payment_id
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating WordPress post:', error.message);
      throw new Error('Failed to create WordPress business post');
    }
  }

  async updateBusinessPost(businessId, businessData) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/wp-json/business-registration/v1/update/${businessId}`,
        {
          meta: {
            payment_status: businessData.payment_status,
            status: businessData.status
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating WordPress post:', error.message);
      throw new Error('Failed to update WordPress business post');
    }
  }
}

module.exports = new WordPressService();