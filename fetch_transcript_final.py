from youtube_transcript_api import YouTubeTranscriptApi
import sys

def get_transcript(video_id, language='hi'):
    try:
        # Try to get the transcript in the specified language
        try:
            print(f"Attempting to fetch {language} transcript...")
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])
            print(f"Successfully fetched {language} transcript!")
            return transcript
        except Exception as e:
            print(f"Error fetching {language} transcript: {str(e)}")
            
            # Try English if the requested language fails
            if language != 'en':
                try:
                    print("\nAttempting to fetch English transcript...")
                    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
                    print("Successfully fetched English transcript!")
                    return transcript
                except Exception as e2:
                    print(f"Error fetching English transcript: {str(e2)}")
            
            # If both fail, try to list available transcripts
            try:
                print("\nAttempting to list available transcripts...")
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                
                print("\nAvailable transcripts:")
                for transcript in transcript_list:
                    print(f"- {transcript.language} ({transcript.language_code}): {transcript}")
                    
                    # Try to fetch the first available transcript
                    try:
                        print(f"\nTrying to fetch {transcript.language_code} transcript...")
                        transcript_data = transcript.fetch()
                        print(f"Successfully fetched {transcript.language_code} transcript!")
                        return transcript_data
                    except Exception as e3:
                        print(f"Error fetching {transcript.language_code} transcript: {str(e3)}")
                        continue
                        
            except Exception as e4:
                print(f"Error listing transcripts: {str(e4)}")
                
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        
    return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_transcript_final.py <youtube_video_id> [language_code]")
        print("Example: python fetch_transcript_final.py -PAD2MYt0B0 hi")
        sys.exit(1)
        
    video_id = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else 'hi'
    
    print(f"Fetching transcript for video: {video_id} (preferred language: {language})")
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
