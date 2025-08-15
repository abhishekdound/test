# File Viewer Feature

## Overview

The File Viewer is a comprehensive document viewing component that provides rich functionality for viewing and interacting with uploaded files in the Adobe Learn Platform. It supports multiple file types, advanced search capabilities, zoom controls, and seamless integration with the main application.

## Features

### 🎯 Core Functionality
- **Multi-format Support**: PDF, Images, Videos, Audio, Code, Text, and Documents
- **Advanced Search**: Real-time text search with highlighting and navigation
- **Zoom Controls**: 50% to 300% zoom with smooth transitions
- **Rotation**: Image rotation controls (90° increments)
- **Text Selection**: Select text for analysis integration
- **File Download**: Direct download functionality
- **Responsive Design**: Works on all screen sizes

### 🔍 Search Capabilities
- **Real-time Search**: Instant search results as you type
- **Highlighted Results**: Yellow highlighting of search terms
- **Navigation**: Navigate between multiple search results
- **Result Counter**: Shows current result position and total count
- **Case-insensitive**: Search works regardless of case

### 📊 File Information
- **Metadata Display**: File name, type, size, upload date
- **Content Statistics**: Character count, word count, line count
- **Analysis Data**: Job ID, processing status
- **Technical Details**: Encoding, dimensions (for images)

### 🎨 User Interface
- **Modal Design**: Full-screen modal overlay
- **Tabbed Interface**: View, Search, and Info tabs
- **Toolbar**: Zoom, rotation, and search controls
- **File Type Icons**: Visual indicators for different file types
- **Dark Mode Support**: Consistent with application theme

## File Type Support

| File Type | Extensions | Features |
|-----------|------------|----------|
| **PDF** | `.pdf` | Embedded viewer, page navigation |
| **Images** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg` | Zoom, rotation, full-screen view |
| **Videos** | `.mp4`, `.avi`, `.mov`, `.wmv`, `.flv` | HTML5 video player with controls |
| **Audio** | `.mp3`, `.wav`, `.flac`, `.aac` | HTML5 audio player |
| **Code** | `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cpp`, `.c`, `.html`, `.css` | Syntax highlighting, monospace font |
| **Text** | `.json`, `.xml`, `.csv`, `.txt`, `.md` | Plain text with search |
| **Documents** | Other formats | General document viewer |

## Component Structure

```typescript
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
```

## Usage

### Basic Implementation

```tsx
import FileViewer from '@/components/FileViewer'

function MyComponent() {
  const [viewingFile, setViewingFile] = useState<Document | null>(null)
  
  return (
    <div>
      <button onClick={() => setViewingFile(myDocument)}>
        View File
      </button>
      
      {viewingFile && (
        <FileViewer
          file={viewingFile}
          onClose={() => setViewingFile(null)}
          onTextSelect={(text) => console.log('Selected:', text)}
        />
      )}
    </div>
  )
}
```

### Integration with Main App

The FileViewer is integrated into the main application with:

1. **View Buttons**: Added to document lists and analysis panels
2. **Text Selection**: Selected text is passed back for analysis
3. **Modal State**: Managed through `viewingFile` state
4. **Error Handling**: Graceful fallbacks for missing content

## API Integration

### Backend Endpoints

- `GET /api/frontend/file-content/{jobId}` - Retrieve file content
- `GET /api/frontend/pdf-file/{jobId}` - Serve PDF files
- `GET /api/frontend/status/{jobId}` - Get job status and metadata

### Frontend API Service

```typescript
// Get file content from backend
const fileContent = await apiService.getFileContent(jobId)

// Handle fallback when backend is unavailable
if (fileContent.fallback) {
  // Use local file data
}
```

## Styling

### CSS Classes

- `.search-highlight` - Search result highlighting
- `.file-viewer-modal` - Modal container
- `.file-viewer-toolbar` - Control toolbar
- `.file-viewer-content` - Content area

### Dark Mode Support

The component automatically adapts to dark mode using CSS variables and Tailwind classes.

## Performance Optimizations

### Search Algorithm
- **Efficient Text Search**: Uses TreeWalker for text node traversal
- **Regex Optimization**: Case-insensitive search with global flag
- **Result Caching**: Search results cached for navigation

### Rendering
- **Lazy Loading**: Content loaded only when needed
- **Virtual Scrolling**: For large documents (future enhancement)
- **Memory Management**: Proper cleanup of event listeners

### File Handling
- **Blob URLs**: Efficient file download generation
- **Base64 Encoding**: For embedded file content
- **Error Boundaries**: Graceful error handling

## Accessibility

### Keyboard Navigation
- **Tab Navigation**: All controls accessible via keyboard
- **Enter Key**: Search activation
- **Arrow Keys**: Search result navigation
- **Escape Key**: Modal close

### Screen Reader Support
- **ARIA Labels**: Proper labeling for all controls
- **Semantic HTML**: Meaningful structure and headings
- **Focus Management**: Proper focus handling in modal

## Error Handling

### Backend Failures
- **Graceful Degradation**: Fallback to local content
- **User Feedback**: Clear error messages
- **Retry Logic**: Automatic retry for transient failures

### File Loading Errors
- **Format Detection**: Automatic file type detection
- **Fallback Rendering**: Text fallback for unsupported formats
- **Error Boundaries**: Component-level error catching

## Testing

### Manual Testing Checklist

- [ ] Upload different file types
- [ ] Test search functionality
- [ ] Verify zoom controls work
- [ ] Check text selection
- [ ] Test download functionality
- [ ] Verify responsive design
- [ ] Test keyboard navigation
- [ ] Check dark mode appearance

### Automated Testing

```typescript
// Example test structure
describe('FileViewer', () => {
  it('should render file content correctly', () => {
    // Test rendering
  })
  
  it('should handle search functionality', () => {
    // Test search
  })
  
  it('should manage zoom controls', () => {
    // Test zoom
  })
})
```

## Future Enhancements

### Planned Features
1. **Syntax Highlighting**: Enhanced code file support
2. **PDF Annotation**: Drawing and highlighting tools
3. **Collaborative Viewing**: Shared viewing sessions
4. **Advanced Search**: Regular expressions and filters
5. **File Comparison**: Side-by-side viewing
6. **Export Options**: Multiple export formats

### Performance Improvements
1. **Virtual Scrolling**: For very large documents
2. **Web Workers**: Background search processing
3. **Caching**: File content caching
4. **Progressive Loading**: Load content in chunks

## Troubleshooting

### Common Issues

**Search not working**
- Check if content is properly loaded
- Verify text nodes are accessible
- Check for JavaScript errors

**File not displaying**
- Verify file type is supported
- Check file content format
- Ensure backend is responding

**Zoom controls not working**
- Check if file type supports zoom
- Verify CSS transforms are enabled
- Check for conflicting styles

### Debug Mode

Enable debug logging by setting:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development'
```

## Contributing

When contributing to the FileViewer:

1. **Follow TypeScript conventions**
2. **Add proper error handling**
3. **Include accessibility features**
4. **Test with multiple file types**
5. **Update documentation**

## License

This component is part of the Adobe Learn Platform and follows the same licensing terms.
