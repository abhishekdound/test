'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import KnowledgeGraph from "@/components/KnowledgeGraph"
import AdobeScript from '@/components/AdobeScript'
import { 
  Upload, 
  FileText, 
  Brain, 
  Play, 
  Pause, 
  Volume2, 
  Download,
  Eye,
  Lightbulb,
  BookOpen,
  Headphones
} from "lucide-react"

// Import the actual API service
import { apiService } from '@/lib/api'


interface Document {
  id: string
  name: string
  content: string
  uploadedAt: Date
  jobId?: string // Added jobId to Document interface
}

interface Insight {
  id: string
  type: 'key_point' | 'summary' | 'connection' | 'question'
  title: string
  content: string
  confidence: number
  sources: string[]
}

interface RelatedSection {
  id: string
  title: string
  content: string
  similarity: number
  documentName: string
}

export default function AdobeLearnPlatform() {
  const [activeTab, setActiveTab] = useState("upload")
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [relatedSections, setRelatedSections] = useState<RelatedSection[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false)
  const [progress, setProgress] = useState(0) // This progress state is not used in the original code provided, but was in the changes. Keeping it as per instructions.
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [backendHealthy, setBackendHealthy] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null) // This state is not used in the original code provided, but was in the changes. Keeping it as per instructions.
  const fileInputRef = useRef<HTMLInputElement>(null) // This ref is not used in the original code provided, but was in the changes. Keeping it as per instructions.
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const isHealthy = await apiService.healthCheck();
        setBackendHealthy(isHealthy)
        if (!isHealthy) {
          toast({
            title: "Backend Unavailable",
            description: "Using mock data. Backend server is not responding.",
            variant: "destructive",
          })
        }
      } catch (error) {
        setBackendHealthy(false)
        console.error('Backend health check failed:', error)
        // Still allow frontend to work with mock data
        toast({
          title: "Using Mock Data",
          description: "Backend unavailable, using sample data for demonstration.",
        });
      }
    }

    checkBackendHealth()

    // Set up periodic health checks
    const healthInterval = setInterval(checkBackendHealth, 30000) // Every 30 seconds

    return () => clearInterval(healthInterval)
  }, [toast])


  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsAnalyzing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      // Show progress during upload
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await apiService.analyzeDocuments(formData, 'student', 'analyze document')

      clearInterval(progressInterval)
      setProgress(100)

      if (result.jobId) {
        setCurrentJobId(result.jobId)

        // Add documents to state
        const newDocuments = Array.from(files).map(file => ({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          content: `Analysis completed for ${file.name}`,
          uploadedAt: new Date(),
          jobId: result.jobId
        }))

        setDocuments(prev => [...prev, ...newDocuments])

        toast({
          title: "Files uploaded successfully",
          description: `${files.length} file(s) analyzed successfully`,
        })

        setActiveTab("analysis")
      } else if (!backendHealthy || result.fallback) {
        // Add fallback documents even if backend fails or returns fallback flag
        const fallbackDocuments = Array.from(files).map(file => ({
          id: `fallback-${Date.now()}-${file.name}`,
          name: file.name,
          content: `Mock analysis for ${file.name}. This document contains valuable information about Adobe's innovative solutions and document processing capabilities.`,
          uploadedAt: new Date(),
          jobId: result.jobId || `mock-${Date.now()}`
        }))

        setDocuments(prev => [...prev, ...fallbackDocuments])
        setActiveTab("analysis")

        toast({
          title: "Using fallback mode",
          description: "Backend unavailable, showing demo content",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: backendHealthy ? "Upload failed" : "Backend unavailable",
        description: backendHealthy ? "Please try again" : "Using fallback mode",
        variant: backendHealthy ? "destructive" : "default",
      })

      // Add fallback documents even if backend fails
      if (!backendHealthy) {
        const fallbackDocuments = Array.from(files).map(file => ({
          id: `fallback-${Date.now()}-${file.name}`,
          name: file.name,
          content: `Mock analysis for ${file.name}. This document contains valuable information about Adobe's innovative solutions.`,
          uploadedAt: new Date(),
          jobId: `mock-${Date.now()}`
        }))

        setDocuments(prev => [...prev, ...fallbackDocuments])
        setActiveTab("analysis")
      }
    } finally {
      setIsAnalyzing(false)
      // The original code had clearInterval(progressInterval) here, but it's moved inside the try block for clarity.
      // If an error occurred before progressInterval was set, this would cause an error.
      // This is a minor adjustment to ensure progressInterval is only cleared if it was set.
    }
  }, [toast, backendHealthy])

  const analyzeDocument = useCallback(async (document: Document) => {
    setIsAnalyzing(true)
    setSelectedDocument(document)

    try {
      // Find related sections
      const relatedResponse = await apiService.findRelated({
        content: document.content,
        documents: documents.map(d => ({ name: d.name, content: d.content }))
      });
      setRelatedSections(relatedResponse.relatedSections || [])

      setActiveTab('analysis')
      toast({
        title: "Analysis Complete",
        description: "Related sections have been identified",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze document",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }, [documents, toast])

  const generateInsights = useCallback(async () => {
    if (!selectedDocument) return

    setIsGeneratingInsights(true)

    try {
      // Use the first document's job ID for insights generation
      const jobId = selectedDocument.jobId || 'mock-job-id';
      const response = await apiService.generateInsights(jobId);

      setInsights(response.insights || [])

      toast({
        title: "Insights Generated",
        description: `Generated ${response.insights?.length || 0} insights`,
      })
    } catch (error) {
      toast({
        title: "Insight Generation Failed",
        description: "Failed to generate insights",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingInsights(false)
    }
  }, [selectedDocument, toast])

  const generatePodcast = useCallback(async () => {
    if (!selectedDocument || insights.length === 0) return

    setIsGeneratingPodcast(true)

    try {
      // Use the first document's job ID for podcast generation
      const jobId = selectedDocument.jobId || 'mock-job-id';
      const response = await apiService.generatePodcast(jobId);

      setPodcastUrl(response.audioUrl)

      toast({
        title: "Podcast Generated",
        description: "Your document has been converted to audio",
      })
    } catch (error) {
      toast({
        title: "Podcast Generation Failed", 
        description: "Failed to generate podcast",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPodcast(false)
    }
  }, [selectedDocument, insights, toast])

  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !podcastUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, podcastUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Adobe Learn Platform
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-Powered Document Analysis & Learning
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Knowledge Graph
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Documents
                </CardTitle>
                <CardDescription>
                  Upload PDF documents for AI-powered analysis and learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Supports PDF files up to 10MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isAnalyzing}
                  />
                  <label htmlFor="file-upload">
                    <Button asChild disabled={isAnalyzing || !backendHealthy}>
                      <span className="cursor-pointer">
                        {isAnalyzing ? 'Processing...' : 'Select Files'}
                      </span>
                    </Button>
                  </label>
                </div>
                {isAnalyzing && (
                  <div className="mt-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Processing documents...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Library ({documents.length})
                </CardTitle>
                <CardDescription>
                  Manage and analyze your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No documents uploaded yet. Start by uploading some PDF files.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{doc.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Uploaded {doc.uploadedAt.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {doc.content.length} characters
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => analyzeDocument(doc)}
                              disabled={isAnalyzing || !backendHealthy}
                              variant="outline"
                            >
                              <Brain className="w-4 h-4 mr-2" />
                              Analyze
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {selectedDocument ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Info */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Current Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">{selectedDocument.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {selectedDocument.content.length} characters
                    </p>
                    <div className="mt-4 space-y-2">
                      <Button 
                        onClick={generateInsights}
                        disabled={isGeneratingInsights || !backendHealthy || insights.length > 0} // Disable if insights already generated for this doc
                        className="w-full"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
                      </Button>
                      <Button 
                        onClick={generatePodcast}
                        disabled={isGeneratingPodcast || !backendHealthy || insights.length === 0}
                        variant="outline"
                        className="w-full"
                      >
                        <Headphones className="w-4 h-4 mr-2" />
                        {isGeneratingPodcast ? 'Generating...' : 'Create Podcast'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Related Sections */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Related Sections ({relatedSections.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        {relatedSections.length === 0 ? (
                          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                            No related sections found. Try analyzing a document first.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {relatedSections.map((section) => (
                              <div key={section.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">{section.title}</h4>
                                  <Badge variant="secondary">
                                    {Math.round(section.similarity * 100)}% match
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  From: {section.documentName}
                                </p>
                                <p className="text-sm mt-2">{section.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        AI Insights ({insights.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        {insights.length === 0 ? (
                          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                            No insights generated yet. Click "Generate Insights" to start.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {insights.map((insight) => (
                              <div key={insight.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">{insight.title}</h4>
                                  <Badge 
                                    variant={insight.type === 'key_point' ? 'default' : 'secondary'}
                                  >
                                    {insight.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm mb-2">{insight.content}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Confidence: {insight.confidence}%</span>
                                  <span>Sources: {insight.sources.join(', ')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Podcast Player */}
                  {podcastUrl && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Headphones className="w-5 h-5" />
                          Podcast Player
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Button onClick={togglePlayback} size="lg" disabled={!backendHealthy}>
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          <div className="flex-1">
                            <p className="font-semibold">{selectedDocument.name} - Audio Overview</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              AI-generated podcast from your document
                            </p>
                          </div>
                          <Button variant="outline" size="sm" disabled={!backendHealthy}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <audio 
                          ref={audioRef} 
                          src={podcastUrl} 
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a document from the Documents tab to start analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="graph" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Knowledge Graph
                </CardTitle>
                <CardDescription>
                  Interactive visualization of document relationships and concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KnowledgeGraph />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}