const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const path = require('path');
const fs = require('fs').promises;

class FileService {
  constructor() {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.bucketName = 'business-uploads';
  }

  async uploadFile(file) {
    try {
      // Read file content
      const fileContent = await fs.readFile(file.path);
      
      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}${fileExt}`;
      const filePath = `business-${Date.now()}/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileContent, {
          contentType: file.mimetype,
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      // Delete temporary file
      await fs.unlink(file.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(fileUrl) {
    try {
      const filePath = fileUrl.split(`${this.bucketName}/`)[1];
      
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new Error('Failed to delete file');
    }
  }
}

module.exports = new FileService();