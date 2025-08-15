'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import InsightsPanel from "./InsightsPanel"
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Info,
  Calendar,
  File,
  Settings,
  Share,
  Bookmark,
  Printer,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  ExternalLink,
  Lightbulb,
  Volume2,
  BookOpen
} from "lucide-react"

// Adobe PDF Embed API types
declare global {
  interface Window {
    AdobeDC?: {
      View: {
        new (config: any): any
      }
    }
  }
}

interface AdobePDFViewerProps {
  file: {
    id: string
    name: string
    content?: string
    url?: string
    uploadedAt: Date
    jobId?: string
    type?: string
    size?: number
  }
  onClose?: () => void
  onTextSelect?: (text: string) => void
  clientId?: string // Adobe PDF Embed API Client ID
}

interface ViewerConfig {
  clientId: string
  divId: string
  documentOpenParams: {
    navBar: {
      download: boolean
      print: boolean
      fullScreen: boolean
      bookmark: boolean
      secondaryToolbar: boolean
      leftPanel: boolean
      rightPanel: boolean
    }
    defaultViewMode: string
    showDownloadPDF: boolean
    showPrintPDF: boolean
    showLeftHandPanel: boolean
    showAnnotationTools: boolean
    enableFormFilling: boolean
    showBookmarks: boolean
    showSecondaryToolbar: boolean
    showFindBar: boolean
    showPageControls: boolean
    showZoomControls: boolean
    showThumbnails: boolean
    showBorders: boolean
    showPageShadow: boolean
  }
}

const AdobePDFViewer: React.FC<AdobePDFViewerProps> = ({ 
  file, 
  onClose, 
  onTextSelect,
  clientId = "a2d7f06cea0c43f09a17bea4c32c9e93" // Use the configured Adobe Client ID
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewer, setViewer] = useState<any>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [showInsights, setShowInsights] = useState(false)
  const [selectedText, setSelectedText] = useState<string>('')
  
  const viewerRef = useRef<HTMLDivElement>(null)
  const adobeScriptRef = useRef<HTMLScriptElement | null>(null)

  // Load Adobe PDF Embed API script
  useEffect(() => {
    if (!adobeScriptRef.current) {
      // Only load Adobe script if a URL is provided
      if (file.url) {
        const script = document.createElement('script')
        script.src = 'https://documentcloud.adobe.com/view-sdk/main.js'
        script.async = true
        script.onload = () => {
          console.log('Adobe PDF Embed API loaded successfully')
          setIsLoading(false)
        }
        script.onerror = () => {
          setError('Failed to load Adobe PDF Embed API')
          setIsLoading(false)
        }
        adobeScriptRef.current = script
        document.head.appendChild(script)
      } else {
        setIsLoading(false); // No need to load if no URL
      }
    }

    return () => {
      if (adobeScriptRef.current) {
        document.head.removeChild(adobeScriptRef.current)
        adobeScriptRef.current = null
      }
    }
  }, [file.url])

  // Handle text selection from PDF
  const handleTextSelect = useCallback((text: string) => {
    console.log('Text selected:', text)
    setSelectedText(text)
    if (onTextSelect) {
      onTextSelect(text)
    }
    
    // Show a brief visual feedback
    if (text && text.trim()) {
      // You could add a toast notification here if you have a toast system
      console.log(`✅ Text selected: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`)
    }
  }, [onTextSelect])

  // Enhanced text selection detection that works with Adobe PDF Embed API
  const detectSelectedText = useCallback(() => {
    let selectedText = ''
    
    // Method 1: Standard selection
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      selectedText = selection.toString().trim()
      console.log('Method 1 - Standard selection:', selectedText)
    }
    
    // Method 2: Check Adobe PDF iframe with multiple selectors
    if (!selectedText) {
      try {
        // Try multiple selectors for Adobe PDF iframe
        const pdfIframeSelectors = [
          'iframe[title*="PDF"]',
          'iframe[src*="adobe"]', 
          'iframe[id*="pdf"]',
          'iframe[src*="documentcloud"]',
          'iframe[src*="view-sdk"]',
          'iframe[class*="pdf"]',
          'iframe[class*="adobe"]'
        ]
        
        for (const selector of pdfIframeSelectors) {
          const pdfIframe = document.querySelector(selector) as HTMLIFrameElement
          if (pdfIframe && pdfIframe.contentDocument) {
            const iframeSelection = pdfIframe.contentDocument.getSelection()
            if (iframeSelection && iframeSelection.toString().trim()) {
              selectedText = iframeSelection.toString().trim()
              console.log(`Method 2 - Adobe PDF iframe selection (${selector}):`, selectedText)
              break
            }
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
    
    // Method 4: Check for highlighted elements with more specific selectors
    if (!selectedText) {
      const highlightedSelectors = [
        '[style*="background"]',
        '[class*="highlight"]',
        '[class*="selected"]',
        '[class*="selection"]',
        '[data-selected="true"]',
        '.adobe-pdf-viewer *::selection',
        '.pdf-viewer *::selection'
      ]
      
      for (const selector of highlightedSelectors) {
        try {
          const highlightedElements = document.querySelectorAll(selector)
          if (highlightedElements.length > 0) {
            selectedText = Array.from(highlightedElements).map(el => el.textContent).join(' ').trim()
            if (selectedText) {
              console.log(`Method 4 - Highlighted elements (${selector}):`, selectedText)
              break
            }
          }
        } catch (e) {
          // Ignore invalid selectors
        }
      }
    }
    
    // Method 5: Check clipboard for recently copied text
    if (!selectedText) {
      try {
        navigator.clipboard.readText().then(clipboardText => {
          if (clipboardText && clipboardText.trim()) {
            console.log('Method 5 - Clipboard text:', clipboardText)
            handleTextSelect(clipboardText.trim())
          }
        }).catch(e => {
          console.log('Cannot access clipboard:', e)
        })
      } catch (e) {
        console.log('Clipboard API not available:', e)
      }
    }
    
    if (selectedText) {
      handleTextSelect(selectedText)
    }
    
    return selectedText
  }, [handleTextSelect])

  // Manual text selection handler as fallback
  const handleManualTextSelection = useCallback(() => {
    const detectedText = detectSelectedText()
    if (!detectedText) {
      console.log('No text selection detected')
    }
  }, [detectSelectedText])

  // Set up text selection detection
  const setupTextSelectionDetection = useCallback(() => {
    console.log('Setting up enhanced text selection detection')
    
    // Add event listeners to the PDF viewer container
    const viewerContainer = viewerRef.current
    if (viewerContainer) {
      // Listen for mouse up events (when user finishes selecting text)
      const handleMouseUp = () => {
        setTimeout(() => {
          detectSelectedText()
        }, 200) // Increased delay to ensure selection is complete
      }

      // Listen for mouse down events (when user starts selecting)
      const handleMouseDown = () => {
        setTimeout(() => {
          detectSelectedText()
        }, 100)
      }

      // Listen for key up events (for keyboard-based selection)
      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Shift' || e.key === 'Control') {
          setTimeout(() => {
            detectSelectedText()
          }, 150)
        }
      }

      // Listen for selection change events
      const handleSelectionChange = () => {
        detectSelectedText()
      }

      // Listen for copy events (when user copies selected text)
      const handleCopy = () => {
        setTimeout(() => {
          detectSelectedText()
        }, 100)
      }

      // Add event listeners to both viewer container and document
      viewerContainer.addEventListener('mouseup', handleMouseUp)
      viewerContainer.addEventListener('mousedown', handleMouseDown)
      viewerContainer.addEventListener('keyup', handleKeyUp)
      viewerContainer.addEventListener('copy', handleCopy)
      document.addEventListener('selectionchange', handleSelectionChange)
      document.addEventListener('mouseup', handleMouseUp) // Also listen on document level
      document.addEventListener('copy', handleCopy) // Also listen on document level

      // More frequent periodic check for text selection (fallback)
      const selectionCheckInterval = setInterval(() => {
        detectSelectedText()
      }, 500) // Check every 500ms for faster response

      // Clean up function
      return () => {
        viewerContainer.removeEventListener('mouseup', handleMouseUp)
        viewerContainer.removeEventListener('mousedown', handleMouseDown)
        viewerContainer.removeEventListener('keyup', handleKeyUp)
        viewerContainer.removeEventListener('copy', handleCopy)
        document.removeEventListener('selectionchange', handleSelectionChange)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('copy', handleCopy)
        clearInterval(selectionCheckInterval)
      }
    }
  }, [detectSelectedText])

  // Initialize Adobe PDF Viewer
  useEffect(() => {
    if (!window.AdobeDC || !viewerRef.current) {
      return
    }

    // If no URL is available, show fallback content
    if (!file.url) {
      setIsLoading(false)
      return
    }

    let cleanup: (() => void) | undefined

    // Add global text selection listener with enhanced detection
    const handleGlobalSelection = () => {
      detectSelectedText()
    }

    // Add multiple event listeners for better text selection detection
    document.addEventListener('selectionchange', handleGlobalSelection)
    document.addEventListener('mouseup', handleGlobalSelection)
    document.addEventListener('keyup', handleGlobalSelection)
    document.addEventListener('copy', handleGlobalSelection)
    
    // Add a more aggressive text selection detection for Adobe PDF iframes
    const checkForAdobeSelection = () => {
      try {
        const iframes = document.querySelectorAll('iframe')
        for (const iframe of iframes) {
          const iframeElement = iframe as HTMLIFrameElement
          if (iframeElement.contentDocument) {
            const iframeSelection = iframeElement.contentDocument.getSelection()
            if (iframeSelection && iframeSelection.toString().trim()) {
              const selectedText = iframeSelection.toString().trim()
              console.log('Adobe iframe selection detected:', selectedText)
              handleTextSelect(selectedText)
              break
            }
          }
        }
      } catch (e) {
        // Ignore CORS errors
      }
    }
    
    // Check for Adobe iframe selection every 500ms
    const adobeSelectionInterval = setInterval(checkForAdobeSelection, 500)

    const initializeViewer = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('Initializing Adobe PDF Viewer with URL:', file.url)
        console.log('Client ID:', clientId)

        // Configure Adobe PDF Embed API with correct format
        const config = {
          clientId: clientId,
          divId: viewerRef.current!.id
        }

        console.log('Adobe PDF Viewer config:', config)

        // Wait a bit for the script to fully load
        await new Promise(resolve => setTimeout(resolve, 100))

        // Create Adobe PDF Viewer using the correct API
        const adobeViewer = new window.AdobeDC!.View(config)
        
        // Set loading to false after a short delay to allow the viewer to initialize
        setTimeout(() => {
          setIsLoading(false)
          // Set up text selection detection after viewer is ready
          cleanup = setupTextSelectionDetection()
        }, 2000)

        // Open the document using the correct Adobe PDF Embed API format
        console.log('Opening document with URL:', file.url)
        await adobeViewer.previewFile({
          content: {
            location: {
              url: file.url
            }
          },
          metaData: {
            fileName: file.name
          }
        }, {
          defaultViewMode: "FIT_WIDTH",
          showDownloadPDF: true,
          showPrintPDF: true,
          showLeftHandPanel: true,
          showAnnotationTools: true,
          enableFormFilling: true,
          showBookmarks: true,
          showSecondaryToolbar: true,
          showFindBar: true,
          showPageControls: true,
          showZoomControls: true,
          showThumbnails: true,
          showBorders: true,
          showPageShadow: true,
          // Add custom event handlers for text selection
          enableTextSelection: true,
          enableCopy: true
        })

        setViewer(adobeViewer)

      } catch (err) {
        console.error('Error initializing Adobe PDF Viewer:', err)
        
        // Try to provide more specific error messages
        let errorMessage = 'Failed to initialize PDF viewer'
        if (err instanceof Error) {
          if (err.message.includes('clientId')) {
            errorMessage = 'Invalid Adobe Client ID. Please check your configuration.'
          } else if (err.message.includes('url')) {
            errorMessage = 'Invalid PDF URL. Please check if the file is accessible.'
          } else if (err.message.includes('network')) {
            errorMessage = 'Network error. Please check your internet connection.'
          } else {
            errorMessage = `PDF viewer error: ${err.message}`
          }
        }
        
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure the script is fully loaded
    const timer = setTimeout(() => {
      initializeViewer()
    }, 500)

    return () => {
      clearTimeout(timer)
      if (cleanup) {
        cleanup()
      }
      // Remove global listeners
      document.removeEventListener('selectionchange', handleGlobalSelection)
      document.removeEventListener('mouseup', handleGlobalSelection)
      document.removeEventListener('keyup', handleGlobalSelection)
      document.removeEventListener('copy', handleGlobalSelection)
      // Clear Adobe selection interval
      clearInterval(adobeSelectionInterval)
    }
  }, [file.url, clientId, onTextSelect, setupTextSelectionDetection, handleTextSelect])

  // Handle viewer actions
  const handleZoomIn = () => {
    if (viewer) {
      viewer.setZoom(zoom + 25)
      setZoom(zoom + 25)
    }
  }

  const handleZoomOut = () => {
    if (viewer) {
      viewer.setZoom(Math.max(25, zoom - 25))
      setZoom(Math.max(25, zoom - 25))
    }
  }

  const handleFullScreen = () => {
    if (viewer) {
      if (isFullScreen) {
        viewer.exitFullScreen()
      } else {
        viewer.enterFullScreen()
      }
      setIsFullScreen(!isFullScreen)
    }
  }

  const handleDownload = () => {
    if (file.url) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.click()
    }
  }

  const handlePrint = () => {
    if (viewer) {
      viewer.print()
    }
  }

  // Toggle insights panel
  const toggleInsights = () => {
    setShowInsights(!showInsights)
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Force re-initialization by updating the URL dependency
    const currentUrl = file.url
    if (currentUrl) {
      // Small delay to ensure clean state
      setTimeout(() => {
        const initializeViewer = async () => {
          try {
            console.log('Retrying Adobe PDF Viewer initialization...')
            
            if (!window.AdobeDC || !viewerRef.current) {
              throw new Error('Adobe PDF Embed API not loaded')
            }

                         const config = {
               clientId: clientId,
               divId: viewerRef.current!.id
             }

                         const adobeViewer = new window.AdobeDC!.View(config)
             
             // Set loading to false after a short delay to allow the viewer to initialize
             setTimeout(() => {
               setIsLoading(false)
             }, 1000)

                         await adobeViewer.previewFile({
               content: {
                 location: {
                   url: currentUrl
                 }
               },
               metaData: {
                 fileName: file.name
               }
             }, {
               defaultViewMode: "FIT_WIDTH",
               showDownloadPDF: true,
               showPrintPDF: true,
               showLeftHandPanel: true,
               showAnnotationTools: true,
               enableFormFilling: true,
               showBookmarks: true,
               showSecondaryToolbar: true,
               showFindBar: true,
               showPageControls: true,
               showZoomControls: true,
               showThumbnails: true,
               showBorders: true,
               showPageShadow: true
             })

            setViewer(adobeViewer)

          } catch (err) {
            console.error('Retry failed:', err)
            setError('Retry failed. Please check your configuration.')
            setIsLoading(false)
          }
        }

        initializeViewer()
      }, 100)
    }
  }

  // Generate file metadata
  const getFileMetadata = () => {
    // Use file size if available, otherwise calculate from content
    const size = file.size || (file.content ? file.content.length : 0)
    const sizeInKB = Math.round(size / 1024)
    const sizeInMB = (size / (1024 * 1024)).toFixed(2)
    
    return {
      name: file.name,
      type: file.url ? 'PDF Document' : 'Text Content',
      size: size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`,
      uploadedAt: file.uploadedAt.toLocaleString(),
             pages: file.url ? 'PDF View' : 'Text View',
      format: file.url ? 'PDF' : 'Text'
    }
  }

  const metadata = getFileMetadata()

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Adobe PDF Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error}. Please check your Adobe Client ID configuration and ensure the PDF file is accessible.
            </AlertDescription>
          </Alert>
                     <div className="mt-4 flex gap-2">
             <Button onClick={onClose} variant="outline">
               Close
             </Button>
             <Button onClick={handleRetry}>
               Retry
             </Button>
           </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <div>
              <CardTitle>{file.name}</CardTitle>
                             <CardDescription>
                 {file.url ? `Adobe PDF Viewer | Zoom: ${zoom}%` : 'Document Content Viewer'}
               </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{metadata.type}</Badge>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Button onClick={handleZoomOut} variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{zoom}%</span>
            <Button onClick={handleZoomIn} variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button onClick={handleFullScreen} variant="outline" size="sm">
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
          
                     <div className="flex items-center gap-2">
             <Button onClick={handleDownload} variant="outline" size="sm" disabled={!file.url}>
               <Download className="h-4 w-4" />
               Download
             </Button>
             <Button onClick={handlePrint} variant="outline" size="sm" disabled={!file.url}>
               <Printer className="h-4 w-4" />
               Print
             </Button>
                           <Button onClick={toggleInsights} variant="outline" size="sm" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Insights
              </Button>
                             <Button 
                 onClick={handleManualTextSelection} 
                 variant="outline" 
                 size="sm" 
                 className="flex items-center gap-2"
                 title="Check for selected text"
               >
                 <Search className="h-4 w-4" />
                 Check Selection
               </Button>
               <Button 
                 onClick={() => {
                   const text = prompt('Enter selected text manually:')
                   if (text && text.trim()) {
                     handleTextSelect(text.trim())
                   }
                 }} 
                 variant="outline" 
                 size="sm" 
                 className="flex items-center gap-2"
                 title="Manually enter selected text"
               >
                 <BookOpen className="h-4 w-4" />
                 Manual Input
               </Button>
             <Button variant="outline" size="sm">
               <Share className="h-4 w-4" />
               Share
             </Button>
           </div>
        </div>

        {/* File Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-xs text-muted-foreground">{metadata.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Size</p>
              <p className="text-xs text-muted-foreground">{metadata.size}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Uploaded</p>
              <p className="text-xs text-muted-foreground">{metadata.uploadedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Pages</p>
              <p className="text-xs text-muted-foreground">{metadata.pages}</p>
            </div>
          </div>
        </div>

        {/* Adobe PDF Viewer Container */}
        <div className="relative border rounded-lg overflow-hidden bg-white">
          {!file.url ? (
            // Fallback content viewer when no PDF URL is available
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Document Content</h3>
                <Badge variant="secondary">Text View</Badge>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
                  {file.content || 'No content available'}
                </pre>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>This is the extracted text content from your document. The original PDF file is not available for viewing.</p>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Loading Adobe PDF Viewer...</span>
                  </div>
                </div>
              )}
              
                             <div 
                 ref={viewerRef}
                 id={`adobe-pdf-viewer-${file.id}`}
                 className="w-full h-[600px] min-h-[400px]"
                 style={{ 
                   minHeight: '400px',
                   height: isFullScreen ? '80vh' : '600px'
                 }}
                 onMouseUp={handleManualTextSelection}
                 onKeyUp={handleManualTextSelection}
               />
            </>
          )}
        </div>

        {/* Adobe Client ID Notice */}
        {clientId === "YOUR_ADOBE_CLIENT_ID" && (
          <Alert className="mt-4">
            <AlertDescription>
              <strong>Note:</strong> To use Adobe PDF Embed API, you need to configure your Adobe Client ID. 
              Please replace "YOUR_ADOBE_CLIENT_ID" with your actual Adobe Client ID in the component props.
              <br />
              <a 
                href="https://www.adobe.com/go/dcsdks_credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
              >
                Get Adobe Client ID <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
                 )}

         {/* Insights Panel */}
         {showInsights && (
           <div className="mt-6">
             <InsightsPanel 
               file={file}
               selectedText={selectedText}
               onClose={() => setShowInsights(false)}
             />
           </div>
         )}
       </CardContent>
     </Card>
   )
 }

export default AdobePDFViewer
