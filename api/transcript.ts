import { Router, Request, Response } from 'express';
import { getFormattedTranscript } from '../src/services/youtubeCaptions.js';

const router = Router();

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

    const { videoId, language = 'en' } = req.body;
    
    try {
      // Get transcript using YouTube Data API
      const transcript = await getFormattedTranscript(videoId, language);
      
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
