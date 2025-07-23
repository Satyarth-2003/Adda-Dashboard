const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const serverless = require('serverless-http');
const path = require('path');

const app = express();

// Import your server configuration
require('dotenv').config();

// Body parser middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API Routes
const analyzeRouter = require('../../../../api/analyze');
const transcriptRouter = require('../../../../api/transcript');

app.use('/.netlify/functions/server/api/analyze', analyzeRouter);
app.use('/.netlify/functions/server/api/transcript', transcriptRouter);

// Health check endpoint
app.get('/.netlify/functions/server/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Export the serverless function
exports.handler = serverless(app);
