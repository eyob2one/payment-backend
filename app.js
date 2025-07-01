const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const config = require('./config/config');

// Create Express app
const app = express();

// Log configuration for debugging
console.log('Application starting...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', config.port);
console.log('Supabase URL:', config.supabaseUrl);
console.log('Frontend URL:', config.frontendUrl);

// FIXED: Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://techreviewethiopia.kesug.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check for subdomains
    if (allowedOrigins.some(allowed => origin.endsWith(new URL(allowed).hostname))) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked: ${origin} not in allowed list`);
    const msg = `The CORS policy for this site does not allow access from ${origin}`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser middleware with increased limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Test Supabase connection
supabase
  .from('businesses')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Connected to Supabase successfully. Sample business:', data[0]?.business_name || 'No businesses found');
    }
  });

// Routes
const businessRoutes = require('./routes/businessRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/business', businessRoutes);
app.use('/api/payment', paymentRoutes);

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    allowedOrigins,
    requestOrigin: req.headers.origin || 'No origin header'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS policy')) {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: err.message,
      allowedOrigins
    });
  }
  
  // Handle other errors
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong on our end' 
  });
});

const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`\n=== Server running on port ${PORT} ===`);
  console.log('Allowed origins:');
  allowedOrigins.forEach(origin => console.log(`  - ${origin}`));
  console.log('\nEndpoints:');
  console.log(`  - Health check: http://localhost:${PORT}/health`);
  console.log(`  - CORS test: http://localhost:${PORT}/cors-test`);
  console.log(`  - Business registration: http://localhost:${PORT}/api/business/register`);
  console.log(`  - Payment creation: http://localhost:${PORT}/api/payment/create-order\n`);
});