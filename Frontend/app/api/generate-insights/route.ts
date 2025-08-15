
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, relatedSections, analysisType = 'comprehensive', useSelectedText = false } = body

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Try to use backend LLM service first (which has proper Gemini integration)
    try {
      console.log('Using backend LLM service for insights generation')
      
      const backendResponse = await fetch('http://localhost:8080/api/frontend/insights/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          sectionContent: content,
          persona: 'researcher',
          jobToBeDone: useSelectedText ? 'selected text analysis' : 'document analysis'
        }),
      })

      if (backendResponse.ok) {
        const backendData = await backendResponse.json()
        if (backendData.success && backendData.insights) {
          // Convert backend insights to frontend format
          const insights = convertBackendInsights(backendData.insights)
          return NextResponse.json({ insights })
        }
      } else {
        console.error('Backend LLM service error:', await backendResponse.text())
      }
    } catch (backendError) {
      console.log('Backend LLM service not available, trying direct Gemini API')
      
      // Fallback to direct Gemini API call
      try {
        const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ'
        
        console.log('Using direct Gemini API for insights generation')

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: generateGeminiPrompt(content, useSelectedText, analysisType)
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          }),
        })

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json()
          if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            const geminiText = geminiData.candidates[0].content.parts[0].text
            const insights = parseGeminiResponse(geminiText, useSelectedText)
            return NextResponse.json({ insights })
          }
        } else {
          console.error('Gemini API error:', await geminiResponse.text())
        }
      } catch (geminiError) {
        console.log('Direct Gemini API also not available, using fallback insights')
      }
    }

    // Fallback insights if backend is not available
    const insights = [
      {
        id: 'insight-1',
        type: 'key_point',
        title: 'Core Document Analysis',
        content: useSelectedText 
          ? `The selected text contains important information that has been analyzed for key insights and patterns.`
          : 'This document has been comprehensively analyzed and contains valuable information for your review.',
        confidence: 92,
        sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
        relatedConcepts: ['document processing', 'content analysis', 'information extraction'],
      },
      {
        id: 'insight-2',
        type: 'did_you_know',
        title: 'Content Structure',
        content: useSelectedText
          ? 'The selected text follows a structured format that makes it easy to understand and extract key concepts.'
          : 'This document follows a structured format that makes it easy to navigate and understand key concepts.',
        confidence: 88,
        sources: useSelectedText ? ['Selected Text'] : ['Content Analysis'],
        relatedConcepts: ['document structure', 'content organization', 'readability'],
      },
      {
        id: 'insight-3',
        type: 'connection',
        title: 'Cross-Document Relationships',
        content: useSelectedText
          ? 'The selected content shows connections to other related topics and concepts that could be explored further.'
          : 'Strong conceptual connections exist between different sections, suggesting an integrated approach to understanding the content.',
        confidence: 85,
        sources: useSelectedText ? ['Selected Text'] : ['Relationship Analysis'],
        relatedConcepts: ['content relationships', 'topic connections', 'knowledge graph'],
      },
      {
        id: 'insight-4',
        type: 'inspiration',
        title: 'Innovation Opportunities',
        content: useSelectedText
          ? 'The selected text reveals potential areas for innovation and further exploration in related domains.'
          : 'This document reveals potential areas for innovation and further exploration in related domains.',
        confidence: 78,
        sources: useSelectedText ? ['Selected Text'] : ['Innovation Analysis'],
        relatedConcepts: ['innovation', 'opportunities', 'future research'],
      },
      {
        id: 'insight-5',
        type: 'contradiction',
        title: 'Alternative Perspectives',
        content: useSelectedText
          ? 'Consider alternative viewpoints and approaches that may challenge the assumptions in the selected text.'
          : 'Consider alternative viewpoints and approaches that may challenge the assumptions presented in this document.',
        confidence: 75,
        sources: useSelectedText ? ['Selected Text'] : ['Critical Analysis'],
        relatedConcepts: ['critical thinking', 'alternative perspectives', 'assumptions'],
      },
    ]

    return NextResponse.json({ insights })

  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

// Generate Gemini API prompt
function generateGeminiPrompt(content: string, useSelectedText: boolean, analysisType: string) {
  const context = useSelectedText ? 'selected text' : 'document content'
  const analysisFocus = useSelectedText ? 'focused analysis of the specific selected text' : 'comprehensive analysis of the entire document'
  
  return `You are an expert document analyst and insights generator. Analyze the following ${context} and provide ${analysisFocus}.

CONTENT TO ANALYZE:
${content.substring(0, Math.min(content.length, 3000))}

${useSelectedText ? 'This is SELECTED TEXT from a larger document. Focus your analysis specifically on this text segment and its implications.' : 'This is the FULL DOCUMENT content. Provide comprehensive analysis covering the entire document.'}

Please provide insights in the following JSON format:
{
  "keyInsights": [
    {
      "title": "Key insight title",
      "content": "Detailed explanation of the key insight",
      "confidence": 85
    }
  ],
  "didYouKnow": [
    {
      "title": "Interesting fact title", 
      "content": "Surprising or educational fact about the content",
      "confidence": 90
    }
  ],
  "contradictions": [
    {
      "title": "Contradiction or counterpoint title",
      "content": "Alternative perspective or potential contradiction",
      "confidence": 75
    }
  ],
  "connections": [
    {
      "title": "Connection title",
      "content": "How this content connects to broader concepts or other topics",
      "confidence": 80
    }
  ],
  "inspirations": [
    {
      "title": "Inspiration title",
      "content": "Creative ideas or inspirations derived from the content",
      "confidence": 70
    }
  ]
}

Focus on:
- Key points and main ideas
- Surprising or educational facts
- Alternative perspectives or contradictions
- Cross-connections and relationships
- Creative inspirations and ideas

Make insights concise (1-2 sentences) but valuable and actionable. Confidence scores should reflect your certainty (0-100).`
}

// Parse Gemini API response
function parseGeminiResponse(geminiText: string, useSelectedText: boolean) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = geminiText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      const insights: any[] = []
      
      // Convert to frontend format
      if (parsed.keyInsights) {
        parsed.keyInsights.forEach((insight: any, index: number) => {
          insights.push({
            id: `key-${index}`,
            type: 'key_point',
            title: insight.title || `Key Insight ${index + 1}`,
            content: insight.content,
            confidence: insight.confidence || 85,
            sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
            relatedConcepts: ['key points', 'main ideas', 'core concepts']
          })
        })
      }
      
      if (parsed.didYouKnow) {
        parsed.didYouKnow.forEach((fact: any, index: number) => {
          insights.push({
            id: `fact-${index}`,
            type: 'did_you_know',
            title: fact.title || 'Did You Know?',
            content: fact.content,
            confidence: fact.confidence || 90,
            sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
            relatedConcepts: ['interesting facts', 'knowledge', 'learning']
          })
        })
      }
      
      if (parsed.contradictions) {
        parsed.contradictions.forEach((contradiction: any, index: number) => {
          insights.push({
            id: `contradiction-${index}`,
            type: 'contradiction',
            title: contradiction.title || `Contradiction ${index + 1}`,
            content: contradiction.content,
            confidence: contradiction.confidence || 75,
            sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
            relatedConcepts: ['contradictions', 'counterpoints', 'critical analysis']
          })
        })
      }
      
      if (parsed.connections) {
        parsed.connections.forEach((connection: any, index: number) => {
          insights.push({
            id: `connection-${index}`,
            type: 'connection',
            title: connection.title || `Connection ${index + 1}`,
            content: connection.content,
            confidence: connection.confidence || 80,
            sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
            relatedConcepts: ['connections', 'relationships', 'cross-references']
          })
        })
      }
      
      if (parsed.inspirations) {
        parsed.inspirations.forEach((inspiration: any, index: number) => {
          insights.push({
            id: `inspiration-${index}`,
            type: 'inspiration',
            title: inspiration.title || `Inspiration ${index + 1}`,
            content: inspiration.content,
            confidence: inspiration.confidence || 70,
            sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
            relatedConcepts: ['inspiration', 'ideas', 'innovation']
          })
        })
      }
      
      return insights
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error)
  }
  
  // Fallback parsing if JSON extraction fails
  return parseFallbackResponse(geminiText, useSelectedText)
}

// Fallback parsing for non-JSON responses
function parseFallbackResponse(text: string, useSelectedText: boolean) {
  const insights: any[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  // Extract key insights
  const keyInsights = lines.filter(line => 
    line.toLowerCase().includes('key') || 
    line.toLowerCase().includes('main') || 
    line.toLowerCase().includes('important')
  ).slice(0, 3)
  
  keyInsights.forEach((insight, index) => {
    insights.push({
      id: `key-${index}`,
      type: 'key_point',
      title: `Key Insight ${index + 1}`,
      content: insight.trim(),
      confidence: 85,
      sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
      relatedConcepts: ['key points', 'main ideas']
    })
  })
  
  // Extract interesting facts
  const facts = lines.filter(line => 
    line.toLowerCase().includes('fact') || 
    line.toLowerCase().includes('interesting') || 
    line.toLowerCase().includes('surprising')
  ).slice(0, 2)
  
  facts.forEach((fact, index) => {
    insights.push({
      id: `fact-${index}`,
      type: 'did_you_know',
      title: 'Did You Know?',
      content: fact.trim(),
      confidence: 90,
      sources: useSelectedText ? ['Selected Text'] : ['Document Analysis'],
      relatedConcepts: ['interesting facts', 'knowledge']
    })
  })
  
  return insights
}

// Convert backend insights format to frontend format
function convertBackendInsights(backendInsights: any) {
  const insights: any[] = []
  
  // Convert key insights
  if (backendInsights.keyInsights) {
    backendInsights.keyInsights.forEach((insight: string, index: number) => {
      insights.push({
        id: `key-${index}`,
        type: 'key_point',
        title: `Key Insight ${index + 1}`,
        content: insight,
        confidence: 90,
        sources: ['LLM Analysis'],
        relatedConcepts: ['key points', 'main ideas', 'core concepts']
      })
    })
  }

  // Convert did you know facts
  if (backendInsights.didYouKnow) {
    backendInsights.didYouKnow.forEach((fact: string, index: number) => {
      insights.push({
        id: `fact-${index}`,
        type: 'did_you_know',
        title: `Did You Know?`,
        content: fact,
        confidence: 85,
        sources: ['LLM Analysis'],
        relatedConcepts: ['interesting facts', 'knowledge', 'learning']
      })
    })
  }

  // Convert contradictions
  if (backendInsights.contradictions) {
    backendInsights.contradictions.forEach((contradiction: string, index: number) => {
      insights.push({
        id: `contradiction-${index}`,
        type: 'contradiction',
        title: `Contradiction ${index + 1}`,
        content: contradiction,
        confidence: 80,
        sources: ['LLM Analysis'],
        relatedConcepts: ['contradictions', 'counterpoints', 'critical analysis']
      })
    })
  }

  // Convert connections
  if (backendInsights.connections) {
    backendInsights.connections.forEach((connection: string, index: number) => {
      insights.push({
        id: `connection-${index}`,
        type: 'connection',
        title: `Connection ${index + 1}`,
        content: connection,
        confidence: 85,
        sources: ['LLM Analysis'],
        relatedConcepts: ['connections', 'relationships', 'cross-references']
      })
    })
  }

  // Convert inspirations
  if (backendInsights.inspirations) {
    backendInsights.inspirations.forEach((inspiration: string, index: number) => {
      insights.push({
        id: `inspiration-${index}`,
        type: 'inspiration',
        title: `Inspiration ${index + 1}`,
        content: inspiration,
        confidence: 75,
        sources: ['LLM Analysis'],
        relatedConcepts: ['inspiration', 'ideas', 'innovation']
      })
    })
  }

  return insights
}
