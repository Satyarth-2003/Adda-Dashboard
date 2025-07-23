# Backend Setup Guide

This application requires backend functionality to process YouTube videos. Here are your options:

## Option 1: Supabase Edge Functions (Recommended)

Since Lovable has native Supabase integration, this is the easiest approach:

1. **Connect your project to Supabase** via the Lovable interface
2. **Create an Edge Function** for video analysis:

```typescript
// supabase/functions/analyze-video/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { youtubeUrl } = await req.json()
    
    // Step 1: Get transcript from Supadata API
    const SUPADATA_API_KEY = Deno.env.get('SUPADATA_API_KEY')
    const videoId = extractVideoId(youtubeUrl)
    
    const transcriptResponse = await fetch('https://api.supadata.ai/youtube/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPADATA_API_KEY}`,
      },
      body: JSON.stringify({
        video_id: videoId,
        format: 'text'
      }),
    })
    
    const transcriptData = await transcriptResponse.json()
    
    // Step 2: Analyze with Gemini Pro
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    const prompt = `
Analyze this Adda247 educational video transcript. Return the following 10 insights as structured JSON:
1. Student Engagement Level (0-100)
2. Content Quality Score (0-100)
3. Concept Connectivity & Flow (0-100)
4. Clarity of Explanation (0-100)
5. Use of Practical Examples (0-100)
6. Visual/Diagram Mentions (0-100)
7. Student Interaction Prompts (0-100)
8. Educational Depth Level (0-100)
9. Retention & Recap Techniques (0-100)
10. Target Audience (Beginner/Intermediate/Advanced)

Also include: sentiment timeline (5 points through video), top 10 keywords with frequency, and estimated comprehension score.

Transcript: "${transcriptData.transcript}"
`

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    })
    
    const geminiData = await geminiResponse.json()
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    
    // Parse and return the analysis
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    const analysis = JSON.parse(jsonMatch[0])
    
    return new Response(
      JSON.stringify({
        ...analysis,
        videoTitle: 'Adda247 Educational Video', // Extract from YouTube API
        duration: '45:32' // Extract from YouTube API
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}
```

3. **Set Environment Variables** in Supabase:
   - `SUPADATA_API_KEY`: `sd_6eb4ac66b5e971f3b55d3d5bd26cfd49`
   - `GEMINI_API_KEY`: `AIzaSyBVCVssm7LhKLpe10WME9Y8dawYe2nkLys`

4. **Update the frontend** to call your Edge Function:

```typescript
// In src/services/api.ts, replace the analyzeVideo method:
static async analyzeVideo(youtubeUrl: string): Promise<AnalysisResponse> {
  const response = await fetch('/api/analyze-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ youtubeUrl }),
  })
  
  return response.json()
}
```

## Option 2: Python Flask Backend

If you prefer Python Flask, create a separate backend service:

### Requirements
```txt
flask
flask-cors
requests
google-generativeai
```

### app.py
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import google.generativeai as genai
import re
import json

app = Flask(__name__)
CORS(app)

# API Keys
SUPADATA_API_KEY = "sd_6eb4ac66b5e971f3b55d3d5bd26cfd49"
GEMINI_API_KEY = "AIzaSyBVCVssm7LhKLpe10WME9Y8dawYe2nkLys"

genai.configure(api_key=GEMINI_API_KEY)

def extract_video_id(url):
    pattern = r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)'
    match = re.search(pattern, url)
    return match.group(1) if match else None

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    try:
        data = request.json
        youtube_url = data.get('youtubeUrl')
        
        if not youtube_url:
            return jsonify({'error': 'YouTube URL required'}), 400
        
        video_id = extract_video_id(youtube_url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Step 1: Get transcript
        transcript_response = requests.post(
            'https://api.supadata.ai/youtube/transcript',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {SUPADATA_API_KEY}'
            },
            json={
                'video_id': video_id,
                'format': 'text'
            }
        )
        
        if not transcript_response.ok:
            return jsonify({'error': 'Failed to get transcript'}), 400
        
        transcript_data = transcript_response.json()
        transcript = transcript_data.get('transcript', '')
        
        # Step 2: Analyze with Gemini
        prompt = f"""
Analyze this Adda247 educational video transcript. Return the following 10 insights as structured JSON:
1. Student Engagement Level (0-100)
2. Content Quality Score (0-100)
3. Concept Connectivity & Flow (0-100)
4. Clarity of Explanation (0-100)
5. Use of Practical Examples (0-100)
6. Visual/Diagram Mentions (0-100)
7. Student Interaction Prompts (0-100)
8. Educational Depth Level (0-100)
9. Retention & Recap Techniques (0-100)
10. Target Audience (Beginner/Intermediate/Advanced)

Also include: sentiment timeline (5 points through video), top 10 keywords with frequency, and estimated comprehension score.

Return ONLY valid JSON in this format:
{{
  "insights": {{
    "studentEngagement": number,
    "contentQuality": number,
    "conceptConnectivity": number,
    "clarityOfExplanation": number,
    "practicalExamples": number,
    "visualDiagramMentions": number,
    "studentInteraction": number,
    "educationalDepth": number,
    "retentionTechniques": number,
    "targetAudience": "Beginner|Intermediate|Advanced"
  }},
  "sentimentTimeline": [{{"time": 0, "sentiment": 0.8}}, ...],
  "topKeywords": [{{"text": "keyword", "value": 45}}, ...],
  "comprehensionScore": number
}}

Transcript: "{transcript}"
"""
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if not json_match:
            return jsonify({'error': 'Failed to parse analysis'}), 500
        
        analysis = json.loads(json_match.group())
        
        # Add video metadata
        analysis['videoTitle'] = 'Adda247 Educational Video'
        analysis['duration'] = '45:32'
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Run the Flask Backend
```bash
pip install -r requirements.txt
python app.py
```

Then update the frontend API service to call `http://localhost:5000/api/analyze-video`.

## Current Status

The frontend is fully functional with:
- ✅ Beautiful responsive UI with YouTube red theme
- ✅ Input form for YouTube URLs
- ✅ Comprehensive dashboard with multiple visualizations
- ✅ Radar charts, sentiment timelines, word clouds
- ✅ Progress bars for educational insights
- ✅ Mock data for demonstration
- ✅ Loading states and error handling
- ✅ Share and PDF download placeholders

The backend integration is ready to be implemented using either approach above.

## API Keys Provided

- **Supadata API**: `sd_6eb4ac66b5e971f3b55d3d5bd26cfd49`
- **Gemini Pro API**: `AIzaSyBVCVssm7LhKLpe10WME9Y8dawYe2nkLys`

**Note**: In production, store these keys securely in environment variables, not in code.