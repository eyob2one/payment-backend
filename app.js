const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const config = require('./config/config');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: config.allowedOrigins
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Supabase Client
const supabase = createClient(config.supabase.url, config.supabase.key);

// Test Supabase connection
supabase
  .from('businesses')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Connected to Supabase successfully');
    }
  });

// Routes
const businessRoutes = require('./routes/businessRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/business', businessRoutes);
app.use('/api/payment', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});