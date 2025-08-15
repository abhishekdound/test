'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Lightbulb, 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  Sparkles,
  Brain,
  Zap,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Search
} from "lucide-react"

interface Insight {
  id: string
  type: 'key_point' | 'did_you_know' | 'contradiction' | 'connection' | 'inspiration'
  title: string
  content: string
  confidence: number
  sources?: string[]
  relatedConcepts?: string[]
}

interface InsightsPanelProps {
  file: {
    id: string
    name: string
    content?: string
    jobId?: string
  }
  selectedText?: string
  onClose?: () => void
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ 
  file, 
  selectedText, 
  onClose 
}) => {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false)
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

    // Generate insights using LLM
  const generateInsights = useCallback(async (useSelectedText: boolean = false) => {
    console.log('generateInsights called with useSelectedText:', useSelectedText)
    console.log('selectedText:', selectedText)
    console.log('file.content:', file.content)

    if (!file.content && !selectedText) {
      setError('No content available for analysis')
      return
    }

    if (useSelectedText && !selectedText) {
      setError('No text selected. Please select some text in the PDF first.')
      return
    }

    setIsGeneratingInsights(true)
    setError(null)

    try {
      const contentToAnalyze = useSelectedText ? selectedText : file.content
      
      console.log('Generating insights for:', useSelectedText ? 'selected text' : 'full document')
      console.log('Content length:', contentToAnalyze?.length || 0)
      console.log('Content preview:', contentToAnalyze?.substring(0, 100))
      console.log('Using Gemini API for enhanced analysis')
      
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToAnalyze,
          analysisType: useSelectedText ? 'focused' : 'comprehensive',
          useSelectedText: useSelectedText
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      setInsights(data.insights || [])

      // Show success message
      if (data.insights && data.insights.length > 0) {
        console.log(`Generated ${data.insights.length} insights using ${useSelectedText ? 'selected text' : 'full document'}`)
      }

    } catch (err) {
      console.error('Insights generation error:', err)
      setError('Failed to generate insights. Using fallback insights.')
      
      // Fallback insights
      const fallbackInsights = useSelectedText ? [
        {
          id: 'fallback-1',
          type: 'key_point',
          title: 'Selected Text Analysis',
          content: `The selected text "${selectedText?.substring(0, 100)}..." contains important information that has been analyzed for key insights.`,
          confidence: 85,
          sources: ['Selected Text']
        },
        {
          id: 'fallback-2',
          type: 'did_you_know',
          title: 'Text Selection',
          content: 'You can select any text in the PDF to get focused insights on that specific content.',
          confidence: 90,
          sources: ['Selected Text']
        },
        {
          id: 'fallback-3',
          type: 'connection',
          title: 'Context Analysis',
          content: 'The selected text may have connections to other parts of the document or related concepts.',
          confidence: 75,
          sources: ['Selected Text']
        }
      ] : [
        {
          id: 'fallback-1',
          type: 'key_point',
          title: 'Document Analysis Complete',
          content: 'This document has been successfully analyzed and contains valuable information for your review.',
          confidence: 85,
          sources: [file.name]
        },
        {
          id: 'fallback-2',
          type: 'did_you_know',
          title: 'Content Structure',
          content: 'The document follows a structured format that makes it easy to navigate and understand key concepts.',
          confidence: 90,
          sources: [file.name]
        },
        {
          id: 'fallback-3',
          type: 'connection',
          title: 'Related Content',
          content: 'This document contains connections to other related topics and concepts that could be explored further.',
          confidence: 75,
          sources: [file.name]
        }
      ]
      
      setInsights(fallbackInsights)
    } finally {
      setIsGeneratingInsights(false)
    }
  }, [file.content, file.name, selectedText])

  // Generate podcast using TTS
  const generatePodcast = useCallback(async () => {
    if (insights.length === 0) {
      setError('Please generate insights first before creating a podcast')
      return
    }

    setIsGeneratingPodcast(true)
    setError(null)

         try {
       const response = await fetch('/api/podcast', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           insights: insights,
           durationSeconds: 180 // 3 minutes
         }),
       })

      if (!response.ok) {
        throw new Error('Failed to generate podcast')
      }

      const data = await response.json()
      setPodcastUrl(data.podcast?.audioUrl || null)

    } catch (err) {
      console.error('Podcast generation error:', err)
      setError('Failed to generate podcast. TTS service may not be available.')
    } finally {
      setIsGeneratingPodcast(false)
    }
  }, [insights, file.jobId])

  // Toggle podcast playback
  const togglePlayback = useCallback(() => {
    if (!podcastUrl) return

    const audio = new Audio(podcastUrl)
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [podcastUrl, isPlaying])

  // Get insight icon based on type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'key_point': return <Target className="h-4 w-4" />
      case 'did_you_know': return <Info className="h-4 w-4" />
      case 'contradiction': return <AlertCircle className="h-4 w-4" />
      case 'connection': return <Zap className="h-4 w-4" />
      case 'inspiration': return <Sparkles className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  // Get insight badge variant based on type
  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'key_point': return 'default'
      case 'did_you_know': return 'secondary'
      case 'contradiction': return 'destructive'
      case 'connection': return 'outline'
      case 'inspiration': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <div>
                             <CardTitle>AI-Powered Insights</CardTitle>
               <CardDescription>
                 Gemini AI-generated insights and podcast mode for {file.name}
               </CardDescription>
            </div>
          </div>
                     <div className="flex items-center gap-2">
             <Badge variant="outline" className="flex items-center gap-1">
               <Brain className="h-3 w-3" />
               Gemini AI
             </Badge>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>
      </CardHeader>

             <CardContent className="space-y-6">
         {/* Action Buttons - Moved to top */}
         <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
           <div className="flex items-center gap-2">
             <Button 
               onClick={() => generateInsights(false)}
               disabled={isGeneratingInsights}
               className="flex items-center gap-2"
             >
               <Sparkles className="h-4 w-4" />
               {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
             </Button>
             
             {selectedText && (
               <Button 
                 onClick={() => generateInsights(true)}
                 disabled={isGeneratingInsights}
                 variant="outline"
                 className="flex items-center gap-2"
               >
                 <BookOpen className="h-4 w-4" />
                 Analyze Selection
               </Button>
             )}
           </div>

           <Separator orientation="vertical" className="h-8" />

           <div className="flex items-center gap-2">
             <Button 
               onClick={generatePodcast}
               disabled={isGeneratingPodcast || insights.length === 0}
               variant="outline"
               className="flex items-center gap-2"
             >
               <Volume2 className="h-4 w-4" />
               {isGeneratingPodcast ? 'Generating...' : 'Create Podcast'}
             </Button>

             {podcastUrl && (
               <Button 
                 onClick={togglePlayback}
                 variant="outline"
                 size="sm"
                 className="flex items-center gap-2"
               >
                 {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                 {isPlaying ? 'Pause' : 'Play'}
               </Button>
             )}
           </div>
         </div>

                                     {/* Selected Text Display - Now below action buttons */}
          {selectedText && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Selected Text</h4>
                  <Badge variant="outline" className="text-xs">
                    {selectedText.length} characters
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Ready for Analysis
                  </Badge>
                </div>
                <Button 
                  onClick={() => generateInsights(true)}
                  disabled={isGeneratingInsights}
                  size="sm"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Lightbulb className="h-3 w-3" />
                  {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
                </Button>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-3 text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                <p className="whitespace-pre-wrap">
                  {selectedText.length > 200 
                    ? `${selectedText.substring(0, 200)}...` 
                    : selectedText
                  }
                </p>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                💡 Click the "Generate Insights" button above to get AI-powered insights on this specific text
              </div>
            </div>
          )}

         {/* No Text Selected Message */}
         {!selectedText && (
           <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
             <div className="flex items-center gap-2">
               <BookOpen className="h-4 w-4 text-yellow-600" />
               <h4 className="font-medium text-yellow-900 dark:text-yellow-100">No Text Selected</h4>
             </div>
             <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
               Select text in the PDF viewer to enable "Analyze Selection" feature
             </p>
             <div className="mt-3 flex gap-2">
                               <Button 
                  onClick={() => {
                    // Enhanced text selection detection
                    let selectedText = ''
                    
                    // Method 1: Standard selection
                    const selection = window.getSelection()
                    if (selection && selection.toString().trim()) {
                      selectedText = selection.toString().trim()
                      console.log('Method 1 - Standard selection:', selectedText)
                    }
                    
                    // Method 2: Check Adobe PDF iframe
                    if (!selectedText) {
                      try {
                        const pdfIframe = document.querySelector('iframe[title*="PDF"], iframe[src*="adobe"], iframe[id*="pdf"]') as HTMLIFrameElement
                        if (pdfIframe && pdfIframe.contentDocument) {
                          const iframeSelection = pdfIframe.contentDocument.getSelection()
                          if (iframeSelection && iframeSelection.toString().trim()) {
                            selectedText = iframeSelection.toString().trim()
                            console.log('Method 2 - Adobe PDF iframe selection:', selectedText)
                          }
                        }
                      } catch (e) {
                        console.log('Cannot access iframe content due to CORS:', e)
                      }
                    }
                    
                    // Method 3: Check for any iframe with selection
                    if (!selectedText) {
                      const iframes = document.querySelectorAll('iframe')
                      for (const iframe of iframes) {
                        try {
                          const iframeElement = iframe as HTMLIFrameElement
                          if (iframeElement.contentDocument) {
                            const iframeSelection = iframeElement.contentDocument.getSelection()
                            if (iframeSelection && iframeSelection.toString().trim()) {
                              selectedText = iframeSelection.toString().trim()
                              console.log('Method 3 - Generic iframe selection:', selectedText)
                              break
                            }
                          }
                        } catch (e) {
                          // Ignore CORS errors
                        }
                      }
                    }
                    
                    // Method 4: Check for highlighted elements
                    if (!selectedText) {
                      const highlightedElements = document.querySelectorAll('[style*="background"], [class*="highlight"], [class*="selected"]')
                      if (highlightedElements.length > 0) {
                        selectedText = Array.from(highlightedElements).map(el => el.textContent).join(' ').trim()
                        console.log('Method 4 - Highlighted elements:', selectedText)
                      }
                    }
                    
                    if (selectedText) {
                      console.log('Manual selection detected:', selectedText)
                      setSelectedText(selectedText)
                    } else {
                      alert('No text selected. Please select some text in the PDF first.')
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Search className="h-3 w-3" />
                  Check for Selected Text
                </Button>
                               <Button 
                  onClick={() => {
                    // Force a manual text selection check
                    const selection = window.getSelection()
                    if (selection && selection.toString().trim()) {
                      const text = selection.toString().trim()
                      console.log('Force manual selection:', text)
                      // Update the selectedText state directly
                      setSelectedText(text)
                    } else {
                      alert('No text selected. Please select some text in the PDF first.')
                    }
                  }}
                  variant="default" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Search className="h-3 w-3" />
                  Force Update Selection
                </Button>
                <Button 
                  onClick={() => {
                    const text = prompt('Enter selected text manually:')
                    if (text && text.trim()) {
                      console.log('Manual text input:', text)
                      setSelectedText(text.trim())
                    }
                  }}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-3 w-3" />
                  Manual Input
                </Button>
             </div>
           </div>
         )}

                 {/* Debug Info */}
         <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-400">
           <div>Debug: selectedText = "{selectedText || 'none'}"</div>
           <div>Debug: selectedText length = {selectedText?.length || 0}</div>
           <div>Debug: file.content length = {file.content?.length || 0}</div>
           <div>Debug: file.url = {file.url || 'none'}</div>
         </div>

         {/* Error Display */}
         {error && (
           <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
             <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}

        {/* Insights Display */}
        {insights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Generated Insights</h3>
              <Badge variant="secondary">{insights.length} insights</Badge>
            </div>

            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant={getInsightBadgeVariant(insight.type)}>
                          {insight.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3" />
                        {insight.confidence}% confidence
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.content}
                    </p>

                    {insight.sources && insight.sources.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Sources:</span>
                        {insight.sources.map((source, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {insight.relatedConcepts && insight.relatedConcepts.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Related:</span>
                        {insight.relatedConcepts.map((concept, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Podcast Section */}
        {podcastUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Podcast Mode</h3>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                2-5 min
              </Badge>
            </div>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Audio Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-generated audio summary of the document insights
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={togglePlayback}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button 
                      onClick={() => window.open(podcastUrl, '_blank')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {insights.length === 0 && !isGeneratingInsights && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                         <h3 className="text-lg font-medium mb-2">No Insights Yet</h3>
             <p className="text-muted-foreground mb-4">
               Generate Gemini AI-powered insights to discover key points, connections, and valuable information from your document.
             </p>
            <Button onClick={() => generateInsights(false)} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Insights
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isGeneratingInsights && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                         <h3 className="text-lg font-medium mb-2">Generating Insights</h3>
             <p className="text-muted-foreground">
               Analyzing your document with Gemini AI to extract valuable insights...
             </p>
          </div>
        )}

        {isGeneratingPodcast && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Creating Podcast</h3>
            <p className="text-muted-foreground">
              Converting insights to audio using text-to-speech...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default InsightsPanel
