"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import KnowledgeGraph from "@/components/KnowledgeGraph"
import { useFileUpload, useInsightsGeneration, usePodcastGeneration, useRelatedSections, useJobPolling } from "@/hooks/useApi"
import { AnalysisRequest } from "@/lib/api"
import {
  Upload,
  FileText,
  Lightbulb,
  Headphones,
  Play,
  Pause,
  Download,
  X,
  BookOpen,
  ChevronRight,
  Clock,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Share2,
  Bookmark,
  Eye,
  BarChart3,
  Sparkles,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Brain,
} from "lucide-react"

type UploadedPDF = {
  id: number
  name: string
  file: File
  type: string
  url: string
  uploadDate: Date
  size: number
  pages?: number
  isFavorite: boolean
  viewCount: number
}

type ViewMode = "grid" | "list"

export default function AdobeLearn() {
  const [selectedPdf, setSelectedPdf] = useState<UploadedPDF | null>(null)
  const [uploadedPDFs, setUploadedPDFs] = useState<UploadedPDF[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadType, setUploadType] = useState("fresh")
  const [insights, setInsights] = useState<any[]>([])
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [relatedSections, setRelatedSections] = useState<any[]>([])
  const [showInsights, setShowInsights] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')

  // API hooks
  const { uploading: isUploading, progress: uploadProgress, error: uploadError, uploadFiles, reset: resetUpload } = useFileUpload()
  const { data: insightsData, loading: isLoadingInsights, error: insightsError, execute: generateInsights } = useInsightsGeneration()
  const { data: podcastData, loading: isGeneratingPodcast, error: podcastError, execute: executePodcastGeneration } = usePodcastGeneration()
  const { data: relatedData, loading: isLoadingRelated, error: relatedError, execute: getRelatedSections } = useRelatedSections()
  const { status: jobStatus, loading: jobLoading, error: jobError, startPolling, stopPolling, reset: resetJob } = useJobPolling(currentJobId)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Auto-hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/actuator/health')
        if (response.ok) {
          setBackendStatus('online')
        } else {
          setBackendStatus('offline')
        }
      } catch (error) {
        console.log('Backend not available:', error)
        setBackendStatus('offline')
      }
    }

    checkBackendStatus()
  }, [])

  // Handle insights data updates
  useEffect(() => {
    if (insightsData) {
      setInsights(insightsData)
    }
  }, [insightsData])

  // Handle related sections data updates
  useEffect(() => {
    if (relatedData) {
      setRelatedSections(relatedData)
    }
  }, [relatedData])

  // Handle podcast data updates
  useEffect(() => {
    if (podcastData) {
      setPodcastUrl(podcastData.audioUrl)
    }
  }, [podcastData])

  // Handle job status updates
  useEffect(() => {
    if (jobStatus && jobStatus.status === 'COMPLETED') {
      stopPolling()
    }
  }, [jobStatus, stopPolling])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.includes('pdf'))
    if (invalidFiles.length > 0) {
      alert('Please select only PDF files.')
      return
    }

    // Create analysis request
    const analysisRequest: AnalysisRequest = {
      persona: "Student",
      jobToBeDone: "Learn and understand the content",
      enableInsights: true,
      enablePodcast: false
    }

    try {
      // Try to upload to backend first
      const result = await uploadFiles(files, analysisRequest)
      
      if (result) {
        setCurrentJobId(result.jobId)
        startPolling()
        
        // Add files to uploaded PDFs list
        const newPDFs = files.map((file) => ({
          id: Date.now() + Math.random(),
          name: file.name,
          file: file,
          type: uploadType,
          url: URL.createObjectURL(file),
          uploadDate: new Date(),
          size: file.size,
          pages: Math.floor(Math.random() * 50) + 1, // Mock page count
          isFavorite: false,
          viewCount: 0,
        }))

        setUploadedPDFs((prev) => [...prev, ...newPDFs])
        setShowUploadDialog(false)

        // Auto-select the first uploaded PDF if none selected
        if (!selectedPdf && newPDFs.length > 0) {
          loadPDF(newPDFs[0])
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    } catch (error) {
      console.error('Backend upload failed, using fallback mode:', error)
      
      // Fallback: Add files locally without backend processing
      const newPDFs = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        file: file,
        type: uploadType,
        url: URL.createObjectURL(file),
        uploadDate: new Date(),
        size: file.size,
        pages: Math.floor(Math.random() * 50) + 1, // Mock page count
        isFavorite: false,
        viewCount: 0,
      }))

      setUploadedPDFs((prev) => [...prev, ...newPDFs])
      setShowUploadDialog(false)

      // Auto-select the first uploaded PDF if none selected
      if (!selectedPdf && newPDFs.length > 0) {
        loadPDF(newPDFs[0])
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Show user-friendly message
      alert('Backend is not available. Files uploaded in offline mode. Some features may be limited.')
    }
  }

  const toggleFavorite = (pdfId: number) => {
    setUploadedPDFs(prev => 
      prev.map(pdf => 
        pdf.id === pdfId ? { ...pdf, isFavorite: !pdf.isFavorite } : pdf
      )
    )
  }

  const incrementViewCount = (pdfId: number) => {
    setUploadedPDFs(prev => 
      prev.map(pdf => 
        pdf.id === pdfId ? { ...pdf, viewCount: pdf.viewCount + 1 } : pdf
      )
    )
  }

  const getFilteredAndSortedPDFs = () => {
    let filtered = uploadedPDFs

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(pdf => 
        pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(pdf => pdf.type === filterType)
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        break
      case "date":
        filtered = [...filtered].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
        break
      case "size":
        filtered = [...filtered].sort((a, b) => b.size - a.size)
        break
      case "favorite":
        filtered = [...filtered].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite))
        break
      case "views":
        filtered = [...filtered].sort((a, b) => b.viewCount - a.viewCount)
        break
    }

    return filtered
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const initializePDFViewer = useCallback((pdfFile: File) => {
    console.log("Initializing PDF viewer for:", pdfFile.name)

    const viewerContainer = document.getElementById("adobe-dc-view")
    if (!viewerContainer) {
      console.error("Adobe DC View container not found")
      return
    }

    if (!window.AdobeDC) {
      console.log("🔴 NOT using Adobe PDF Embed API - Using browser fallback")

      // Create blob URL for the PDF file
      const pdfUrl = URL.createObjectURL(pdfFile)

      viewerContainer.innerHTML = `
        <div class="w-full h-full">
          <iframe 
            src="${pdfUrl}" 
            width="100%" 
            height="700px" 
            style="border: 1px solid #374151; border-radius: 8px;"
            title="PDF Viewer"
          >
            <p class="text-red-400 p-4">Your browser does not support PDF viewing. 
            <a href="${pdfUrl}" download="${pdfFile.name}" class="text-blue-400 underline">Download the PDF</a> to view it.</p>
          </iframe>
        </div>
      `

      // Clean up blob URL after a delay to prevent memory leaks
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000)
      return
    }

    try {
      viewerContainer.innerHTML = ""
      viewerContainer.style.height = "700px"
      viewerContainer.style.width = "100%"
      viewerContainer.style.border = "1px solid #374151"
      viewerContainer.style.borderRadius = "8px"

      console.log("Creating Adobe DC View instance...")

      const adobeDCView = new window.AdobeDC.View({
        clientId: "b150312383504c49914036d713d7e4d2",
        divId: "adobe-dc-view",
      })

      console.log("Adobe DC View instance created, reading file...")

      const fileReader = new FileReader()

      fileReader.onload = (e) => {
        try {
          console.log("File read successfully, initializing preview...")
          const arrayBuffer = e.target?.result as ArrayBuffer

          if (!arrayBuffer) {
            throw new Error("Failed to read file as ArrayBuffer")
          }

          adobeDCView.previewFile(
            {
              content: { promise: Promise.resolve(arrayBuffer) },
              metaData: { fileName: pdfFile.name },
            },
            {
              embedMode: "SIZED_CONTAINER",
              defaultViewMode: "FIT_WIDTH",
              showAnnotationTools: false,
              showLeftHandPanel: false,
              showDownloadPDF: false,
              showPrintPDF: false,
              showZoomControl: true,
            },
          )

          console.log("🟢 SUCCESS: Using Adobe PDF Embed API")
        } catch (error) {
          console.error("Error initializing PDF preview:", error)
          const pdfUrl = URL.createObjectURL(pdfFile)
          viewerContainer.innerHTML = `
            <div class="w-full h-full">
              <div class="text-yellow-400 text-sm p-2 mb-2">Adobe PDF viewer failed, using browser fallback</div>
              <iframe 
                src="${pdfUrl}" 
                width="100%" 
                height="650px" 
                style="border: 1px solid #374151; border-radius: 8px;"
                title="PDF Viewer"
              ></iframe>
            </div>
          `
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000)
        }
      }

      fileReader.onerror = (error) => {
        console.error("Error reading PDF file:", error)
        viewerContainer.innerHTML =
          '<div class="flex items-center justify-center h-full text-red-400">Error reading PDF file. Please try again.</div>'
      }

      console.log("Starting to read file as ArrayBuffer...")
      fileReader.readAsArrayBuffer(pdfFile)
    } catch (error) {
      console.error("Error setting up PDF viewer:", error)
      const pdfUrl = URL.createObjectURL(pdfFile)
      viewerContainer.innerHTML = `
        <div class="w-full h-full">
          <div class="text-yellow-400 text-sm p-2 mb-2">PDF viewer setup failed, using browser fallback</div>
          <iframe 
            src="${pdfUrl}" 
            width="100%" 
            height="650px" 
            style="border: 1px solid #374151; border-radius: 8px;"
            title="PDF Viewer"
          ></iframe>
        </div>
      `
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000)
    }
  }, [])

  const loadPDF = async (pdf: UploadedPDF) => {
    console.log("Loading PDF:", pdf.name)
    setSelectedPdf(pdf)
    incrementViewCount(pdf.id)

    try {
      if (pdf.file) {
        setTimeout(() => initializePDFViewer(pdf.file!), 200)
      }

      // If we have a current job ID, get related sections and insights
      if (currentJobId) {
        try {
          // Get related sections for the first section (you might want to make this more specific)
          await getRelatedSections(currentJobId, "section-1")
          
          // Generate insights
          await generateInsights(currentJobId, {
            persona: "Student",
            jobToBeDone: "Learn and understand the content",
          })
        } catch (error) {
          console.error("Error fetching related data:", error)
          // Fallback to mock data
          setRelatedSections([
            {
              title: "Introduction to Machine Learning",
              document: "ML_Basics.pdf",
              relevance: 0.92,
              snippet: "Foundational concepts that directly relate to the current section's discussion on neural networks.",
            },
            {
              title: "Data Preprocessing Techniques",
              document: "Data_Science_Guide.pdf",
              relevance: 0.87,
              snippet: "Essential preprocessing steps mentioned in the current context for model preparation.",
            },
          ])

          setInsights([
            {
              type: "key_insight",
              title: "Core Concept",
              content: "This section introduces fundamental principles that form the backbone of modern AI systems.",
            },
            {
              type: "did_you_know",
              title: "Historical Context",
              content:
                "The techniques described here were first developed in the 1980s but gained prominence with increased computational power.",
            },
          ])
        }
      } else {
        // No job ID available (offline mode), use mock data
        setRelatedSections([
          {
            title: "Introduction to Machine Learning",
            document: "ML_Basics.pdf",
            relevance: 0.92,
            snippet: "Foundational concepts that directly relate to the current section's discussion on neural networks.",
          },
          {
            title: "Data Preprocessing Techniques",
            document: "Data_Science_Guide.pdf",
            relevance: 0.87,
            snippet: "Essential preprocessing steps mentioned in the current context for model preparation.",
          },
        ])

        setInsights([
          {
            type: "key_insight",
            title: "Core Concept",
            content: "This section introduces fundamental principles that form the backbone of modern AI systems.",
          },
          {
            type: "did_you_know",
            title: "Historical Context",
            content:
              "The techniques described here were first developed in the 1980s but gained prominence with increased computational power.",
          },
        ])
      }
    } catch (error) {
      console.error("Error loading PDF:", error)
    }
  }

  const generatePodcast = async () => {
    if (!currentJobId) return

    try {
      await executePodcastGeneration(currentJobId, {
        duration: 180, // 3 minutes
        voice: "en-US-JennyNeural",
        format: "mp3",
        content: selectedPdf?.name || "Document content",
        relatedSections,
        insights,
      })
      
      if (podcastData) {
        setPodcastUrl(podcastData.audioUrl)
      }
    } catch (error) {
      console.error("Error generating podcast:", error)
      // Fallback to sample podcast
      setPodcastUrl("/api/sample-podcast.mp3")
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const removePDF = (pdfId: number) => {
    setUploadedPDFs((prev) => prev.filter((pdf) => pdf.id !== pdfId))
    if (selectedPdf?.id === pdfId) {
      setSelectedPdf(null)
      setRelatedSections([])
      setInsights([])
      setPodcastUrl(null)
    }
  }

  const filteredPDFs = getFilteredAndSortedPDFs()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white p-4 text-center animate-in slide-in-from-top duration-500">
          <div className="container mx-auto flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-medium">Welcome to Adobe Learn! Upload your first PDF to get started with AI-powered learning.</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowWelcome(false)}
              className="ml-4 border-white text-white hover:bg-white hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center animate-pulse">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Adobe Learn</h1>
              <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-600/30">
                AI Powered
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View learning analytics and insights</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload PDFs
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload PDF Documents
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Upload Type</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant={uploadType === "fresh" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUploadType("fresh")}
                          className={
                            uploadType === "fresh" ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-300"
                          }
                        >
                          Fresh Document
                        </Button>
                        <Button
                          variant={uploadType === "library" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUploadType("library")}
                          className={
                            uploadType === "library" ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-300"
                          }
                        >
                          Add to Library
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pdf-upload" className="text-white">
                        Select PDF Files
                      </Label>
                      <Input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="bg-gray-700" />
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      {uploadedPDFs.length > 0 && (
        <div className="border-b border-gray-800 bg-gray-850">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Filters and View Mode */}
              <div className="flex items-center space-x-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="fresh">Fresh</option>
                  <option value="library">Library</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="date">Date Added</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                  <option value="favorite">Favorites</option>
                  <option value="views">Most Viewed</option>
                </select>

                <div className="flex border border-gray-600 rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-r-none ${viewMode === "grid" ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-l-none ${viewMode === "list" ? "bg-red-600 hover:bg-red-700" : "hover:bg-gray-700"}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Management Bar */}
      {uploadedPDFs.length > 0 && (
        <div className="border-b border-gray-800 bg-gray-850">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                Your Documents ({filteredPDFs.length})
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FileText className="w-4 h-4" />
                <span>{uploadedPDFs.length} total</span>
              </div>
            </div>
            
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredPDFs.map((pdf) => (
                  <Card
                    key={pdf.id}
                    className={`bg-gray-700 border-gray-600 hover:border-red-500/50 transition-all duration-200 cursor-pointer ${
                      selectedPdf?.id === pdf.id ? "ring-2 ring-red-500" : ""
                    }`}
                    onClick={() => loadPDF(pdf)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-12 bg-red-600 rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(pdf.id)
                            }}
                            className={`w-8 h-8 p-0 ${pdf.isFavorite ? "text-yellow-400" : "text-gray-400"}`}
                          >
                            <Star className={`w-4 h-4 ${pdf.isFavorite ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              removePDF(pdf.id)
                            }}
                            className="w-8 h-8 p-0 text-gray-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-white text-sm mb-2 line-clamp-2">{pdf.name}</h3>
                      
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>Type</span>
                          <Badge variant="secondary" className="text-xs">
                            {pdf.type === "fresh" ? "Fresh" : "Library"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Size</span>
                          <span>{formatFileSize(pdf.size)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pages</span>
                          <span>{pdf.pages || "?"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Views</span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {pdf.viewCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="flex space-x-3">
                  {filteredPDFs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors min-w-max ${
                        selectedPdf?.id === pdf.id
                          ? "bg-red-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                      onClick={() => loadPDF(pdf)}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium truncate max-w-32">{pdf.name}</span>
                      <Badge variant={pdf.type === "fresh" ? "default" : "secondary"} className="text-xs">
                        {pdf.type === "fresh" ? "Fresh" : "Library"}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(pdf.id)
                          }}
                          className={`w-6 h-6 p-0 ${pdf.isFavorite ? "text-yellow-400" : "text-gray-400"}`}
                        >
                          <Star className={`w-3 h-3 ${pdf.isFavorite ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePDF(pdf.id)
                          }}
                          className="w-6 h-6 p-0 hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Content Tabs */}
            <Tabs defaultValue="viewer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-700 border-gray-600">
                <TabsTrigger 
                  value="viewer" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Viewer
                </TabsTrigger>
                <TabsTrigger 
                  value="graph" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Knowledge Graph
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  AI Insights
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="viewer" className="mt-6">
                {/* PDF Viewer */}
                <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Document Viewer</span>
                  <div className="flex space-x-2">
                    <Dialog open={showInsights} onOpenChange={setShowInsights}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          disabled={!selectedPdf || isLoadingInsights}
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          {isLoadingInsights ? "Generating..." : "Insights"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-white">AI Insights</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-96">
                          <div className="space-y-4">
                            {insights.map((insight, index) => (
                              <Card key={index} className="bg-gray-700 border-gray-600">
                                <CardContent className="p-4">
                                  <div className="flex items-start space-x-3">
                                    <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                                    <div>
                                      <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                                      <p className="text-gray-300 text-sm">{insight.content}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      onClick={generatePodcast}
                      disabled={!selectedPdf || isGeneratingPodcast}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Headphones className="w-4 h-4 mr-2" />
                      {isGeneratingPodcast ? "Generating..." : "Podcast"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPdf ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-white">{selectedPdf.name}</h3>
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                          {formatFileSize(selectedPdf.size)}
                        </Badge>
                        {selectedPdf.pages && (
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                            {selectedPdf.pages} pages
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setShowInsights(true)} className="bg-red-600 hover:bg-red-700">
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Insights
                        </Button>
                        <Button
                          onClick={generatePodcast}
                          disabled={isGeneratingPodcast}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Headphones className="w-4 h-4 mr-2" />
                          Podcast
                        </Button>
                      </div>
                    </div>
                    <div
                      id="adobe-dc-view"
                      className="w-full bg-white rounded-lg border border-gray-600"
                      style={{ height: "700px", minHeight: "700px" }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg p-8 text-center min-h-96">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No PDF selected</p>
                    <Button onClick={() => setShowUploadDialog(true)} className="bg-red-600 hover:bg-red-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Podcast Player */}
            {(isGeneratingPodcast || podcastUrl) && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Headphones className="w-5 h-5 mr-2" />
                    Podcast Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGeneratingPodcast ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Generating audio overview...</span>
                        <span>{podcastProgress}%</span>
                      </div>
                      <Progress value={podcastProgress} className="bg-gray-700" />
                    </div>
                  ) : podcastUrl ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Button size="sm" onClick={togglePlayback} className="bg-purple-600 hover:bg-purple-700">
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            AI-Generated Overview: {selectedPdf?.name}
                          </div>
                          <div className="text-xs text-gray-400">Duration: ~3 minutes</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <audio
                        ref={audioRef}
                        src={podcastUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full"
                        controls
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
              </TabsContent>
              
              <TabsContent value="graph" className="mt-6">
                <KnowledgeGraph />
              </TabsContent>
              
              <TabsContent value="insights" className="mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      AI Insights & Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">AI-powered insights and analysis coming soon!</p>
                      <p className="text-gray-500 text-sm">This tab will contain advanced AI analysis features including Q&A, ELI5 explanations, and more.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Sections */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Related Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRelated ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : relatedSections.length > 0 ? (
                  <div className="space-y-4">
                    {relatedSections.map((section, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white text-sm">{section.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(section.relevance * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{section.document}</p>
                        <p className="text-xs text-gray-300">{section.snippet}</p>
                        <div className="flex items-center justify-end mt-2">
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Upload documents to see related sections</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  Session Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Documents</span>
                  </div>
                  <span className="text-sm font-medium text-white">{uploadedPDFs.length}</span>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Insights</span>
                  </div>
                  <span className="text-sm font-medium text-white">{insights.length}</span>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Favorites</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {uploadedPDFs.filter(pdf => pdf.isFavorite).length}
                  </span>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Session Time</span>
                  </div>
                  <span className="text-sm font-medium text-white">{Math.floor(Date.now() / 60000) % 60}m</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload More PDFs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
