import youtube_transcript_api
import inspect

print("Available attributes in youtube_transcript_api:")
for name, obj in inspect.getmembers(youtube_transcript_api):
    if not name.startswith('_'):
        print(f"- {name}: {type(obj).__name__}")

print("\nTrying to import YouTubeTranscriptApi directly...")
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    print("YouTubeTranscriptApi imported successfully!")
    print(f"Type: {type(YouTubeTranscriptApi).__name__}")
    
    # List methods in YouTubeTranscriptApi
    print("\nMethods in YouTubeTranscriptApi:")
    for name, obj in inspect.getmembers(YouTubeTranscriptApi):
        if not name.startswith('_'):
            print(f"- {name}: {type(obj).__name__}")
            
except Exception as e:
    print(f"Error importing YouTubeTranscriptApi: {str(e)}")

print("\nTrying to list available transcripts...")
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    video_id = "-PAD2MYt0B0"
    print(f"Listing transcripts for video: {video_id}")
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    print(f"Found {len(list(transcript_list))} transcripts")
    
    for transcript in transcript_list:
        print(f"- {transcript.language} ({transcript.language_code}): {transcript}")
        
except Exception as e:
    print(f"Error listing transcripts: {str(e)}")
    import traceback
    traceback.print_exc()
