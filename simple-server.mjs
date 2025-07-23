import express from 'express';
import cors from 'cors';
import { fetchYouTubeTranscript } from './src/services/youtubeTranscript.mjs';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Transcript endpoint
app.post('/api/transcript', async (req, res) => {
  try {
    // Input validation
    if (!req.body?.videoId) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
        code: 'MISSING_VIDEO_ID'
      });
    }

    const { videoId, language = 'hi' } = req.body;
    
    try {
      // Get transcript
      const transcriptItems = await fetchYouTubeTranscript(videoId, language);
      
      // Format transcript
      const transcript = transcriptItems.map(item => item.text).join(' ');
      
      if (!transcript) {
        throw new Error('No transcript available');
      }
      
      return res.json({
        success: true,
        transcript,
        language
      });
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return res.status(404).json({
        success: false,
        error: 'Transcript not found',
        code: 'TRANSCRIPT_NOT_FOUND',
        details: error.message || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Unexpected error in transcript endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: error.message || 'Unknown error'
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or specify a different port.`);
  } else {
    console.error('Failed to start server:', error);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
