from youtube_transcript_api import YouTubeTranscriptApi
import sys

def get_transcript(video_id):
    try:
        print(f"Fetching transcript for video: {video_id}")
        
        # Try to get transcript directly
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        print("\nTranscript:")
        print("-" * 50)
        for i, entry in enumerate(transcript, 1):
            print(f"{i}. [{entry['start']:.2f}s] {entry['text']}")
        
        return transcript
        
    except Exception as e:
        print(f"\nError: {str(e)}")
        print("\nThis video might not have captions available.")
        return None

if __name__ == "__main__":
    video_id = sys.argv[1] if len(sys.argv) > 1 else "-PAD2MYt0B0"
    get_transcript(video_id)
