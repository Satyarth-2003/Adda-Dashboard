from youtube_transcript_api import YouTubeTranscriptApi
import sys

def get_transcript(video_id, language='hi'):
    try:
        # Try to get transcript in the specified language
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])
        return transcript
    except Exception as e:
        print(f"Error getting {language} transcript: {str(e)}")
        
        # If the specified language fails, try English
        if language != 'en':
            try:
                print("Trying English transcript...")
                transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
                return transcript
            except Exception as e2:
                print(f"Error getting English transcript: {str(e2)}")
        
        # If both fail, try to get any available transcript
        try:
            print("Trying to list available transcripts...")
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            print("\nAvailable transcripts:")
            for transcript in transcript_list:
                print(f"- {transcript.language} ({transcript.language_code}) - {'auto-generated' if transcript.is_generated else 'manual'}")
                
                # Try to get the first available transcript
                try:
                    transcript_data = transcript.fetch()
                    print(f"\nSuccessfully fetched {transcript.language} transcript!")
                    return transcript_data
                except Exception as e3:
                    print(f"Failed to fetch {transcript.language} transcript: {str(e3)}")
                    continue
                    
        except Exception as e4:
            print(f"Error listing transcripts: {str(e4)}")
            
    return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python simple_transcript_fetcher.py <youtube_video_id> [language_code]")
        sys.exit(1)
        
    video_id = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else 'hi'
    
    print(f"Fetching transcript for video: {video_id} (language: {language})")
    transcript = get_transcript(video_id, language)
    
    if transcript:
        print("\nTranscript (first 20 entries):")
        print("-" * 50)
        for i, entry in enumerate(transcript[:20]):
            print(f"{i+1}. [{entry['start']:.2f}s] {entry['text']}")
        
        if len(transcript) > 20:
            print(f"\n... and {len(transcript) - 20} more entries")
    else:
        print("\nFailed to fetch transcript. The video may not have captions available.")
