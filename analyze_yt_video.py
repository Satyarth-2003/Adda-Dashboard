import os
import json
import re
from typing import Dict, Any, Optional
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import WebVTTFormatter
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

def extract_video_id(url: str) -> Optional[str]:
    """Extract video ID from YouTube URL."""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube\.com\/watch\?.*&v=)([^#\&\?\n"]+)',
        r'^([a-zA-Z0-9_-]{11})$'  # Just the video ID
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_transcript(video_id: str, language: str = 'hi') -> str:
    """Fetch transcript for a YouTube video."""
    try:
        # Get available transcripts
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try to get the specified language, fall back to any available
        try:
            transcript = transcript_list.find_transcript([language])
        except:
            transcript = next(iter(transcript_list))
        
        # Get the transcript data
        transcript_data = transcript.fetch()
        
        # Format as plain text
        text_formatted = "\n".join([entry['text'] for entry in transcript_data])
        
        # Save VTT version
        formatter = WebVTTFormatter()
        vtt_formatted = formatter.format_transcript(transcript_data)
        
        # Save VTT file
        vtt_filename = f"transcript_{video_id}.{transcript.language_code}.vtt"
        with open(vtt_filename, 'w', encoding='utf-8') as f:
            f.write("WEBVTT\n\n" + vtt_formatted)
        print(f"Transcript saved as {vtt_filename}")
        
        return text_formatted
        
    except Exception as e:
        print(f"Error fetching transcript: {str(e)}")
        raise

def analyze_transcript(transcript: str, video_id: str) -> Dict[str, Any]:
    """Analyze transcript using Gemini API."""
    prompt = f"""You are an expert educational video analyst. Analyze the following YouTube video transcript and provide:
1. Ratings (1-5) for: Clarity of Content, Emotional Impact, Video Structure, Retention Power, Commercial Balance.
2. A summary overview of the video (2-3 sentences).
3. Three positive points (bullet list).
4. Two areas for improvement (bullet list).
5. Five actionable suggestions for teachers to improve future videos, focusing on content quality, retention, and engagement.

Transcript:
"""
    
    prompt += f'"""{transcript}"""'
    
    prompt += """

Respond in valid JSON with this structure:
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
    "positivePoints": string[],
    "negativePoints": string[],
    "suggestions": string[]
  }
}
"""
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Clean the response to ensure it's valid JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            raise ValueError("Could not find JSON in response")
            
        analysis = json.loads(json_match.group(0))
        
        # Save analysis to file
        analysis_filename = f"analysis_{video_id}.json"
        with open(analysis_filename, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        print(f"Analysis saved as {analysis_filename}")
        
        return analysis
        
    except Exception as e:
        print(f"Error analyzing transcript: {str(e)}")
        raise

def main():
    print("YouTube Video Analyzer")
    print("======================")
    
    while True:
        url = input("\nEnter YouTube URL or video ID (or 'q' to quit): ").strip()
        
        if url.lower() == 'q':
            break
            
        video_id = extract_video_id(url)
        if not video_id:
            print("Invalid YouTube URL or video ID. Please try again.")
            continue
            
        print(f"\nProcessing video: {video_id}")
        
        try:
            # Get transcript
            print("Fetching transcript...")
            transcript = get_transcript(video_id)
            
            # Analyze transcript
            print("Analyzing content...")
            analysis = analyze_transcript(transcript, video_id)
            
            # Print summary
            print("\nAnalysis Complete!")
            print("------------------")
            print(f"Overview: {analysis['videoSummary']['overview']}")
            print("\nPositive Points:")
            for point in analysis['videoSummary']['positivePoints']:
                print(f"- {point}")
                
            print("\nAreas for Improvement:")
            for point in analysis['videoSummary']['negativePoints']:
                print(f"- {point}")
                
        except Exception as e:
            print(f"Error: {str(e)}")
            continue

if __name__ == "__main__":
    main()
