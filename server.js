// Express server to serve React app and Gemini analysis API
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import analyzeRouter from './api/analyze.js';
import transcriptRouter from './api/transcript.js';

const app = express();
// Try ports 8080, 8090, 8091
const PORTS = [8080, 8090, 8091];
let serverInstance;
function startServer(ports) {
  if (!ports.length) {
    console.error('No available ports');
    process.exit(1);
  }
  const port = ports[0];
  serverInstance = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying next...`);
      startServer(ports.slice(1));
    } else {
      throw err;
    }
  });
}

// Parse JSON bodies
app.use(bodyParser.json({ limit: '2mb' }));

// Mount Gemini analysis API
app.use('/api/analyze', analyzeRouter);
// Mount transcript proxy API
app.use('/api/transcript', transcriptRouter);

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React build (if built)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

startServer(PORTS);
