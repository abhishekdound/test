import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Mock text extraction - in real implementation, this would process PDFs
    const extractedTexts = files.map((file, index) => ({
      id: `text-${index}`,
      fileName: file.name,
      content: `Extracted text content from ${file.name}. This is a mock implementation that would normally use PDF processing libraries to extract actual text content.`,
      pageCount: Math.floor(Math.random() * 20) + 1,
      wordCount: Math.floor(Math.random() * 1000) + 100,
    }))

    return NextResponse.json({
      success: true,
      results: extractedTexts,
      totalFiles: files.length,
    })
  } catch (error) {
    console.error('Text extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from files' },
      { status: 500 }
    )
  }
}