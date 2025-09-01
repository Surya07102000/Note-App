const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const roleRoutes = require('./routes/roleRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: config.nodeEnv === 'development' ? err : {}
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Try different ports if the default one is busy
    const ports = [5000, 5001, 5002, 5003, 5004];
    let server;

    for (const port of ports) {
      try {
        server = await new Promise((resolve, reject) => {
          const s = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log(`API available at http://localhost:${port}/api`);
            resolve(s);
          });

          s.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
              console.log(`Port ${port} is busy, trying next port...`);
              s.close();
              resolve(null);
            } else {
              reject(error);
            }
          });
        });

        if (server) break;
      } catch (error) {
        console.error(`Failed to start server on port ${port}:`, error);
        if (port === ports[ports.length - 1]) {
          console.error('All ports are busy. Please try again later.');
          process.exit(1);
        }
      }
    }

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
