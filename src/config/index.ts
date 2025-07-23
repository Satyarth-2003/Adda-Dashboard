import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  
  // API Keys
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  },
  
  supadata: {
    apiToken: process.env.SUPADATA_API_TOKEN || '687f43bccb143bbe6b13ce6a', // Default to existing token
    apiUrl: 'https://api.supadata.ai/youtube-transcript-api/transcript',
  },
  
  // External services
  pythonApi: {
    url: process.env.PYTHON_API_URL || 'http://localhost:6969',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Caching
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
  },
  
  // Retry configuration
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    initialDelay: 1000, // 1 second
    maxDelay: 5000, // 5 seconds
  },
};

// Validate required configurations
const requiredConfigs = [
  { key: 'GEMINI_API_KEY', value: config.gemini.apiKey },
  { key: 'SUPADATA_API_TOKEN', value: config.supadata.apiToken },
];

for (const { key, value } of requiredConfigs) {
  if (!value) {
    console.warn(`⚠️  WARNING: ${key} is not set in environment variables`);
  }
}

export default config;
