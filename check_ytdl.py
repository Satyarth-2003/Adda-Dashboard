import youtube_dl
import json
import sys

def check_captions(video_url):
    ydl_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en', 'hi'],
        'quiet': True
    }
    
    try:
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            # Get video info
            info = ydl.extract_info(video_url, download=False)
            print(f"Video Title: {info.get('title', 'N/A')}")
            print(f"Video ID: {info.get('id', 'N/A')}")
            
            # Check for automatic captions
            print("\nAutomatic Captions:")
            if info.get('automatic_captions'):
                for lang, captions in info['automatic_captions'].items():
                    print(f"- {lang}: {len(captions)} formats available")
            else:
                print("No automatic captions available.")
            
            # Check for manual captions
            print("\nManual Captions:")
            if info.get('subtitles'):
                for lang, subtitles in info['subtitles'].items():
                    print(f"- {lang}: {len(subtitles)} formats available")
            else:
                print("No manual captions available.")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    video_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.youtube.com/watch?v=-PAD2MYt0B0"
    check_captions(video_url)
