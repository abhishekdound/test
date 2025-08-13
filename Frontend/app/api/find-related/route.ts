import { type NextRequest, NextResponse } from "next/server"

interface DocumentSection {
  id: string
  title: string
  content: string
  pageNumber: number
  documentName: string
  documentId: string
}

interface SimilarityResult {
  id: string
  title: string
  type: "document" | "article" | "research"
  relevance: number
  preview: string
  pageNumber: number
  documentName: string
  explanation: string
}

export async function POST(request: NextRequest) {
  try {
    const { currentText, allDocuments, currentDocumentId } = await request.json()

    if (!currentText || !allDocuments) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // For demo purposes, provide mock related sections
    // In production, this would analyze real document content
    const mockRelatedSections = [
      {
        id: "mock-1",
        title: "Introduction to Machine Learning",
        type: "document" as const,
        relevance: 92,
        preview: "Foundational concepts that directly relate to the current section's discussion on neural networks.",
        pageNumber: 1,
        documentName: "ML_Basics.pdf",
        explanation: "Related through shared concepts: machine learning, neural networks, algorithms"
      },
      {
        id: "mock-2",
        title: "Data Preprocessing Techniques",
        type: "document" as const,
        relevance: 87,
        preview: "Essential preprocessing steps mentioned in the current context for model preparation.",
        pageNumber: 3,
        documentName: "Data_Science_Guide.pdf",
        explanation: "Related through shared concepts: data processing, preprocessing, model preparation"
      },
      {
        id: "mock-3",
        title: "Advanced AI Applications",
        type: "research" as const,
        relevance: 85,
        preview: "Real-world applications and case studies that build upon the theoretical foundations discussed.",
        pageNumber: 5,
        documentName: "AI_Applications.pdf",
        explanation: "Related through shared concepts: AI applications, case studies, real-world examples"
      }
    ]

    return NextResponse.json({ relatedSections: mockRelatedSections })
  } catch (error) {
    console.error("Related sections error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function findSimilarSections(currentText: string, allSections: DocumentSection[]) {
  const currentWords = tokenize(currentText.toLowerCase())
  const currentWordFreq = calculateWordFrequency(currentWords)

  return allSections
    .map((section) => {
      const sectionWords = tokenize(section.content.toLowerCase())
      const sectionWordFreq = calculateWordFrequency(sectionWords)

      const similarity = cosineSimilarity(currentWordFreq, sectionWordFreq)

      return {
        ...section,
        relevance: similarity * 100,
      }
    })
    .sort((a, b) => b.relevance - a.relevance)
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !isStopWord(word))
}

function calculateWordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1)
  }
  return freq
}

function cosineSimilarity(freq1: Map<string, number>, freq2: Map<string, number>): number {
  const allWords = new Set([...freq1.keys(), ...freq2.keys()])

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (const word of allWords) {
    const f1 = freq1.get(word) || 0
    const f2 = freq2.get(word) || 0

    dotProduct += f1 * f2
    norm1 += f1 * f1
    norm2 += f2 * f2
  }

  if (norm1 === 0 || norm2 === 0) return 0

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
  ])
  return stopWords.has(word)
}

function inferDocumentType(filename: string): "document" | "article" | "research" {
  const lower = filename.toLowerCase()
  if (lower.includes("research") || lower.includes("paper") || lower.includes("study")) {
    return "research"
  }
  if (lower.includes("article") || lower.includes("blog") || lower.includes("news")) {
    return "article"
  }
  return "document"
}

function generatePreview(content: string): string {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  return sentences.slice(0, 2).join(". ").substring(0, 150) + "..."
}

function generateExplanation(currentText: string, relatedContent: string): string {
  const currentWords = tokenize(currentText.toLowerCase())
  const relatedWords = tokenize(relatedContent.toLowerCase())

  const commonWords = currentWords.filter((word) => relatedWords.includes(word))
  const keyTerms = commonWords.slice(0, 3).join(", ")

  return `Related through shared concepts: ${keyTerms}`
}
