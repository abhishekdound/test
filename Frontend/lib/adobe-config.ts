// Adobe PDF Embed API Configuration
export const ADOBE_CONFIG = {
  // Replace with your actual Adobe Client ID
  CLIENT_ID: process.env.NEXT_PUBLIC_ADOBE_CLIENT_ID || "a2d7f06cea0c43f09a17bea4c32c9e93",
  
  // Adobe PDF Embed API endpoints
  ENDPOINTS: {
    SCRIPT_URL: "https://documentcloud.adobe.com/view-sdk/main.js",
    CREDENTIALS_URL: "https://www.adobe.com/go/dcsdks_credentials"
  },
  
  // Default viewer configuration
  DEFAULT_VIEWER_CONFIG: {
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
  },
  
  // Navigation bar configuration
  NAV_BAR_CONFIG: {
    download: true,
    print: true,
    fullScreen: true,
    bookmark: true,
    secondaryToolbar: true,
    leftPanel: true,
    rightPanel: true
  },
  
  // Supported file types
  SUPPORTED_TYPES: [
    'pdf',
    'PDF'
  ],
  
  // Viewer themes
  THEMES: {
    LIGHT: {
      primaryColor: "#0066cc",
      secondaryColor: "#f5f5f5"
    },
    DARK: {
      primaryColor: "#0066cc",
      secondaryColor: "#2d2d2d"
    }
  }
}

// Adobe PDF Embed API event types
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

// Adobe PDF Embed API utility functions
export class AdobePDFUtils {
  /**
   * Check if Adobe PDF Embed API is loaded
   */
  static isAdobeAPIReady(): boolean {
    return typeof window !== 'undefined' && 
           window.AdobeDC && 
           window.AdobeDC.View &&
           window.AdobeDC.View.createViewer;
  }

  /**
   * Load Adobe PDF Embed API script
   */
  static loadAdobeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isAdobeAPIReady()) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = ADOBE_CONFIG.ENDPOINTS.SCRIPT_URL;
      script.async = true;
      
      script.onload = () => {
        console.log('Adobe PDF Embed API loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Adobe PDF Embed API'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Create a unique viewer ID
   */
  static createViewerId(fileId: string): string {
    return `adobe-pdf-viewer-${fileId}-${Date.now()}`;
  }

  /**
   * Validate Adobe Client ID format
   */
  static isValidClientId(clientId: string): boolean {
    return clientId && 
           clientId !== "YOUR_ADOBE_CLIENT_ID" && 
           clientId.length > 10;
  }

  /**
   * Get file type icon
   */
  static getFileTypeIcon(fileType: string): string {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      default:
        return '📁';
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate download URL for file
   */
  static generateDownloadUrl(fileUrl: string, fileName: string): string {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    return link.href;
  }

  /**
   * Check if file is supported by Adobe PDF Embed API
   */
  static isSupportedFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ADOBE_CONFIG.SUPPORTED_TYPES.includes(extension || '');
  }

  /**
   * Get viewer configuration based on theme
   */
  static getViewerConfig(theme: 'light' | 'dark' = 'light') {
    return {
      ...ADOBE_CONFIG.DEFAULT_VIEWER_CONFIG,
      theme: ADOBE_CONFIG.THEMES[theme.toUpperCase() as keyof typeof ADOBE_CONFIG.THEMES]
    };
  }
}

// Adobe PDF Embed API types
export interface AdobeViewerConfig {
  clientId: string;
  divId: string;
  documentOpenParams: {
    navBar: {
      download: boolean;
      print: boolean;
      fullScreen: boolean;
      bookmark: boolean;
      secondaryToolbar: boolean;
      leftPanel: boolean;
      rightPanel: boolean;
    };
    defaultViewMode: string;
    showDownloadPDF: boolean;
    showPrintPDF: boolean;
    showLeftHandPanel: boolean;
    showAnnotationTools: boolean;
    enableFormFilling: boolean;
    showBookmarks: boolean;
    showSecondaryToolbar: boolean;
    showFindBar: boolean;
    showPageControls: boolean;
    showZoomControls: boolean;
    showThumbnails: boolean;
    showBorders: boolean;
    showPageShadow: boolean;
  };
}

export interface AdobeViewerEvent {
  type: string;
  data?: any;
  pageNumber?: number;
  totalPages?: number;
  selectedText?: string;
  annotation?: any;
  bookmark?: any;
  hyperlink?: any;
}

// Environment variables type definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_ADOBE_CLIENT_ID?: string;
    }
  }
}
