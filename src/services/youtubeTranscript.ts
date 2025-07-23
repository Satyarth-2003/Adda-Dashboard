// @ts-ignore - No types available for this module
import YTTranscript from 'youtube-transcript';

export interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

export async function fetchYouTubeTranscript(videoId: string, lang = 'hi'): Promise<TranscriptItem[]> {
  try {
    console.log(`Attempting to fetch transcript for video ${videoId} in ${lang}`);
    
    // Try fetching with the specified language first
    const transcript = await YTTranscript.YoutubeTranscript.fetchTranscript(videoId, { lang });
    console.log(`Successfully fetched transcript in ${lang}`);
    return transcript;
  } catch (error) {
    console.error(`Error fetching transcript in ${lang}:`, error);
    
    // If the specified language fails, try English as fallback
    if (lang !== 'en') {
      try {
        console.log('Trying to fetch English transcript as fallback...');
        const transcript = await YTTranscript.YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
        console.log('Successfully fetched English transcript as fallback');
        return transcript;
      } catch (fallbackError) {
        console.error('Error fetching English transcript:', fallbackError);
      }
    }
    
    // If all else fails, try to get any available transcript
    try {
      console.log('Attempting to fetch any available transcript...');
      const transcript = await YTTranscript.YoutubeTranscript.fetchTranscript(videoId);
      console.log('Successfully fetched transcript in available language');
      return transcript;
    } catch (finalError) {
      console.error('Failed to fetch any transcript:', finalError);
      throw new Error('No transcript available for this video');
    }
  }
}

export function formatTranscript(transcript: TranscriptItem[]): string {
  return transcript.map(item => item.text).join(' ');
}
