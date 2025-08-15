'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Download, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Search,
  Info,
  Calendar,
  File,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Database,
  ExternalLink
} from "lucide-react"
import AdobePDFViewer from './AdobePDFViewer'
import { AdobePDFUtils, ADOBE_CONFIG } from '@/lib/adobe-config'

interface FileViewerProps {
  file: {
    id: string
    name: string
    content: string
    uploadedAt: Date
    jobId?: string
    type?: string
    size?: number
    url?: string
  }
  onClose?: () => void
  onTextSelect?: (text: string) => void
}

interface FileMetadata {
  name: string
  type: string
  size: string
  uploadedAt: string
  pages?: number
  dimensions?: string
  encoding?: string
}

const FileViewer: React.FC<FileViewerProps> = ({ 
  file, 
  onClose, 
  onTextSelect 
}) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('view')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Determine file type based on name and content
  const getFileType = (): string => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '')) return 'image'
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension || '')) return 'video'
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension || '')) return 'audio'
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) return 'archive'
    if (['json', 'xml', 'csv', 'txt', 'md'].includes(extension || '')) return 'text'
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(extension || '')) return 'code'
    return 'document'
  }

  // Check if file is supported by Adobe PDF Embed API
  const isAdobeSupported = AdobePDFUtils.isSupportedFile(file.name)

  const fileType = getFileType()

  // Generate file metadata
  const getFileMetadata = (): FileMetadata => {
    const size = file.size || file.content.length
    const sizeInKB = Math.round(size / 1024)
    const sizeInMB = (size / (1024 * 1024)).toFixed(2)
    
    return {
      name: file.name,
      type: fileType,
      size: size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`,
      uploadedAt: file.uploadedAt.toLocaleString(),
      pages: fileType === 'pdf' ? Math.ceil(file.content.length / 2000) : undefined,
      dimensions: fileType === 'image' ? '1920x1080' : undefined,
      encoding: 'UTF-8'
    }
  }

  const metadata = getFileMetadata()

  // If it's a PDF and Adobe is supported, use Adobe PDF Viewer
  if (fileType === 'pdf' && isAdobeSupported) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <AdobePDFViewer
          file={file}
          onClose={onClose}
          onTextSelect={onTextSelect}
          clientId={ADOBE_CONFIG.CLIENT_ID}
        />
      </div>
    )
  }

  // Handle text search
  const handleSearch = () => {
    if (!searchTerm.trim() || !contentRef.current) return

    const content = contentRef.current.textContent || ''
    const regex = new RegExp(searchTerm, 'gi')
    const matches = [...content.matchAll(regex)]
    
    setSearchResults(matches.map(match => match.index || 0))
    setCurrentSearchIndex(0)
    
    if (matches.length > 0) {
      highlightSearchResult(0)
    }
  }

  const highlightSearchResult = (index: number) => {
    if (!contentRef.current || searchResults.length === 0) return

    const content = contentRef.current
    const textNodes = getTextNodes(content)
    let currentPos = 0
    let targetPos = searchResults[index]

    for (const node of textNodes) {
      const nodeLength = node.textContent?.length || 0
      if (currentPos + nodeLength > targetPos) {
        // Found the node containing our search result
        const offset = targetPos - currentPos
        const range = document.createRange()
        range.setStart(node, offset)
        range.setEnd(node, offset + searchTerm.length)
        
        // Clear previous highlights
        const highlights = content.querySelectorAll('.search-highlight')
        highlights.forEach(h => h.classList.remove('search-highlight'))
        
        // Add new highlight
        const span = document.createElement('span')
        span.className = 'search-highlight bg-yellow-300'
        range.surroundContents(span)
        
        // Scroll to the highlighted text
        span.scrollIntoView({ behavior: 'smooth', block: 'center' })
        break
      }
      currentPos += nodeLength
    }
  }

  const getTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = []
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let node
    while (node = walker.nextNode()) {
      textNodes.push(node as Text)
    }
    
    return textNodes
  }

  const nextSearchResult = () => {
    if (currentSearchIndex < searchResults.length - 1) {
      const nextIndex = currentSearchIndex + 1
      setCurrentSearchIndex(nextIndex)
      highlightSearchResult(nextIndex)
    }
  }

  const prevSearchResult = () => {
    if (currentSearchIndex > 0) {
      const prevIndex = currentSearchIndex - 1
      setCurrentSearchIndex(prevIndex)
      highlightSearchResult(prevIndex)
    }
  }

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0 && onTextSelect) {
      onTextSelect(selection.toString().trim())
    }
  }

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300))
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const resetZoom = () => setZoom(100)

  // Rotation controls
  const rotateRight = () => setRotation(prev => (prev + 90) % 360)
  const rotateLeft = () => setRotation(prev => (prev - 90 + 360) % 360)

  // Download file
  const handleDownload = () => {
    if (file.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.click()
    } else {
      // Create downloadable content
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  // Render file content based on type
  const renderFileContent = () => {
    switch (fileType) {
      case 'pdf':
        return (
          <div className="w-full h-full">
            <iframe
              src={file.url || `data:application/pdf;base64,${btoa(file.content)}`}
              className="w-full h-full border-0"
              title={file.name}
            />
          </div>
        )
      
      case 'image':
        return (
          <div className="flex justify-center items-center h-full">
            <img
              src={file.url || `data:image/png;base64,${btoa(file.content)}`}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
        )
      
      case 'video':
        return (
          <div className="flex justify-center items-center h-full">
            <video
              src={file.url}
              controls
              className="max-w-full max-h-full"
              title={file.name}
            />
          </div>
        )
      
      case 'audio':
        return (
          <div className="flex justify-center items-center h-full p-8">
            <audio
              src={file.url}
              controls
              className="w-full max-w-md"
              title={file.name}
            />
          </div>
        )
      
      case 'code':
        return (
          <ScrollArea className="h-full">
            <pre className="p-4 text-sm font-mono bg-gray-50 dark:bg-gray-900">
              <code>{file.content}</code>
            </pre>
          </ScrollArea>
        )
      
      default:
        return (
          <ScrollArea className="h-full">
            <div
              ref={contentRef}
              className="p-4 text-sm leading-relaxed whitespace-pre-wrap"
              onMouseUp={handleTextSelection}
              style={{ fontSize: `${zoom / 100}em` }}
            >
              {file.content}
            </div>
          </ScrollArea>
        )
    }
  }

  // Get file type icon
  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500" />
      case 'image': return <Image className="h-6 w-6 text-green-500" />
      case 'video': return <Video className="h-6 w-6 text-blue-500" />
      case 'audio': return <Music className="h-6 w-6 text-purple-500" />
      case 'archive': return <Archive className="h-6 w-6 text-orange-500" />
      case 'code': return <Code className="h-6 w-6 text-indigo-500" />
      default: return <File className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <CardTitle className="text-lg">{file.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="secondary">{fileType.toUpperCase()}</Badge>
                  <span>•</span>
                  <span>{metadata.size}</span>
                  <span>•</span>
                  <span>{metadata.uploadedAt}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="view">View</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="flex-1 flex flex-col min-h-0">
              {/* Toolbar */}
              <div className="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-gray-900">
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-[60px] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={resetZoom}>
                  Reset
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm" onClick={rotateLeft}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={rotateRight}>
                  <RotateCw className="h-4 w-4 rotate-180" />
                </Button>
              </div>

              {/* File Content */}
              <div className="flex-1 min-h-0">
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  renderFileContent()
                )}
              </div>
            </TabsContent>

            <TabsContent value="search" className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 p-2 border-b">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search in document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button onClick={handleSearch}>Search</Button>
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={prevSearchResult}>
                      ↑
                    </Button>
                    <span className="text-sm">
                      {currentSearchIndex + 1} of {searchResults.length}
                    </span>
                    <Button variant="outline" size="sm" onClick={nextSearchResult}>
                      ↓
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                {renderFileContent()}
              </div>
            </TabsContent>

            <TabsContent value="info" className="flex-1">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">File Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span>{metadata.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{metadata.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span>{metadata.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uploaded:</span>
                        <span>{metadata.uploadedAt}</span>
                      </div>
                      {metadata.pages && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pages:</span>
                          <span>{metadata.pages}</span>
                        </div>
                      )}
                      {metadata.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span>{metadata.dimensions}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Encoding:</span>
                        <span>{metadata.encoding}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Analysis Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Job ID:</span>
                        <span>{file.jobId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Content Length:</span>
                        <span>{file.content.length} characters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Words:</span>
                        <span>{file.content.split(/\s+/).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lines:</span>
                        <span>{file.content.split('\n').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default FileViewer
