# Python backend for YouTube transcript using youtube-transcript-api
from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/yt_transcript', methods=['POST'])
def get_yt_transcript():
    data = request.get_json()
    video_id = data.get('videoId')
    if not video_id:
        return jsonify({'error': 'Missing videoId'}), 400
    try:
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            from youtube_transcript_api.formatters import TextFormatter
            video_id = str(video_id)
            transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
            print('Available languages:')
            for t in transcripts:
                print(t.language, t.language_code)
            # Prefer Hindi if available
            try:
                transcript_obj = transcripts.find_transcript(['hi'])
            except Exception:
                # Otherwise just use the 'best' transcript (first available)
                transcript_obj = next(iter(transcripts))
            transcript_list = transcript_obj.fetch()
            formatter = TextFormatter()
            transcript = formatter.format_transcript(transcript_list)
            print(f"Returning transcript of length {len(transcript)}")
            if transcript.strip():
                return jsonify({'transcript': transcript})
            else:
                print("Transcript is empty!")
                return jsonify({'error': 'Transcript is empty!'}), 404
        except Exception as e:
            print(f"Transcript fetch failed for video {video_id}: {e}")
            return jsonify({'error': str(e)}), 404
    except Exception as e:
        # Try to get available languages for debugging
        print(f"Transcript fetch failed for video {video_id}: {e}")
        try:
            transcript_list = YouTubeTranscriptApi().list(video_id)
            available_langs = [t.language_code for t in transcript_list]
            print(f"Available languages: {available_langs}")
        except Exception as lang_e:
            available_langs = f'Could not fetch: {lang_e}'
            print(f"Could not fetch available languages: {lang_e}")
        return jsonify({'error': str(e), 'available_languages': available_langs}), 404

if __name__ == '__main__':
    app.run(port=5001, debug=True)
