import requests
import json
import re
from urllib.parse import urlparse, parse_qs

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    # Handle various YouTube URL formats
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*$',
        r'(?:embed\/|v=)([^\&\?\/]+)',
        r'([0-9A-Za-z_-]{11})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return url  # If no match, return the input as is (might already be an ID)

def get_transcript(video_url, language='hi'):
    """Fetch transcript from YouTube video"""
    try:
        # Extract video ID from URL
        video_id = extract_video_id(video_url)
        print(f"Extracted video ID: {video_id}")
        
        # Try to get transcript directly
        url = f"https://youtube.com/watch?v={video_id}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # First, get the video page to extract caption tracks
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return {"error": f"Failed to fetch video page: {response.status_code}"}
            
        # Extract caption tracks from the page
        caption_tracks = re.findall(r'"captionTracks":(\[.*?\])', response.text)
        if not caption_tracks:
            return {"error": "No caption tracks found in video page"}
            
        # Parse the JSON data
        try:
            caption_tracks = json.loads(caption_tracks[0])
        except json.JSONDecodeError:
            return {"error": "Failed to parse caption tracks"}
            
        print(f"Found {len(caption_tracks)} caption tracks")
        
        # Try to find the requested language
        caption_url = None
        for track in caption_tracks:
            print(f"- {track.get('languageCode')}: {track.get('name', {}).get('simpleText', '')}")
            if track.get('languageCode') == language:
                caption_url = track.get('baseUrl')
                break
                
        if not caption_url:
            return {"error": f"No {language} captions found"}
            
        # Fetch the captions
        response = requests.get(f"{caption_url}&fmt=json3")
        if response.status_code != 200:
            return {"error": f"Failed to fetch captions: {response.status_code}"}
            
        # Parse and return the captions
        captions = response.json()
        return {
            "video_id": video_id,
            "language": language,
            "captions": captions.get('events', [])
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python youtube_transcript_api.py <youtube_url_or_id> [language_code]")
        sys.exit(1)
        
    video_url = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else 'hi'
    
    print(f"Fetching transcript for: {video_url}")
    result = get_transcript(video_url, language)
    
    if 'error' in result:
        print(f"Error: {result['error']}")
    else:
        print(f"\nSuccessfully fetched {len(result.get('captions', []))} captions in {result.get('language')}:")
        for i, caption in enumerate(result.get('captions', [])[:10]):  # Show first 10 captions
            if 'segs' in caption and caption['segs']:
                text = ' '.join(seg.get('utf8', '') for seg in caption['segs'] if seg.get('utf8'))
                if text.strip():
                    print(f"{i+1}. {text}")
        if len(result.get('captions', [])) > 10:
            print(f"... and {len(result.get('captions', [])) - 10} more captions")
