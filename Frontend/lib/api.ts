// API service layer for communicating with the Spring Boot backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface AnalysisRequest {
  persona: string;
  jobToBeDone: string;
  enableInsights?: boolean;
  enablePodcast?: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  jobId: string;
  data: any;
  processingTimeMs: number;
  adobeChallengeCompliant: boolean;
  performance: {
    analysisTime: string;
    meetsRequirement: boolean;
  };
}

export interface RelatedSection {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  sourceDocument: string;
  pageNumber: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  relatedSections: string[];
}

export interface PodcastResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  transcript: string;
  sections: any[];
}

export interface DocumentViewerConfig {
  jobId: string;
  pdfUrl: string;
  sections: any[];
  highlights: any[];
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Main analysis endpoint
  async analyzeDocuments(
    files: File[],
    request: AnalysisRequest
  ): Promise<AnalysisResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    formData.append('persona', request.persona);
    formData.append('jobToBeDone', request.jobToBeDone);
    formData.append('enableInsights', request.enableInsights?.toString() || 'true');
    formData.append('enablePodcast', request.enablePodcast?.toString() || 'false');

    const url = `${API_BASE_URL}/api/adobe/analyze`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Analysis request failed:', error);
      throw error;
    }
  }

  // Get related sections for a specific section
  async getRelatedSections(jobId: string, sectionId: string): Promise<RelatedSection[]> {
    return this.request<RelatedSection[]>(`/api/adobe/related-sections/${jobId}/${sectionId}`);
  }

  // Generate insights for a job
  async generateInsights(jobId: string, options?: any): Promise<Insight[]> {
    return this.request<Insight[]>(`/api/adobe/insights/${jobId}`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  // Generate podcast for a job
  async generatePodcast(jobId: string, options?: any): Promise<PodcastResponse> {
    return this.request<PodcastResponse>(`/api/adobe/podcast/${jobId}`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  // Get accuracy validation for a job
  async getAccuracyValidation(jobId: string): Promise<any> {
    return this.request(`/api/adobe/accuracy/${jobId}`);
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<any> {
    return this.request('/api/adobe/performance');
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<any> {
    return this.request(`/api/adobe/status/${jobId}`);
  }

  // Frontend integration endpoints
  async getDocumentViewerConfig(jobId: string): Promise<DocumentViewerConfig> {
    return this.request<DocumentViewerConfig>(`/api/frontend/document-viewer/${jobId}`);
  }

  async getHighlightedSections(jobId: string): Promise<any[]> {
    return this.request<any[]>(`/api/frontend/highlighted-sections/${jobId}`);
  }

  async getRelatedSectionsForJob(jobId: string): Promise<any[]> {
    return this.request<any[]>(`/api/frontend/related-sections/${jobId}`);
  }

  async getPdfEmbedConfig(jobId: string): Promise<any> {
    return this.request(`/api/frontend/pdf-embed/${jobId}`);
  }

  async getPdfFile(jobId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/api/frontend/pdf-file/${jobId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  }

  async getSectionDetails(jobId: string, sectionId: string): Promise<any> {
    return this.request(`/api/frontend/section-details/${jobId}/${sectionId}`);
  }

  async getBulkSections(jobId: string, sectionIds: string[]): Promise<any[]> {
    return this.request<any[]>(`/api/frontend/bulk-sections/${jobId}`, {
      method: 'POST',
      body: JSON.stringify({ sectionIds }),
    });
  }

  async getFrontendConfig(): Promise<any> {
    return this.request('/api/frontend/config');
  }

  async getDemoData(): Promise<any> {
    return this.request('/api/frontend/demo-data');
  }

  // PDF Embed API endpoints
  async getPdfEmbedConfigFromAdobe(jobId: string): Promise<any> {
    return this.request(`/api/pdf-embed/config/${jobId}`);
  }

  async getPdfFileFromAdobe(jobId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/api/pdf-embed/file/${jobId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  }

  async getPdfMetadata(jobId: string): Promise<any> {
    return this.request(`/api/pdf-embed/metadata/${jobId}`);
  }

  async getInitScript(): Promise<string> {
    const url = `${API_BASE_URL}/api/pdf-embed/init-script`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.text();
  }

  // Document analysis endpoints
  async getAnalysisResults(jobId: string): Promise<any> {
    return this.request(`/api/analysis/results/${jobId}`);
  }

  async submitAnalysis(request: any): Promise<any> {
    return this.request('/api/analysis/submit', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAnalysisStatus(jobId: string): Promise<any> {
    return this.request(`/api/analysis/status/${jobId}`);
  }

  async cancelAnalysis(jobId: string): Promise<any> {
    return this.request(`/api/analysis/cancel/${jobId}`, {
      method: 'DELETE',
    });
  }

  async getAnalysisMetrics(): Promise<any> {
    return this.request('/api/analysis/metrics');
  }

  async getAnalysisHealth(): Promise<any> {
    return this.request('/api/analysis/health');
  }

  // Compliance endpoints
  async getComplianceStatus(): Promise<any> {
    return this.request('/api/compliance/status');
  }

  async validateCompliance(): Promise<any> {
    return this.request('/api/compliance/validate');
  }

  async getComplianceHealth(): Promise<any> {
    return this.request('/api/compliance/health');
  }
}

export const apiService = new ApiService();
export default apiService;
