// API service for YouTube video analysis

interface TranscriptResponse {
  transcript: string;
  error?: string;
}

interface AnalysisResponse {
  insights: {
    studentEngagement: number;
    contentQuality: number;
    conceptConnectivity: number;
    clarityOfExplanation: number;
    practicalExamples: number;
    visualDiagramMentions: number;
    studentInteraction: number;
    educationalDepth: number;
    retentionTechniques: number;
    targetAudience: 'Beginner' | 'Intermediate' | 'Advanced';
  };
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
  topKeywords: Array<{ text: string; value: number }>;
  comprehensionScore: number;
  videoTitle: string;
  duration: string;
  error?: string;
}

// API Key for youtube-transcript.io (moved to environment variables)

export class VideoAnalysisAPI {
  // Fallback analysis in case Gemini or transcript fails
  static getFallbackAnalysis(videoTitle: string, duration: string, error: string): AnalysisResponse {
    return {
      insights: {
        studentEngagement: 0,
        contentQuality: 0,
        conceptConnectivity: 0,
        clarityOfExplanation: 0,
        practicalExamples: 0,
        visualDiagramMentions: 0,
        studentInteraction: 0,
        educationalDepth: 0,
        retentionTechniques: 0,
        targetAudience: 'Beginner'
      },
      finalVerdict: {
        clarityOfContent: 0,
        emotionalImpact: 0,
        videoStructure: 0,
        retentionPower: 0,
        commercialBalance: 0
      },
      videoSummary: {
        overview: 'Unable to analyze video content.',
        positivePoints: [],
        negativePoints: [],
        suggestions: []
      },
      topKeywords: [],
      comprehensionScore: 0,
      videoTitle,
      duration,
      error
    };
  }

  // Extract YouTube video ID from URL
  private static extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  // Get transcript using youtube-transcript-api
  static async getTranscript(youtubeUrl: string): Promise<TranscriptResponse> {
    const videoId = this.extractVideoId(youtubeUrl);
    if (!videoId) {
      return { transcript: '', error: 'Invalid YouTube URL' };
    }
    try {
      const response = await fetch('/api/yt_transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.transcript) {
          return { transcript: data.transcript };
        } else if (data.error) {
          console.error('Transcript API error:', data.error);
          return { transcript: '', error: data.error };
        }
        if (data.transcript && data.transcript.length > 0) {
          return { transcript: data.transcript };
        }
        if (data.error) {
          return { transcript: '', error: data.error };
        }
      }
    } catch (proxyError) {
      console.log('Backend transcript proxy failed:', proxyError);
    }
    console.error('All transcript methods failed');
    return { transcript: '', error: 'Unable to fetch transcript from any source' };
  }

  /**
   * Get video information from YouTube
   * @param youtubeUrl The YouTube video URL or ID
   * @returns Video information including title and duration
   */
  static async getVideoInfo(youtubeUrl: string): Promise<{ title: string; duration: string }> {
    try {
      const videoId = this.extractVideoId(youtubeUrl);
      if (!videoId) {
        return { title: 'Unknown Video', duration: '0:00' };
      }

      // Try to fetch video info from YouTube's oEmbed API (no key required)
      const oembedResponse = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (oembedResponse.ok) {
        const data = await oembedResponse.json();
        return {
          title: data.title || 'YouTube Video',
          duration: 'Unknown' // oEmbed doesn't provide duration
        };
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
    }
    
    // Fallback: try to extract title from URL if it contains title info
    try {
      const url = new URL(youtubeUrl);
      const titleParam = url.searchParams.get('title');
      if (titleParam) {
        return { title: titleParam, duration: 'Unknown' };
      }
    } catch (error) {
      // Ignore URL parsing errors
    }

    return { title: 'YouTube Video', duration: 'Unknown' };
  }

  // Analyze transcript with Gemini Pro
  static async analyzeWithGemini(transcript: string, videoTitle: string, duration: string): Promise<AnalysisResponse> {
    const prompt = `
Analyze this educational video transcript and provide detailed insights. Return ONLY valid JSON in this exact format:

{
  "insights": {
    "studentEngagement": number (0-100),
    "contentQuality": number (0-100),
    "conceptConnectivity": number (0-100),
    "clarityOfExplanation": number (0-100),
    "practicalExamples": number (0-100),
    "visualDiagramMentions": number (0-100),
    "studentInteraction": number (0-100),
    "educationalDepth": number (0-100),
    "retentionTechniques": number (0-100),
    "targetAudience": "Beginner|Intermediate|Advanced"
  },
  "finalVerdict": {
    "clarityOfContent": number (1-5 stars, decimal allowed),
    "emotionalImpact": number (1-5 stars, decimal allowed),
    "videoStructure": number (1-5 stars, decimal allowed),
    "retentionPower": number (1-5 stars, decimal allowed),
    "commercialBalance": number (1-5 stars, decimal allowed)
  },
  "videoSummary": {
    "overview": "detailed summary of video content and teaching approach",
    "positivePoints": ["strength 1", "strength 2", "strength 3"],
    "negativePoints": ["weakness 1", "weakness 2"],
    "suggestions": ["improvement 1", "improvement 2", "improvement 3"]
  },
  "topKeywords": [{"text": "keyword", "value": frequency}, ...],
  "comprehensionScore": number (0-100)
}

Video Title: "${videoTitle}"
Duration: "${duration}"
Transcript: "${transcript.slice(0, 8000)}"`;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
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
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      return {
        ...analysisData,
        videoTitle,
        duration: duration || 'Unknown',
      };
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);
      return {
        insights: {
          studentEngagement: 0,
          contentQuality: 0,
          conceptConnectivity: 0,
          clarityOfExplanation: 0,
          practicalExamples: 0,
          visualDiagramMentions: 0,
          studentInteraction: 0,
          educationalDepth: 0,
          retentionTechniques: 0,
          targetAudience: 'Beginner' as const
        },
        finalVerdict: {
          clarityOfContent: 0,
          emotionalImpact: 0,
          videoStructure: 0,
          retentionPower: 0,
          commercialBalance: 0
        },
        videoSummary: {
          overview: "Unable to analyze video content.",
          positivePoints: [],
          negativePoints: [],
          suggestions: []
        },
        topKeywords: [],
        comprehensionScore: 0,
        videoTitle,
        duration: duration || '0:00',
        error: 'Failed to analyze video: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  // Main analysis function
  static async analyzeVideo(youtubeUrl: string): Promise<AnalysisResponse> {
    try {
      // Get video info and transcript in parallel
      const [videoInfo, transcriptResult] = await Promise.all([
        this.getVideoInfo(youtubeUrl),
        this.getTranscript(youtubeUrl)
      ]);

      // If transcript fetch failed, return fallback analysis
      if (transcriptResult.error || !transcriptResult.transcript) {
        console.error('Transcript fetch failed:', transcriptResult.error);
        return this.getFallbackAnalysis(
          videoInfo.title, 
          videoInfo.duration, 
          transcriptResult.error || 'Failed to fetch transcript'
        );
      }

      // Call backend API for analysis
      const videoId = this.extractVideoId(youtubeUrl);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: transcriptResult.transcript, 
          videoId,
          videoTitle: videoInfo.title
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        ...result,
        videoTitle: videoInfo.title,
        duration: videoInfo.duration
      };
      
    } catch (error) {
      console.error('Analysis failed:', error);
      const videoInfo = await this.getVideoInfo(youtubeUrl);
      return this.getFallbackAnalysis(
        videoInfo.title, 
        videoInfo.duration, 
        error instanceof Error ? error.message : 'Analysis failed'
      );
    }
  }
}