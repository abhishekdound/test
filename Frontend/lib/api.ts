
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api' 
  : 'http://localhost:8080/api'

export interface AnalysisResult {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  results?: any
}

export interface InsightData {
  id: string
  type: 'key_point' | 'summary' | 'connection' | 'question'
  title: string
  content: string
  confidence: number
  sources: string[]
}

export interface PodcastData {
  audioUrl: string
  transcript: string
  duration: number
  status: 'generating' | 'ready' | 'failed'
}

class APIService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async uploadAndAnalyze(files: File[]): Promise<AnalysisResult> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`file${index}`, file)
    })

    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/adobe/analyze`, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error('Failed to upload files. Please try again.')
    }
  }

  async getAnalysisStatus(jobId: string): Promise<AnalysisResult> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/adobe/status/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Status check error:', error)
      throw new Error('Failed to check analysis status.')
    }
  }

  async generateInsights(jobId: string): Promise<InsightData[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/adobe/insights/${jobId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`Insights generation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Insights generation error:', error)
      throw new Error('Failed to generate insights.')
    }
  }

  async generatePodcast(jobId: string): Promise<PodcastData> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/adobe/podcast/${jobId}`, {
        method: 'POST',
      }, 60000) // Longer timeout for podcast generation

      if (!response.ok) {
        throw new Error(`Podcast generation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Podcast generation error:', error)
      throw new Error('Failed to generate podcast.')
    }
  }

  async findRelatedSections(jobId: string, sectionId: string): Promise<any[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/adobe/related-sections/${jobId}/${sectionId}`
      )

      if (!response.ok) {
        throw new Error(`Related sections fetch failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Related sections error:', error)
      throw new Error('Failed to find related sections.')
    }
  }

  async getPerformanceMetrics(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/adobe/performance`)
      
      if (!response.ok) {
        throw new Error(`Performance metrics fetch failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Performance metrics error:', error)
      throw new Error('Failed to fetch performance metrics.')
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/health`, {}, 5000)
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

export const apiService = new APIService()
export default apiService
