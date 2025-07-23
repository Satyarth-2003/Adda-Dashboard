import { YtTranscript } from 'yt-transcript';

export async function fetchYouTubeTranscript(videoId, lang = 'hi') {
  try {
    console.log(`Attempting to fetch transcript for video ${videoId} in ${lang}`);
    
    // Try fetching with the specified language first
    const transcript = new YtTranscript({
      videoId,
      lang
    });
    
    const transcriptData = await transcript.getTranscript();
    console.log(`Successfully fetched transcript in ${lang}`);
    return transcriptData;
  } catch (error) {
    console.error(`Error fetching transcript in ${lang}:`, error);
    
    // If the specified language fails, try English
    if (lang !== 'en') {
      try {
        console.log('Trying to fetch English transcript as fallback...');
        const transcript = new YtTranscript({
          videoId,
          lang: 'en'
        });
        
        const transcriptData = await transcript.getTranscript();
        console.log('Successfully fetched English transcript as fallback');
        return transcriptData;
      } catch (fallbackError) {
        console.error('Error fetching English transcript:', fallbackError);
      }
    }
    
    // If all else fails, try to get any available transcript
    try {
      console.log('Attempting to fetch any available transcript...');
      const transcript = new YtTranscript({ videoId });
      const transcriptData = await transcript.getTranscript();
      console.log('Successfully fetched transcript in available language');
      return transcriptData;
    } catch (finalError) {
      console.error('Failed to fetch any transcript:', finalError);
      throw new Error('No transcript available for this video');
    }
  }
}


