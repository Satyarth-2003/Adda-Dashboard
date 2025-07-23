from pytube import YouTube
import sys

def check_captions(video_url):
    try:
        yt = YouTube(video_url)
        print(f"Video Title: {yt.title}")
        print("\nAvailable Caption Tracks:")
        
        # Get available caption tracks
        caption_tracks = yt.captions
        
        if not caption_tracks:
            print("No captions available for this video.")
            return
            
        for caption in caption_tracks:
            print(f"- {caption.name} ({caption.code}) - {'Auto-generated' if 'a.' in caption.code else 'Manual'}")
            
        # Try to get English or Hindi captions
        for lang in ['en', 'hi']:
            caption = caption_tracks.get_by_language_code(lang)
            if caption:
                print(f"\nSample {caption.name} caption:\n")
                print(caption.generate_srt_captions())
                break
                
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    video_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.youtube.com/watch?v=-PAD2MYt0B0"
    check_captions(video_url)
