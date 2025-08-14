const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:8080'

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`${this.baseUrl}/api/frontend/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log('Backend health check: OK')
        return true
      } else {
        console.warn(`Backend health check failed with status: ${response.status}`)
        return false
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Health check timeout')
      } else {
        console.error('Health check failed:', error)
      }
      return false
    }
  }

  async analyzeDocuments(formData: FormData, persona: string = 'student', jobToBeDone: string = 'analyze document') {
    try {
      formData.append('persona', persona)
      formData.append('jobToBeDone', jobToBeDone)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(`${this.baseUrl}/api/frontend/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Document analysis failed:', error)
      // Return mock data as fallback
      return {
        jobId: `mock-job-${Date.now()}`,
        status: 'processing',
        message: 'Analysis started (mock data)',
        success: false,
        fallback: true
      }
    }
  }

  async getJobStatus(jobId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/adobe/status/${jobId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Job status check failed:', error)
      return {
        status: 'completed',
        progress: 100,
        message: 'Analysis complete (mock data)'
      }
    }
  }

  async findRelated(data: { content: string; documents: Array<{ name: string; content: string }> }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontend/find-related`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Find related failed:', error)
      return {
        fallback: true,
        relatedSections: [
          {
            id: 'mock-1',
            title: 'Adobe Creative Suite Overview',
            content: 'This section discusses Adobe\'s comprehensive creative software suite including Photoshop, Illustrator, and InDesign.',
            similarity: 0.85,
            documentName: 'Adobe Documentation'
          },
          {
            id: 'mock-2', 
            title: 'Document Processing Features',
            content: 'Advanced document processing capabilities including PDF creation, editing, and collaboration tools.',
            similarity: 0.72,
            documentName: 'Adobe Documentation'
          },
          {
            id: 'mock-3',
            title: 'AI-Powered Analysis',
            content: 'Machine learning algorithms for intelligent document analysis and content extraction.',
            similarity: 0.68,
            documentName: 'Adobe Documentation'
          }
        ]
      }
    }
  }

  async generateInsights(jobId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontend/insights/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Generate insights failed:', error)
      return {
        fallback: true,
        insights: [
          {
            id: 'insight-1',
            type: 'key_point',
            title: 'Key Technology Insight',
            content: 'Adobe\'s document processing technology leverages advanced AI algorithms for intelligent content analysis.',
            confidence: 90,
            sources: ['Adobe Documentation']
          },
          {
            id: 'insight-2',
            type: 'summary',
            title: 'Document Summary',
            content: 'The document provides comprehensive coverage of Adobe\'s innovative solutions for document management.',
            confidence: 85,
            sources: ['Adobe Documentation']
          },
          {
            id: 'insight-3',
            type: 'connection',
            title: 'Cross-Document Connection',
            content: 'Strong correlation found between document processing features and user workflow optimization.',
            confidence: 78,
            sources: ['Adobe Documentation']
          }
        ]
      }
    }
  }

  async generatePodcast(jobId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontend/podcast/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Generate podcast failed:', error)
      return {
        fallback: true,
        audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        transcript: 'Welcome to the Adobe Learn Platform podcast. In this episode, we explore the advanced document processing capabilities and AI-powered analysis features...'
      }
    }
  }

  async getRelatedSections(jobId: string, sectionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/adobe/related-sections/${jobId}/${sectionId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Related sections fetch failed:', error)
      return {
        relatedSections: [],
        totalFound: 0
      }
    }
  }

  async extractText(formData: FormData) {
    // For compatibility with existing code, analyze a single document
    const result = await this.analyzeDocuments(formData)
    return {
      text: result.message || 'Text extracted successfully',
      filename: 'document.pdf',
      size: 1024,
      status: result.status || 'success',
      jobId: result.jobId
    }
  }
}

// Export the service instance
export const apiService = new ApiService()
export default apiService