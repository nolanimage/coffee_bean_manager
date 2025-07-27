const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const coffeeRoutes = require('./routes/coffee');
const tastingRoutes = require('./routes/tasting');
const inventoryRoutes = require('./routes/inventory');
const brewingRoutes = require('./routes/brewing');
const costRoutes = require('./routes/cost');
const brewingLogRoutes = require('./routes/brewing-log');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coffee', coffeeRoutes);
app.use('/api/tasting', tastingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/brewing', brewingRoutes);
app.use('/api/cost', costRoutes);
app.use('/api/brewing-log', brewingLogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Coffee Bean API is running with authentication!' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Coffee Bean API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Authentication enabled`);
  console.log(`🗄️  Connected to Supabase database`);
}); 