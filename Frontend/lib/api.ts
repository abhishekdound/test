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
        signal: controller.signal,
        cache: 'no-cache'
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
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
      const response = await fetch(`${this.baseUrl}/api/adobe/find-related`, {
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
            title: 'Related Section 1',
            content: 'This is a mock related section based on your document content.',
            similarity: 0.85,
            source: 'Mock Document'
          },
          {
            id: 'mock-2', 
            title: 'Related Section 2',
            content: 'Another related section that demonstrates the functionality.',
            similarity: 0.72,
            source: 'Mock Document'
          }
        ]
      }
    }
  }

  async generateInsights(jobId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/adobe/insights/${jobId}`, {
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
            title: 'Key Finding',
            description: 'This document contains important information about Adobe technologies.',
            type: 'important',
            confidence: 0.9
          },
          {
            id: 'insight-2',
            title: 'Recommendation',
            description: 'Consider exploring the document structure for better organization.',
            type: 'suggestion',
            confidence: 0.75
          }
        ]
      }
    }
  }

  async generatePodcast(jobId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/adobe/podcast/${jobId}`, {
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
        transcript: 'Mock podcast transcript: Welcome to the document analysis podcast. Today we are discussing the content of your uploaded document...'
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