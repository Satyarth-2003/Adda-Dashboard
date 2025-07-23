import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Youtube, BarChart3, Download, Share2, TrendingUp, Eye, BookOpen, Users, Lightbulb, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { InsightRadarChart } from '@/components/InsightRadarChart';
import { FinalVerdictCard } from '@/components/FinalVerdictCard';
import { KeywordWordCloud } from '@/components/KeywordWordCloud';
import { InsightCard } from '@/components/InsightCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { VideoAnalysisAPI, getMockAnalysisData } from '@/services/api';

interface AnalysisData {
  insights: {
    studentEngagement: number;
    contentQuality: number;
    conceptConnectivity: number;
    clarityOfExplanation: number;
    practicalExamples: number;
    visualDiagramMentions: number;
    studentInteraction: number;
    educationalDepth: number;
    retentionTechniques: number;
    targetAudience: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  finalVerdict: {
    clarityOfContent: number;
    emotionalImpact: number;
    videoStructure: number;
    retentionPower: number;
    commercialBalance: number;
  };
  videoSummary: {
    overview: string;
    positivePoints: string[];
    negativePoints: string[];
    suggestions: string[];
  };
  topKeywords: Array<{ text: string; value: number }>;
  comprehensionScore: number;
  videoTitle: string;
  duration: string;
}

const Dashboard = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = async () => {
    if (!youtubeUrl) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use real API to get video info and enhanced analysis
      const result = await VideoAnalysisAPI.analyzeVideo(youtubeUrl);
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      setAnalysisData(result);
      toast({
        title: "Analysis Complete",
        description: "Video analysis has been generated successfully!",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze video. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    // PDF download functionality would go here
    toast({
      title: "PDF Downloaded",
      description: "Analysis report has been downloaded as PDF",
    });
  };

  const shareResults = async () => {
    // Share functionality would go here
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Youtube className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Adda247 Video Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Advanced AI-powered analysis for educational YouTube videos
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 bg-gradient-to-r from-card to-muted/20 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Video Analysis
            </CardTitle>
            <CardDescription>
              Paste an Adda247 YouTube video URL to get detailed educational insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="youtube-url">YouTube Video URL</Label>
        <Input
          id="youtube-url"
          placeholder="https://www.youtube.com/watch?v=EJzSZXaUL3c"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="mt-1"
        />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={analyzeVideo} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                >
                  {isLoading ? <LoadingSpinner /> : 'Analyze Video'}
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysisData && (
          <div className="space-y-6">
            {/* Video Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{analysisData.videoTitle}</CardTitle>
                    <CardDescription>Duration: {analysisData.duration}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={shareResults}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {analysisData.comprehensionScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-center">
                    <Badge variant="secondary" className="text-sm">
                      <Target className="h-3 w-3 mr-1" />
                      {analysisData.insights.targetAudience}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Analysis Tabs */}
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="insights">Educational Insights</TabsTrigger>
                <TabsTrigger value="charts">Visualizations</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="verdict">Final Verdict</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transcript</CardTitle>
                    <CardDescription>
                      Full transcript fetched from YouTube for this video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm max-h-[400px] overflow-auto p-2 bg-muted/10 rounded">
                      {analysisData.videoSummary?.overview || 'No transcript available.'}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InsightCard
                    title="Student Engagement"
                    value={analysisData.insights.studentEngagement}
                    icon={Users}
                    description="Level of student interaction and participation"
                  />
                  <InsightCard
                    title="Content Quality"
                    value={analysisData.insights.contentQuality}
                    icon={BookOpen}
                    description="Overall educational value and accuracy"
                  />
                  <InsightCard
                    title="Concept Connectivity"
                    value={analysisData.insights.conceptConnectivity}
                    icon={TrendingUp}
                    description="How well concepts are linked together"
                  />
                  <InsightCard
                    title="Clarity of Explanation"
                    value={analysisData.insights.clarityOfExplanation}
                    icon={Lightbulb}
                    description="How clearly concepts are explained"
                  />
                  <InsightCard
                    title="Practical Examples"
                    value={analysisData.insights.practicalExamples}
                    icon={Target}
                    description="Use of real-world examples"
                  />
                  <InsightCard
                    title="Visual/Diagram Mentions"
                    value={analysisData.insights.visualDiagramMentions}
                    icon={Eye}
                    description="References to visual aids and diagrams"
                  />
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Educational Insights Radar</CardTitle>
                      <CardDescription>
                        Comprehensive view of all educational metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <InsightRadarChart data={analysisData.insights} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Video Summary</CardTitle>
                      <CardDescription>
                        Key insights and analysis overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Overview</h4>
                          <p className="text-sm text-muted-foreground">{analysisData.videoSummary.overview}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-success">Positive Points</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {analysisData.videoSummary.positivePoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-success mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-destructive">Areas for Improvement</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {analysisData.videoSummary.negativePoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-destructive mt-1">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="keywords">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Keywords</CardTitle>
                    <CardDescription>
                      Most frequently mentioned terms in the video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <KeywordWordCloud words={analysisData.topKeywords} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verdict">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🎯 Final Verdict
                      </CardTitle>
                      <CardDescription>
                        Comprehensive evaluation across key aspects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FinalVerdictCard
                          title="Clarity of Content"
                          rating={analysisData.finalVerdict.clarityOfContent}
                          description="How clear and understandable the content is"
                        />
                        <FinalVerdictCard
                          title="Emotional Impact"
                          rating={analysisData.finalVerdict.emotionalImpact}
                          description="Ability to engage and connect with audience"
                        />
                        <FinalVerdictCard
                          title="Video Structure"
                          rating={analysisData.finalVerdict.videoStructure}
                          description="Organization and flow of content"
                        />
                        <FinalVerdictCard
                          title="Retention Power"
                          rating={analysisData.finalVerdict.retentionPower}
                          description="How memorable and retainable the content is"
                        />
                        <FinalVerdictCard
                          title="Commercial Balance"
                          rating={analysisData.finalVerdict.commercialBalance}
                          description="Balance between education and promotion"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🔧 Suggestions for Next Video
                      </CardTitle>
                      <CardDescription>
                        Recommendations to improve future content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisData.videoSummary.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;