from youtube_transcript_api import YouTubeTranscriptApi
import json
import sys

def get_transcript(video_id):
    try:
        print(f"Fetching transcript for video: {video_id}")
        
        # First, list all available transcripts
        transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
        
        print("\nAvailable transcripts:")
        for transcript in transcripts:
            print(f"- {transcript.language} ({'auto-generated' if transcript.is_generated else 'manual'})")
        
        # Try to get Hindi or English transcript
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['hi', 'en'])
            print("\nTranscript (Hindi/English):")
            print("-" * 50)
            for i, entry in enumerate(transcript, 1):
                print(f"{i}. [{entry['start']:.2f}s] {entry['text']}")
            return transcript
            
        except Exception as e:
            print(f"\nCould not get Hindi/English transcript: {str(e)}")
            
            # Try to get any available transcript
            try:
                transcript = YouTubeTranscriptApi.get_transcript(video_id)
                print("\nTranscript (any language):")
                print("-" * 50)
                for i, entry in enumerate(transcript, 1):
                    print(f"{i}. [{entry['start']:.2f}s] {entry['text']}")
                return transcript
                
            except Exception as e:
                print(f"\nCould not get any transcript: {str(e)}")
                return None
                
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    video_id = sys.argv[1] if len(sys.argv) > 1 else "-PAD2MYt0B0"
    get_transcript(video_id)
