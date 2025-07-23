from youtube_transcript_api import YouTubeTranscriptApi
import sys

def get_transcript(video_id, language='hi'):
    try:
        # Get available transcripts
        transcript_list = YouTubeTranscriptApi.list(video_id)
        
        print(f"Available transcripts for video {video_id}:")
        for i, transcript in enumerate(transcript_list):
            print(f"{i+1}. Language: {transcript['language']} (Code: {transcript['language_code']})")
        
        # Try to get the requested language
        try:
            print(f"\nTrying to fetch {language} transcript...")
            transcript = YouTubeTranscriptApi.fetch(video_id, languages=[language])
            print(f"Successfully fetched {language} transcript!")
            return transcript
        except Exception as e:
            print(f"Error fetching {language} transcript: {str(e)}")
            
            # Try English if the requested language fails
            if language != 'en':
                try:
                    print("\nTrying to fetch English transcript...")
                    transcript = YouTubeTranscriptApi.fetch(video_id, languages=['en'])
                    print("Successfully fetched English transcript!")
                    return transcript
                except Exception as e2:
                    print(f"Error fetching English transcript: {str(e2)}")
            
            # If both fail, try to get any available transcript
            if transcript_list:
                first_lang = transcript_list[0]['language_code']
                print(f"\nTrying to fetch {first_lang} transcript...")
                try:
                    transcript = YouTubeTranscriptApi.fetch(video_id, languages=[first_lang])
                    print(f"Successfully fetched {first_lang} transcript!")
                    return transcript
                except Exception as e3:
                    print(f"Error fetching {first_lang} transcript: {str(e3)}")
        
        return None
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_transcript_correct.py <youtube_video_id> [language_code]")
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
