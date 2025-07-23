import os
import sys
from supadata_client import SupaDataClient
import json
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

def get_youtube_audio_url(video_id):
    """
    Get the audio stream URL for a YouTube video using yt-dlp
    """
    import yt_dlp
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f'https://www.youtube.com/watch?v={video_id}', download=False)
            if 'url' in info:
                return info['url']
            
            # If direct URL not available, try to find the best audio stream
            for format in info.get('formats', []):
                if format.get('acodec') != 'none' and format.get('url'):
                    return format['url']
                    
    except Exception as e:
        print(f"Error getting YouTube audio URL: {str(e)}")
    
    return None

def process_youtube_video(video_url, language="hi"):
    """
    Process a YouTube video with SupaData API
    """
    # Initialize the SupaData client
    SESSION_ID = "sd_34c7eee019290004202c004c0e4a9c24"
    client = SupaDataClient(SESSION_ID)
    
    # Extract video ID
    video_id = extract_video_id(video_url)
    if not video_id:
        return {"status": "error", "message": "Could not extract video ID from URL"}
    
    print(f"Processing YouTube video: {video_id}")
    
    # Get audio URL
    print("Extracting audio URL...")
    audio_url = get_youtube_audio_url(video_id)
    if not audio_url:
        return {"status": "error", "message": "Could not extract audio URL from YouTube video"}
    
    print(f"Audio URL: {audio_url[:100]}...")
    
    # Create transcript using SupaData
    print(f"Creating transcript with language: {language}")
    transcript_name = f"YouTube_{video_id}_{language}"
    
    result = client.create_transcript(
        audio_url=audio_url,
        language=language,
        name=transcript_name,
        metadata={
            "source": "youtube",
            "video_id": video_id,
            "original_url": video_url
        }
    )
    
    if 'id' in result:
        print(f"Successfully created transcript with ID: {result['id']}")
        
        # Poll for transcript completion
        print("Waiting for transcript to be processed...")
        import time
        max_attempts = 10
        for attempt in range(max_attempts):
            transcript = client.get_transcript(result['id'])
            status = transcript.get('status', 'processing')
            
            print(f"Status: {status} (attempt {attempt + 1}/{max_attempts})")
            
            if status == 'completed':
                print("\nTranscript completed successfully!")
                return {"status": "success", "transcript": transcript}
            elif status == 'failed':
                return {"status": "error", "message": "Transcript processing failed"}
                
            time.sleep(5)  # Wait 5 seconds before checking again
        
        return {
            "status": "timeout", 
            "message": "Transcript processing is taking longer than expected",
            "transcript_id": result['id']
        }
    else:
        return {"status": "error", "message": "Failed to create transcript", "details": result}

if __name__ == "__main__":
    import re
    
    if len(sys.argv) < 2:
        print("Usage: python process_youtube_with_supadata.py <youtube_url_or_id> [language_code]")
        print("Example: python process_youtube_with_supadata.py https://www.youtube.com/watch?v=-PAD2MYt0B0 hi")
        sys.exit(1)
    
    video_url = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else "hi"
    
    result = process_youtube_video(video_url, language)
    
    # Save the result to a file
    output_file = f"transcript_{extract_video_id(video_url)}_{language}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\nResults saved to: {output_file}")
    print("\nTranscript Preview:")
    print("=" * 80)
    
    if result.get('status') == 'success' and 'transcript' in result:
        transcript = result['transcript']
        print(f"Title: {transcript.get('name', 'N/A')}")
        print(f"Language: {transcript.get('language', 'N/A')}")
        print(f"Duration: {transcript.get('duration', 'N/A')} seconds")
        
        # Print first few lines of the transcript
        if 'segments' in transcript:
            print("\nFirst 5 segments:")
            for i, segment in enumerate(transcript['segments'][:5]):
                print(f"[{segment.get('start', 0):.2f}s - {segment.get('end', 0):.2f}s] {segment.get('text', '')}")
        elif 'text' in transcript:
            print("\nTranscript text (first 500 chars):")
            print(transcript['text'][:500] + "...")
    else:
        print(f"Error: {result.get('message', 'Unknown error')}")
