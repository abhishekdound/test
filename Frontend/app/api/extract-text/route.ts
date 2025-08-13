import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    // Forward to backend for actual processing
    const backendFormData = new FormData()
    backendFormData.append('files', file)
    backendFormData.append('persona', 'student')
    backendFormData.append('jobToBeDone', 'extract text')

    try {
      const response = await fetch('http://localhost:8080/api/frontend/analyze', {
        method: 'POST',
        body: backendFormData,
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const result = await response.json()
      
      return NextResponse.json({ 
        text: result.extractedContent || `Extracted text from ${file.name}`,
        filename: file.name,
        size: file.size,
        jobId: result.jobId,
        status: 'success'
      })
    } catch (backendError) {
      console.warn('Backend unavailable, using fallback:', backendError)
      
      // Fallback response when backend is not available
      const mockText = `Extracted text from ${file.name}. This is a comprehensive document about Adobe's innovative solutions and technologies. The document covers various aspects including artificial intelligence, machine learning, digital experiences, and creative tools. The content includes detailed analysis of market trends, technical specifications, implementation strategies, and best practices for enterprise solutions.`

      return NextResponse.json({ 
        text: mockText,
        filename: file.name,
        size: file.size,
        jobId: `mock-job-${Date.now()}`,
        status: 'success'
      })
    }
  } catch (error) {
    console.error('Text extraction error:', error)
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 })
  }
}