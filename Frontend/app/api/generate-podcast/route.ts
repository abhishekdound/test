import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document, insights } = body

    // Simulate podcast generation delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Mock podcast response
    const podcastResponse = {
      audioUrl: '/api/mock-audio.mp3', // This would be a real audio file in production
      transcript: `Welcome to the AI-generated podcast summary of ${document?.name || 'your document'}. 

In this episode, we explore the key insights from your uploaded document. The main topics covered include artificial intelligence, machine learning fundamentals, and practical applications.

Key insight number one: ${insights?.[0]?.title || 'Core concepts'} - ${insights?.[0]?.content || 'Important foundational knowledge for understanding the field.'}

Key insight number two: ${insights?.[1]?.title || 'Implementation strategies'} - ${insights?.[1]?.content || 'Practical approaches to applying these concepts.'}

This has been your AI-generated podcast summary. Thank you for listening!`,
      duration: 180, // 3 minutes
      status: 'ready' as const,
      generatedAt: new Date().toISOString(),
      wordCount: insights?.length * 50 || 200,
    }

    return NextResponse.json(podcastResponse)
  } catch (error) {
    console.error('Podcast generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate podcast' },
      { status: 500 }
    )
  }
}