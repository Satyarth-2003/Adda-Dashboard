// Gemini 1.5 Pro analysis endpoint for YouTube transcript analysis
// Place your Gemini API key in the GEMINI_API_KEY env variable or securely in this file for now (for demo only)

import express from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';
const router = express.Router();

// For demo only: API key hardcoded (move to env in prod!)
const GEMINI_API_KEY = "AIzaSyBVCVssm7LhKLpe10WME9Y8dawYe2nkLys";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + GEMINI_API_KEY;

// Simple in-memory cache for deterministic results
const analysisCache = {};

// Helper: create a hash from transcript or videoId
function getDeterministicHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Gemini prompt for teacher-focused suggestions
function buildPrompt(transcript, videoId) {
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

router.post('/', async (req, res) => {
  try {
    const { transcript, videoId } = req.body;
    if (!transcript || !videoId) {
      return res.status(400).json({ error: 'Missing transcript or videoId' });
    }
    const hashKey = getDeterministicHash(transcript + videoId);
    if (analysisCache[hashKey]) {
      return res.json(analysisCache[hashKey]);
    }
    const prompt = buildPrompt(transcript, videoId);
    const geminiRes = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const geminiJson = await geminiRes.json();
    // Extract JSON from Gemini response
    let responseText = '';
    if (geminiJson.candidates && geminiJson.candidates[0]?.content?.parts[0]?.text) {
      responseText = geminiJson.candidates[0].content.parts[0].text;
    } else {
      return res.status(500).json({ error: 'Gemini response invalid', geminiJson });
    }
    // Try to parse JSON (Gemini sometimes adds markdown)
    let analysis;
    try {
      responseText = responseText.replace(/^```json|```$/g, '').trim();
      analysis = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse Gemini JSON', responseText });
    }
    analysisCache[hashKey] = analysis;
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

export default router;
