import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return a simple text response as fallback audio
    const demoTranscript = `
Welcome to the AI-generated podcast summary.

This is a demo audio file for the Adobe Learn Platform's podcast mode feature.

The actual TTS (Text-to-Speech) service would convert your document insights into natural-sounding audio.

This feature allows you to:
- Listen to document summaries on the go
- Convert insights into audio format
- Share audio summaries with others
- Access content in a hands-free manner

The podcast mode generates 2-5 minute audio summaries based on the AI insights extracted from your documents.

Thank you for using the Adobe Learn Platform's podcast mode feature.
    `.trim()

    return new NextResponse(demoTranscript, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="demo-podcast.txt"'
      }
    })

  } catch (error) {
    console.error('Error serving demo audio:', error)
    return NextResponse.json(
      { error: 'Failed to serve demo audio' },
      { status: 500 }
    )
  }
}
