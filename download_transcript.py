import yt_dlp
import json
import sys

def download_transcript(video_url, language='hi'):
    ydl_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': [language],
        'subtitlesformat': 'vtt',
        'quiet': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info
            info = ydl.extract_info(video_url, download=False)
            
            if 'subtitles' not in info and 'automatic_captions' not in info:
                print("No subtitles or captions available for this video.")
                return
                
            # Try to get manual subtitles first
            if 'subtitles' and language in info['subtitles']:
                print("Found manual subtitles:")
                subtitles = info['subtitles'][language]
            # Fall back to automatic captions
            elif 'automatic_captions' and language in info['automatic_captions']:
                print("Found automatic captions:")
                subtitles = info['automatic_captions'][language]
            else:
                print(f"No {language} subtitles or captions available.")
                # Show available languages
                if 'automatic_captions' in info:
                    print("\nAvailable automatic caption languages:")
                    for lang in info['automatic_captions'].keys():
                        print(f"- {lang}")
                return
            
            # Download the first available subtitle format
            if subtitles:
                subtitle_url = subtitles[0].get('url')
                if subtitle_url:
                    print(f"\nDownloading {language} subtitles...")
                    ydl.download([f"{video_url} --sub-lang {language}"])
                    print("\nSubtitles downloaded successfully!")
                    
                    # Try to read and display the subtitles
                    try:
                        import webvtt
                        import os
                        safe_video_id = info['id'].replace('-', '_')
                        vtt_file = f"{safe_video_id}_{language}.vtt"
                        # Rename the downloaded file if it exists with the original ID
                        if os.path.exists(f"{info['id']}.{language}.vtt"):
                            os.rename(f"{info['id']}.{language}.vtt", vtt_file)
                        elif os.path.exists(f"{info['id']}.vtt"):
                            os.rename(f"{info['id']}.vtt", vtt_file)
                        captions = webvtt.read(vtt_file)
                        
                        print("\nTranscript Preview:")
                        print("-" * 50)
                        for i, caption in enumerate(captions[:20]):  # Show first 20 captions
                            print(f"{i+1}. [{caption.start} --> {caption.end}] {caption.text}")
                        print("\n... (more captions available in the downloaded file)")
                        
                    except ImportError:
                        print("\nInstall 'webvtt-py' to display the transcript content:")
                        print("pip install webvtt-py")
                    except Exception as e:
                        print(f"\nCould not parse VTT file: {str(e)}")
                        print(f"You can find the downloaded subtitles in: {vtt_file}")
                
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    video_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.youtube.com/watch?v=-PAD2MYt0B0"
    language = sys.argv[2] if len(sys.argv) > 2 else "hi"
    download_transcript(video_url, language)
