import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { insights, durationSeconds = 180 } = body

    if (!insights || insights.length === 0) {
      return NextResponse.json(
        { error: 'No insights provided for podcast generation' },
        { status: 400 }
      )
    }

    // Try to call backend TTS service first
    try {
      const backendResponse = await fetch('http://localhost:8080/api/frontend/podcast/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          durationSeconds: durationSeconds.toString()
        }),
      })

      if (backendResponse.ok) {
        const backendData = await backendResponse.json()
        if (backendData.success && backendData.podcast) {
          return NextResponse.json({
            success: true,
            podcast: {
              audioUrl: backendData.podcast.audioUrl,
              transcript: backendData.podcast.transcript,
              durationSeconds: backendData.podcast.durationSeconds,
              keyTopics: backendData.podcast.keyTopics || []
            },
            fallback: false
          })
        }
      }
    } catch (backendError) {
      console.log('Backend TTS service not available, using fallback podcast')
    }

    // Fallback podcast if backend is not available
    const podcastScript = generateFallbackPodcastScript(insights)
    
    return NextResponse.json({
      success: true,
      podcast: {
        audioUrl: '/api/podcast/demo-audio',
        transcript: podcastScript,
        durationSeconds: durationSeconds,
        keyTopics: extractKeyTopics(insights),
        fallback: true
      },
      fallback: true
    })

  } catch (error) {
    console.error('Error generating podcast:', error)
    return NextResponse.json(
      { error: 'Failed to generate podcast' },
      { status: 500 }
    )
  }
}

// Generate fallback podcast script from insights
function generateFallbackPodcastScript(insights: any[]) {
  const script = `
Welcome to the AI-generated podcast summary of your document insights.

Today, we'll explore ${insights.length} key insights that were extracted from your document analysis.

${insights.map((insight, index) => `
Insight ${index + 1}: ${insight.title}
${insight.content}

This insight has a confidence level of ${insight.confidence} percent, indicating strong reliability in our analysis.
`).join('\n')}

These insights provide a comprehensive overview of the key points, connections, and valuable information contained in your document. Each insight has been carefully analyzed to help you better understand the content and its implications.

Thank you for listening to this AI-generated podcast summary. We hope these insights help you gain a deeper understanding of your document content.
  `.trim()

  return script
}

// Extract key topics from insights
function extractKeyTopics(insights: any[]) {
  const topics = new Set<string>()
  
  insights.forEach(insight => {
    if (insight.relatedConcepts) {
      insight.relatedConcepts.forEach((concept: string) => {
        topics.add(concept)
      })
    }
    if (insight.title) {
      topics.add(insight.title)
    }
  })

  return Array.from(topics).slice(0, 5) // Return top 5 topics
}
