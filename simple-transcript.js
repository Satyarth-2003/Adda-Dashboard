const express = require('express');
const cors = require('cors');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/transcript', async (req, res) => {
  try {
    const { videoId, language = 'hi' } = req.body;
    
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
        code: 'MISSING_VIDEO_ID'
      });
    }

    console.log(`Fetching transcript for video: ${videoId} in ${language}`);
    
    try {
      // Try with the specified language first
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: language });
      console.log('Transcript found in language:', language);
      return res.json({
        success: true,
        transcript: transcript.map(item => item.text).join(' '),
        language
      });
    } catch (firstError) {
      console.log(`Failed to fetch ${language} transcript, trying English...`);
      
      if (language !== 'en') {
        try {
          // Try with English as fallback
          const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
          console.log('Transcript found in English');
          return res.json({
            success: true,
            transcript: transcript.map(item => item.text).join(' '),
            language: 'en'
          });
        } catch (secondError) {
          console.log('Failed to fetch English transcript, trying any available...');
          
          try {
            // Try with any available language
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            console.log('Transcript found in available language');
            return res.json({
              success: true,
              transcript: transcript.map(item => item.text).join(' '),
              language: 'auto'
            });
          } catch (finalError) {
            console.error('All transcript fetch attempts failed');
            throw new Error('No transcript available for this video');
          }
        }
      } else {
        throw firstError;
      }
    }
  } catch (error) {
    console.error('Error in transcript endpoint:', error);
    return res.status(404).json({
      success: false,
      error: 'Transcript not found',
      code: 'TRANSCRIPT_NOT_FOUND',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
