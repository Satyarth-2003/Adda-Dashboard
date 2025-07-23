// Using dynamic import to avoid type issues with googleapis
let google: any;

try {
  // @ts-ignore - Dynamic import
  google = (await import('googleapis')).google;
} catch (error) {
  console.error('Failed to load googleapis:', error);
  throw new Error('Google APIs client library is not available');
}

// Define strict types for the YouTube API response
interface CaptionSnippet {
  title?: string;
  language?: string;
  name?: string;
}

interface CaptionItem {
  kind?: string;
  etag?: string;
  id?: string;
  snippet?: CaptionSnippet;
}

interface CaptionListResponse {
  data: {
    kind?: string;
    etag?: string;
    items?: CaptionItem[];
  };
}

// This is a public API key with restricted permissions
// In production, you should use environment variables and proper authentication
const YOUTUBE_API_KEY = 'AIzaSyD3d4e3e4e3e4e3e4e3e4e3e4e3e4e3e4e3e4e';

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

export interface CaptionTrack {
  baseUrl: string;
  name: string;
  languageCode: string;
  kind: string;
}

export async function getVideoCaptions(videoId: string): Promise<CaptionTrack[]> {
  try {
    // First, get the video details to check if captions are available
    const videoResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId],
      key: YOUTUBE_API_KEY
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    // Check if the video has captions enabled
    const contentDetails = videoResponse.data.items[0].contentDetails;
    if (contentDetails?.caption === 'false') {
      throw new Error('Captions are disabled for this video');
    }

    // Get the video's caption tracks
    const captionsResponse: CaptionListResponse = await youtube.captions.list({
      part: ['snippet'],
      videoId: videoId,
    });

    if (!captionsResponse.data.items || captionsResponse.data.items.length === 0) {
      throw new Error('No captions available for this video');
    }

    // Format the response
    return captionsResponse.data.items?.map((caption) => ({
      baseUrl: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${caption.snippet?.language || 'en'}`,
      name: caption.snippet?.name || 'Untitled',
      languageCode: caption.snippet?.language || 'en',
      kind: caption.kind || 'asr',
    }));
  } catch (error) {
    console.error('Error fetching video captions:', error);
    throw new Error('Failed to fetch video captions');
  }
}

export async function getCaptionsInLanguage(videoId: string, languageCode: string = 'en'): Promise<string> {
  try {
    const captions = await getVideoCaptions(videoId);
    
    // Try to find the requested language
    const captionTrack = captions.find(c => c.languageCode.startsWith(languageCode));
    
    if (!captionTrack) {
      // Fall back to English if available
      const englishTrack = captions.find(c => c.languageCode.startsWith('en'));
      if (!englishTrack) {
        throw new Error(`No captions available in ${languageCode} or English`);
      }
      return fetchCaptionContent(englishTrack.baseUrl);
    }
    
    return fetchCaptionContent(captionTrack.baseUrl);
  } catch (error) {
    console.error(`Error getting captions in ${languageCode}:`, error);
    throw new Error(`Failed to get captions in ${languageCode}`);
  }
}

async function fetchCaptionContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch caption content: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching caption content:', error);
    throw new Error('Failed to fetch caption content');
  }
}

export async function getFormattedTranscript(videoId: string, languageCode: string = 'en'): Promise<string> {
  try {
    const captionXml = await getCaptionsInLanguage(videoId, languageCode);
    // Parse the XML and format it as plain text
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(captionXml, 'text/xml');
    const textNodes = xmlDoc.getElementsByTagName('text');
    
    let transcript = '';
    for (let i = 0; i < textNodes.length; i++) {
      const text = textNodes[i].textContent || '';
      transcript += text + ' ';
    }
    
    // Clean up the transcript
    return transcript
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  } catch (error) {
    console.error('Error formatting transcript:', error);
    throw new Error('Failed to format transcript');
  }
}
