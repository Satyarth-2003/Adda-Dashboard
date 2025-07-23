const { execSync } = require('child_process');

async function fetchTranscript(videoId) {
  try {
    console.log(`Fetching transcript for video: ${videoId}`);
    
    // Try with Hindi first, then English
    const cmd = `python3 -c "from youtube_transcript_api import YouTubeTranscriptApi; import json; print(json.dumps(YouTubeTranscriptApi.get_transcript('${videoId}', languages=['hi', 'en']), indent=2))"`;
    
    const result = execSync(cmd, { encoding: 'utf-8' });
    const transcript = JSON.parse(result);
    
    console.log('\nTranscript:');
    console.log('-----------');
    transcript.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.start.toFixed(2)}s] ${entry.text}`);
    });
    
    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error.message);
    
    // Try to get available transcripts
    try {
      console.log('\nChecking available transcripts...');
      const cmd = `python3 -c "from youtube_transcript_api import YouTubeTranscriptApi; import json; print(json.dumps([{'language': t.language_code, 'is_generated': t.is_generated} for t in YouTubeTranscriptApi.list_transcripts('${videoId}')], indent=2))"`;
      const result = execSync(cmd, { encoding: 'utf-8' });
      console.log('\nAvailable transcripts:');
      console.log(JSON.parse(result));
    } catch (e) {
      console.error('Could not list available transcripts:', e.message);
    }
    
    return null;
  }
}

// Get video ID from command line argument or use default
const videoId = process.argv[2] || '-PAD2MYt0B0';
fetchTranscript(videoId);
