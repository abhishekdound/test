import { type NextRequest, NextResponse } from "next/server"
import { callLLM } from "@/lib/llm-client"

interface Insight {
  id: string
  type: "key_point" | "summary" | "question" | "connection" | "did_you_know" | "contradiction"
  title: string
  content: string
  confidence: number
  sources: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { documentText, documentName, relatedSections } = await request.json()

    if (!documentText) {
      return NextResponse.json({ error: "Document text is required" }, { status: 400 })
    }

    // Create comprehensive prompt for insights generation
    const prompt = createInsightsPrompt(documentText, documentName, relatedSections)

    try {
      const llmResponse = await callLLM(prompt)
      
      if (llmResponse.error) {
        throw new Error(llmResponse.error)
      }

      // Parse LLM response into structured insights
      const insights = parseInsightsResponse(llmResponse.content)
      return NextResponse.json({ insights })
    } catch (llmError) {
      console.log("LLM failed, using mock insights:", llmError)
      
      // Provide mock insights for demo purposes
      const mockInsights = [
        {
          id: "insight-1",
          type: "key_point" as const,
          title: "Core Concept",
          content: "This section introduces fundamental principles that form the backbone of modern AI systems.",
          confidence: 85,
          sources: ["Document Analysis"]
        },
        {
          id: "insight-2",
          title: "Historical Context",
          content: "The techniques described here were first developed in the 1980s but gained prominence with increased computational power.",
          confidence: 80,
          sources: ["AI Analysis"]
        },
        {
          id: "insight-3",
          title: "Practical Applications",
          content: "These foundational concepts are directly applicable to current machine learning and deep learning implementations.",
          confidence: 90,
          sources: ["Content Analysis"]
        },
        {
          id: "insight-4",
          title: "Future Implications",
          content: "Understanding these principles is crucial for developing next-generation AI systems and applications.",
          confidence: 85,
          sources: ["Trend Analysis"]
        }
      ]
      
      return NextResponse.json({ insights: mockInsights })
    }
  } catch (error) {
    console.error("Insights generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function createInsightsPrompt(documentText: string, documentName: string, relatedSections: any[]): string {
  const relatedContext =
    relatedSections.length > 0
      ? `\n\nRelated sections from other documents:\n${relatedSections.map((s) => `- ${s.title}: ${s.preview}`).join("\n")}`
      : ""

  return `Analyze the following document and generate comprehensive insights. Return your response as a JSON array of insights, each with the following structure:
{
  "type": "key_point" | "summary" | "question" | "connection" | "did_you_know" | "contradiction",
  "title": "Brief title (max 50 chars)",
  "content": "Detailed insight content (1-3 sentences)",
  "confidence": number (70-95),
  "sources": ["Page references or section names"]
}

Document: ${documentName}
Content: ${documentText.substring(0, 4000)}${relatedContext}

Generate 4-6 diverse insights covering:
1. Key findings or main points
2. Summary of core concepts
3. Thought-provoking questions
4. Connections to related content
5. "Did you know?" interesting facts
6. Potential contradictions or counterpoints

Focus on actionable, specific insights that help readers understand the document better. Ensure high confidence scores (80-95%) for well-supported insights.

Return only the JSON array, no additional text.`
}

function parseInsightsResponse(response: string): Insight[] {
  try {
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No JSON array found in response")
    }

    const insights = JSON.parse(jsonMatch[0])

    return insights.map((insight: any, index: number) => ({
      id: `insight-${index + 1}`,
      type: insight.type || "key_point",
      title: insight.title || `Insight ${index + 1}`,
      content: insight.content || "",
      confidence: Math.min(95, Math.max(70, insight.confidence || 85)),
      sources: Array.isArray(insight.sources) ? insight.sources : ["Document analysis"],
    }))
  } catch (error) {
    console.error("Failed to parse insights response:", error)

    // Fallback: create insights from text analysis
    return createFallbackInsights(response)
  }
}

function createFallbackInsights(response: string): Insight[] {
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 20)

  return sentences.slice(0, 4).map((sentence, index) => ({
    id: `fallback-${index + 1}`,
    type: index % 2 === 0 ? "key_point" : ("summary" as const),
    title: `Key Insight ${index + 1}`,
    content: sentence.trim(),
    confidence: 80,
    sources: ["AI Analysis"],
  }))
}
