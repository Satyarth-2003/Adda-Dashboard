#!/bin/bash

# Exit on error
set -e

# Install Node.js dependencies
npm install --legacy-peer-deps

# Install Netlify Function dependencies
cd netlify/functions
npm install --legacy-peer-deps
cd ../..

# Build the application
npm run build
