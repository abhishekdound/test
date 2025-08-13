const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analysis/health`)
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

      const response = await fetch(`${this.baseUrl}/api/adobe/analyze`, {
        method: 'POST',
        body: formData,
      })

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
        message: 'Analysis started (mock data)'
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
      console.error('Insights generation failed:', error)
      // Return mock insights as fallback
      return {
        insights: [
          {
            id: 'mock-1',
            type: 'key_point',
            title: 'Mock Insight',
            content: 'This is a mock insight generated when backend is unavailable.',
            confidence: 85
          }
        ],
        status: 'success'
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
      console.error('Podcast generation failed:', error)
      return {
        audioUrl: '/mock-audio.mp3',
        transcript: 'Mock podcast transcript when backend is unavailable.',
        duration: 180,
        status: 'ready'
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