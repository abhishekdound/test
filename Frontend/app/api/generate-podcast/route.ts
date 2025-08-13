import { type NextRequest, NextResponse } from "next/server"
import { callLLM } from "@/lib/llm-client"
import { generateAudio } from "@/lib/tts-client"

export async function POST(request: NextRequest) {
  try {
    const { documentText, documentName, relatedSections, insights } = await request.json()

    if (!documentText) {
      return NextResponse.json({ error: "Document text is required" }, { status: 400 })
    }

    try {
      // Generate podcast script using LLM
      const podcastScript = await generatePodcastScript(documentText, documentName, relatedSections, insights)

      if (!podcastScript) {
        throw new Error("Failed to generate podcast script")
      }

      // Convert script to audio using TTS
      const audioResult = await generateAudio(podcastScript)

      if (audioResult.error) {
        throw new Error(audioResult.error)
      }

      if (!audioResult.audioBuffer) {
        throw new Error("Failed to generate audio")
      }

      // Convert audio buffer to base64 for response
      const audioBase64 = Buffer.from(audioResult.audioBuffer).toString("base64")

      return NextResponse.json({
        script: podcastScript,
        audioData: audioBase64,
        duration: estimateDuration(podcastScript),
      })
    } catch (error) {
      console.log("AI podcast generation failed, using mock response:", error)
      
      // Provide mock podcast data for demo purposes
      const mockScript = `Welcome to Adobe Learn, your AI-powered learning companion. Today we're exploring the fascinating world of document analysis and intelligent learning systems.
      
      This document introduces fundamental principles that form the backbone of modern AI systems. The techniques described here were first developed in the 1980s but gained prominence with increased computational power.
      
      These foundational concepts are directly applicable to current machine learning and deep learning implementations. Understanding these principles is crucial for developing next-generation AI systems and applications.
      
      Thank you for joining us on this learning journey. Remember, the future of AI is built on understanding these core concepts.`
      
      return NextResponse.json({
        script: mockScript,
        audioData: null, // No audio for mock
        duration: estimateDuration(mockScript),
        mock: true
      })
    }
  } catch (error) {
    console.error("Podcast generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generatePodcastScript(
  documentText: string,
  documentName: string,
  relatedSections: any[],
  insights: any[],
): Promise<string> {
  const relatedContext =
    relatedSections.length > 0
      ? `\n\nRelated content from other documents:\n${relatedSections.map((s) => `- ${s.title}: ${s.preview}`).join("\n")}`
      : ""

  const insightsContext =
    insights.length > 0 ? `\n\nKey insights:\n${insights.map((i) => `- ${i.title}: ${i.content}`).join("\n")}` : ""

  const prompt = `Create a 2-5 minute podcast script for an AI-narrated overview of this document. The script should be conversational, engaging, and informative.

Document: ${documentName}
Content: ${documentText.substring(0, 3000)}${relatedContext}${insightsContext}

Structure the podcast as follows:
1. Brief introduction (15-20 seconds)
2. Main content summary (2-3 minutes)
3. Key insights and connections (1-2 minutes)
4. Conclusion with takeaways (15-20 seconds)

Guidelines:
- Write in a natural, conversational tone suitable for audio
- Use transitions between sections
- Highlight the most important points
- Include connections to related content when relevant
- Keep sentences clear and not too long for speech
- Target 300-400 words total (approximately 2-3 minutes when spoken)

Return only the script text, no additional formatting or metadata.`

  const llmResponse = await callLLM(prompt)

  if (llmResponse.error) {
    throw new Error(llmResponse.error)
  }

  return llmResponse.content.trim()
}

function estimateDuration(script: string): number {
  // Estimate duration based on word count (average 150 words per minute)
  const wordCount = script.split(/\s+/).length
  return Math.ceil((wordCount / 150) * 60) // Return duration in seconds
}
