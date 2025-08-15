# Adobe PDF Embed API Integration

This document provides comprehensive information about the Adobe PDF Embed API integration in the Adobe Learn Platform.

## Overview

The Adobe PDF Embed API integration provides advanced PDF viewing capabilities with features like:
- **Interactive PDF viewing** with zoom, pan, and navigation
- **Text search and highlighting** within documents
- **Annotation tools** for adding comments and markups
- **Form filling** capabilities
- **Bookmark navigation**
- **Print and download** functionality
- **Responsive design** that works on all devices
- **Accessibility features** for screen readers

## Features

### Core PDF Viewing
- **Multi-page navigation** with thumbnail previews
- **Zoom controls** (25% to 400%)
- **Page rotation** (90°, 180°, 270°)
- **Full-screen mode** for immersive reading
- **Fit-to-width and fit-to-page** viewing modes

### Search and Navigation
- **Text search** with highlighting and navigation
- **Bookmark navigation** for quick document access
- **Page thumbnails** for visual navigation
- **Table of contents** support (if available in PDF)

### Annotation Tools
- **Text highlighting** with color options
- **Sticky notes** for comments
- **Drawing tools** for freehand annotations
- **Shape tools** (rectangles, circles, lines)
- **Stamp tools** for approval workflows

### Collaboration Features
- **Comment threads** for discussions
- **Annotation sharing** between users
- **Version tracking** for document changes
- **Export annotations** to separate files

### Accessibility
- **Screen reader support** with ARIA labels
- **Keyboard navigation** for all features
- **High contrast mode** support
- **Text-to-speech** integration

## Setup Instructions

### 1. Get Adobe Client ID

1. Visit the [Adobe Developer Console](https://www.adobe.com/go/dcsdks_credentials)
2. Sign in with your Adobe account
3. Create a new project or select an existing one
4. Add the **PDF Embed API** service to your project
5. Copy your **Client ID** from the credentials section

### 2. Configure the Application

#### Option A: Environment Variable (Recommended)
Create a `.env.local` file in the Frontend directory:

```bash
NEXT_PUBLIC_ADOBE_CLIENT_ID=your_adobe_client_id_here
```

#### Option B: Application Settings
1. Open the application
2. Navigate to the **Settings** tab
3. Enter your Adobe Client ID in the configuration section
4. The ID will be stored in localStorage for persistence

### 3. Restart the Application

After configuring the Client ID, restart the frontend application:

```bash
cd Frontend
npm run dev
```

## Usage

### Basic PDF Viewing

When you upload a PDF document and click the "View" button, the application will:

1. **Check if Adobe PDF Embed API is configured**
2. **Load the Adobe PDF Embed API script** dynamically
3. **Initialize the PDF viewer** with your document
4. **Display the interactive PDF viewer** with full functionality

### Advanced Features

#### Text Selection and Analysis
- **Select text** in the PDF viewer
- **Copy selected text** to clipboard
- **Send selected text** for AI analysis
- **Highlight important sections** for later reference

#### Document Navigation
- **Use bookmarks** for quick navigation
- **Search for specific terms** across the document
- **Navigate between pages** using thumbnails
- **Zoom and pan** for detailed examination

#### Collaboration
- **Add annotations** to documents
- **Share annotated documents** with team members
- **Export annotations** for review
- **Track changes** across document versions

## Technical Implementation

### Components

#### AdobePDFViewer.tsx
The main component that handles Adobe PDF Embed API integration:

```typescript
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
  clientId?: string
}
```

#### adobe-config.ts
Configuration and utility functions for Adobe PDF Embed API:

```typescript
export const ADOBE_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_ADOBE_CLIENT_ID || "YOUR_ADOBE_CLIENT_ID",
  ENDPOINTS: {
    SCRIPT_URL: "https://documentcloud.adobe.com/view-sdk/main.js",
    CREDENTIALS_URL: "https://www.adobe.com/go/dcsdks_credentials"
  },
  // ... more configuration
}
```

### Integration Points

#### FileViewer.tsx
The existing file viewer now automatically detects PDF files and uses Adobe PDF Embed API:

```typescript
// Check if file is supported by Adobe PDF Embed API
const isAdobeSupported = AdobePDFUtils.isSupportedFile(file.name)

// If it's a PDF and Adobe is supported, use Adobe PDF Viewer
if (fileType === 'pdf' && isAdobeSupported) {
  return (
    <AdobePDFViewer
      file={file}
      onClose={onClose}
      onTextSelect={onTextSelect}
      clientId={ADOBE_CONFIG.CLIENT_ID}
    />
  )
}
```

#### Main Application (page.tsx)
The main application includes a Settings tab for Adobe configuration:

```typescript
// Settings tab with Adobe Client ID configuration
<TabsContent value="settings" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Application Settings</CardTitle>
      <CardDescription>
        Configure Adobe PDF Embed API and other application settings
      </CardDescription>
    </CardHeader>
    <CardContent>
      {/* Adobe configuration form */}
    </CardContent>
  </Card>
</TabsContent>
```

## Configuration Options

### Viewer Configuration

The Adobe PDF Embed API supports extensive configuration options:

```typescript
const viewerConfig = {
  clientId: "your_client_id",
  divId: "pdf-viewer-container",
  documentOpenParams: {
    navBar: {
      download: true,
      print: true,
      fullScreen: true,
      bookmark: true,
      secondaryToolbar: true,
      leftPanel: true,
      rightPanel: true
    },
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
  }
}
```

### Event Handling

The viewer supports various events for integration:

```typescript
// Register event handlers
adobeViewer.registerCallback(
  window.AdobeDC.View.Enum.CoreControls.VIEWER_READY,
  () => {
    console.log('Adobe PDF Viewer ready')
  }
)

adobeViewer.registerCallback(
  window.AdobeDC.View.Enum.CoreControls.TEXT_SELECTED,
  (event) => {
    if (onTextSelect && event.selectedText) {
      onTextSelect(event.selectedText)
    }
  }
)
```

## Troubleshooting

### Common Issues

#### 1. "Adobe PDF Embed API is not configured"
**Solution**: Configure your Adobe Client ID in the Settings tab or environment variables.

#### 2. "Failed to load Adobe PDF Embed API"
**Solution**: Check your internet connection and ensure the Adobe script URL is accessible.

#### 3. PDF not displaying
**Solution**: 
- Verify the PDF file is accessible via URL
- Check if the PDF file is corrupted
- Ensure CORS is properly configured for the PDF URL

#### 4. Viewer not responding
**Solution**: 
- Refresh the page
- Clear browser cache
- Check browser console for JavaScript errors

### Debug Mode

Enable debug mode by adding this to your browser console:

```javascript
localStorage.setItem('adobe_debug', 'true')
```

This will provide detailed logging for Adobe PDF Embed API operations.

## Performance Optimization

### Loading Optimization
- **Lazy loading** of Adobe PDF Embed API script
- **Progressive loading** of PDF pages
- **Caching** of viewer instances
- **Memory management** for large documents

### Responsive Design
- **Mobile-optimized** viewer controls
- **Touch gestures** for navigation
- **Adaptive layout** for different screen sizes
- **Performance monitoring** for slow devices

## Security Considerations

### Content Security Policy
Add the following to your CSP headers:

```
script-src 'self' https://documentcloud.adobe.com;
frame-src 'self' https://documentcloud.adobe.com;
```

### CORS Configuration
Ensure your PDF URLs are accessible from your application domain:

```
Access-Control-Allow-Origin: https://your-app-domain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Authentication
For private documents, implement proper authentication:

```typescript
// Add authentication headers to PDF requests
const viewerConfig = {
  // ... other config
  documentOpenParams: {
    // ... other params
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  }
}
```

## API Reference

### AdobePDFUtils Class

#### Static Methods

```typescript
// Check if Adobe API is ready
static isAdobeAPIReady(): boolean

// Load Adobe script
static loadAdobeScript(): Promise<void>

// Create unique viewer ID
static createViewerId(fileId: string): string

// Validate Client ID
static isValidClientId(clientId: string): boolean

// Get file type icon
static getFileTypeIcon(fileType: string): string

// Format file size
static formatFileSize(bytes: number): string

// Generate download URL
static generateDownloadUrl(fileUrl: string, fileName: string): string

// Check if file is supported
static isSupportedFile(fileName: string): boolean

// Get viewer configuration
static getViewerConfig(theme: 'light' | 'dark'): object
```

### Event Types

```typescript
export const ADOBE_EVENTS = {
  VIEWER_READY: "VIEWER_READY",
  PAGE_CHANGED: "PAGE_CHANGED",
  DOCUMENT_OPENED: "DOCUMENT_OPENED",
  TEXT_SELECTED: "TEXT_SELECTED",
  ANNOTATION_ADDED: "ANNOTATION_ADDED",
  ANNOTATION_DELETED: "ANNOTATION_DELETED",
  ANNOTATION_UPDATED: "ANNOTATION_UPDATED",
  BOOKMARK_CLICKED: "BOOKMARK_CLICKED",
  HYPERLINK_CLICKED: "HYPERLINK_CLICKED",
  DOCUMENT_DOWNLOAD: "DOCUMENT_DOWNLOAD",
  DOCUMENT_PRINT: "DOCUMENT_PRINT",
  DOCUMENT_SAVE: "DOCUMENT_SAVE"
}
```

## Future Enhancements

### Planned Features
- **Real-time collaboration** with multiple users
- **Advanced annotation workflows** with approval processes
- **Document comparison** tools
- **OCR integration** for scanned documents
- **Voice annotations** for accessibility
- **Offline viewing** capabilities
- **Advanced search** with semantic understanding

### Integration Opportunities
- **Adobe Creative Cloud** integration
- **Adobe Document Cloud** storage
- **Adobe Sign** for digital signatures
- **Adobe Analytics** for usage tracking
- **Adobe Target** for A/B testing

## Support and Resources

### Official Documentation
- [Adobe PDF Embed API Documentation](https://www.adobe.com/go/dcsdk_APIdocs)
- [Adobe Developer Console](https://www.adobe.com/go/dcsdks_credentials)
- [Adobe PDF Embed API Samples](https://www.adobe.com/go/dcsdk_APIsamples)

### Community Resources
- [Adobe Developer Forums](https://community.adobe.com/t5/adobe-developer/ct-p/adobe-developer)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/adobe-pdf-embed-api)
- [GitHub Examples](https://github.com/adobe/dc-view-sdk-samples)

### Contact Information
For technical support or questions about this integration:
- **Email**: support@adobe.com
- **Developer Support**: https://www.adobe.com/go/dcsdk_support
- **Documentation**: https://www.adobe.com/go/dcsdk_APIdocs

---

**Note**: This integration requires a valid Adobe Client ID and internet connection to function properly. The Adobe PDF Embed API is free for use with proper attribution and compliance with Adobe's terms of service.
