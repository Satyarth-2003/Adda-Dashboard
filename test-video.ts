import { VideoAnalysisAPI } from './src/services/api.js';

async function testVideoAnalysis(videoUrl: string) {
  try {
    console.log('Analyzing video:', videoUrl);
    
    // Test getting video info
    console.log('\nFetching video info...');
    const videoInfo = await VideoAnalysisAPI.getVideoInfo(videoUrl);
    console.log('Video Info:', videoInfo);
    
    // Test getting transcript
    console.log('\nFetching transcript...');
    const transcript = await VideoAnalysisAPI.getTranscript(videoUrl);
    console.log('Transcript status:', transcript.error ? 'Error: ' + transcript.error : 'Success');
    
    if (transcript.transcript) {
      console.log('Transcript length:', transcript.transcript.length, 'characters');
      console.log('First 200 chars of transcript:', transcript.transcript.substring(0, 200) + '...');
      
      // Test full analysis
      console.log('\nStarting full analysis...');
      const analysis = await VideoAnalysisAPI.analyzeVideo(videoUrl);
      
      if (analysis.error) {
        console.error('Analysis error:', analysis.error);
      } else {
        console.log('Analysis completed successfully!');
        console.log('Title:', analysis.videoTitle);
        console.log('Duration:', analysis.duration);
        console.log('Comprehension Score:', analysis.comprehensionScore);
        console.log('\nSummary:', analysis.videoSummary.overview);
        console.log('\nKey Insights:');
        console.log('- Student Engagement:', analysis.insights.studentEngagement);
        console.log('- Content Quality:', analysis.insights.contentQuality);
        console.log('- Target Audience:', analysis.insights.targetAudience);
      }
    }
    
  } catch (error) {
    console.error('Error in test:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Test with the provided YouTube video
const videoUrl = 'https://www.youtube.com/watch?v=-PAD2MYt0B0';
testVideoAnalysis(videoUrl);
