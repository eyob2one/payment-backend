function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: err.message
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: err.message,
      details: err.errors
    });
  }
  
  // Default error handling
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}

module.exports = {
  errorHandler
};