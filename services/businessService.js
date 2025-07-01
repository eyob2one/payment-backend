const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const wordpressService = require('./wordpressService');
const fileService = require('./fileService');

class BusinessService {
  constructor() {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async createBusiness(businessData) {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .insert([{
          name: businessData.name,
          email: businessData.email,
          phone: businessData.phone,
          website: businessData.website,
          category: businessData.category,
          subcategory: businessData.subcategory,
          description: businessData.description,
          location: businessData.location,
          address: businessData.address,
          services: businessData.services,
          plan: businessData.plan,
          logo_url: businessData.logo_url,
          image_urls: businessData.image_urls,
          payment_status: businessData.payment_status || 'pending',
          payment_id: businessData.payment_id || null,
          status: 'pending_review'
        }])
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Error creating business:', error.message);
      throw new Error('Failed to create business record');
    }
  }

  async getBusinessById(id) {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting business:', error.message);
      throw new Error('Failed to retrieve business');
    }
  }

  async updateBusiness(id, updateData) {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating business:', error.message);
      throw new Error('Failed to update business');
    }
  }

  async updatePaymentStatus(businessId, status, paymentId) {
    try {
      const updateData = {
        payment_status: status,
        payment_id: paymentId,
        status: status === 'completed' ? 'active' : 'payment_failed'
      };
      
      const business = await this.updateBusiness(businessId, updateData);
      
      if (status === 'completed') {
        await wordpressService.createBusinessPost(business);
      }
      
      return business;
    } catch (error) {
      console.error('Error updating payment status:', error.message);
      throw new Error('Failed to update payment status');
    }
  }

  async processFileUploads(files) {
    try {
      const uploadResults = {
        logo_url: null,
        image_urls: []
      };
      
      if (files.logo) {
        uploadResults.logo_url = await fileService.uploadFile(files.logo[0]);
      }
      
      if (files.images) {
        uploadResults.image_urls = await Promise.all(
          files.images.map(file => fileService.uploadFile(file))
        );
      }
      
      return uploadResults;
    } catch (error) {
      console.error('Error processing file uploads:', error.message);
      throw new Error('Failed to process file uploads');
    }
  }
}

module.exports = new BusinessService();