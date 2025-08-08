// server/src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Database connection
const sequelize = require('./database/connection');

// Routes
const routes = require('./routes');
app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SLF One API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 SLF One Server running on port ${PORT}`);
  
  // Test database connection
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Run seeders
    const seedChecklistItems = require('./seeds/checklistTemplateSeeder');
    await seedChecklistItems();
    const seedUsers = require('./seeds/userSeeder');
    await seedUsers();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});

module.exports = app;