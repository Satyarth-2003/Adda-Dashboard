import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Proxy requests to the Python backend
router.post('/', async (req: Request, res: Response) => {
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
      // Forward the request to the Python backend
      const response = await fetch('http://localhost:5001/yt_transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId, language }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }
      
      return res.json({
        success: true,
        transcript: data.transcript,
        language: data.language || language
      });
    } catch (error) {
      console.error('Error fetching transcript from Python backend:', error);
      return res.status(404).json({
        success: false,
        error: 'Transcript not found',
        code: 'TRANSCRIPT_NOT_FOUND',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Unexpected error in transcript endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
