import { Request, Response, Router } from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';
import config from '../src/config/index.js';
import { Cache } from '../src/utils/helpers.js';

const router = Router();
const ANALYSIS_CACHE = new Cache<any>(config.cache.ttl);

interface AnalysisResult {
  finalVerdict: {
    clarityOfContent: number;
    emotionalImpact: number;
    videoStructure: number;
    retentionPower: number;
    commercialBalance: number;
  };
  videoSummary: {
    overview: string;
    positivePoints: string[];
    negativePoints: string[];
    suggestions: string[];
  };
}

/**
 * Builds the prompt for Gemini API
 */
function buildPrompt(transcript: string, videoId: string): string {
  return `You are an expert educational video analyst. Analyze the following YouTube video transcript and provide:
1. Ratings (1-5) for: Clarity of Content, Emotional Impact, Video Structure, Retention Power, Commercial Balance.
2. A summary overview of the video (2-3 sentences).
3. Three positive points (bullet list).
4. Two areas for improvement (bullet list).
5. Five actionable suggestions for teachers to improve future videos, focusing on content quality, retention, and engagement.

Transcript:
"""
${transcript}
"""

Respond in strict JSON with this structure:
{
  "finalVerdict": {
    "clarityOfContent": number,
    "emotionalImpact": number,
    "videoStructure": number,
    "retentionPower": number,
    "commercialBalance": number
  },
  "videoSummary": {
    "overview": string,
    "positivePoints": [string],
    "negativePoints": [string],
    "suggestions": [string]
  }
}`;
}

/**
 * Extracts JSON from Gemini response text
 */
function extractJsonFromResponse(text: string): any {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    throw new Error('Invalid response format from AI service');
  }
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { transcript, videoId } = req.body;
    
    // Input validation
    if (!transcript || !videoId) {
      return res.status(400).json({ 
        error: 'Missing required fields: transcript and videoId are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Check cache first
    const cacheKey = `analysis:${crypto.createHash('sha256').update(transcript + videoId).digest('hex')}`;
    const cached = ANALYSIS_CACHE.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Call Gemini API
    const prompt = buildPrompt(transcript, videoId);
    const response = await fetch(
      `${config.gemini.apiUrl}?key=${config.gemini.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(500).json({
        error: 'Failed to analyze transcript',
        code: 'ANALYSIS_FAILED',
        details: process.env.NODE_ENV === 'development' ? errorText : undefined
      });
    }

    const data = await response.json();
    
    // Extract the response text
    let responseText = '';
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from AI service');
    }

    // Parse the response
    const analysis = extractJsonFromResponse(responseText);
    
    // Validate the analysis result
    if (!analysis.finalVerdict || !analysis.videoSummary) {
      throw new Error('Invalid analysis result format');
    }

    // Cache the result
    ANALYSIS_CACHE.set(cacheKey, analysis);

    res.json({
      success: true,
      ...analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze transcript',
      code: 'ANALYSIS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
