from http.server import BaseHTTPRequestHandler
from youtube_transcript_api import YouTubeTranscriptApi
import json

def get_transcript(video_id, languages=None):
    """
    Fetch transcript for a YouTube video with language fallback
    """
    if languages is None:
        languages = ['hi', 'en']  # Default to Hindi first, then English
    
    try:
        # Try to get transcript with specified languages
        transcript = YouTubeTranscriptApi.get_transcript(
            video_id,
            languages=languages
        )
        return {
            'success': True,
            'transcript': ' '.join([entry['text'] for entry in transcript]),
            'language': languages[0] if transcript else 'unknown'
        }
    except Exception as e:
        # If primary language fails, try English
        if 'hi' in languages and 'en' not in languages:
            return get_transcript(video_id, ['en'])
        # If English fails, try any available language
        elif languages == ['en']:
            try:
                transcript = YouTubeTranscriptApi.get_transcript(video_id)
                return {
                    'success': True,
                    'transcript': ' '.join([entry['text'] for entry in transcript]),
                    'language': 'auto',
                    'message': 'Fell back to auto-detected language'
                }
            except Exception as e:
                return {
                    'success': False,
                    'error': str(e),
                    'message': 'No transcript available for this video'
                }
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch transcript'
        }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Get video_id from query parameters
        from urllib.parse import urlparse, parse_qs
        query = urlparse(self.path).query
        params = parse_qs(query)
        video_id = params.get('video_id', [''])[0]
        
        if not video_id:
            self.wfile.write(json.dumps({
                'success': False,
                'error': 'video_id parameter is required'
            }).encode('utf-8'))
            return
            
        # Get the transcript
        result = get_transcript(video_id)
        self.wfile.write(json.dumps(result).encode('utf-8'))
        return
    
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
