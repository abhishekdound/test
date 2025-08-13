import { type NextRequest, NextResponse } from "next/server"

interface ConceptNode {
  id: string
  label: string
  type: "concept" | "document" | "topic"
  size: number
  color: string
  document?: string
  frequency: number
}

interface ConceptEdge {
  id: string
  source: string
  target: string
  weight: number
  label: string
  type: "co-occurrence" | "semantic" | "user-created"
}

interface GraphData {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
}

// Mock concept extraction function - in production, this would use NLP libraries
function extractConcepts(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word))
  
  // Simple frequency-based concept extraction
  const wordFreq: { [key: string]: number } = {}
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })
  
  // Return top concepts by frequency
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

// Mock function to build knowledge graph from documents
function buildKnowledgeGraph(documents: any[]): GraphData {
  const nodes: ConceptNode[] = []
  const edges: ConceptEdge[] = []
  const conceptMap = new Map<string, ConceptNode>()
  const edgeMap = new Map<string, ConceptEdge>()
  
  // Extract concepts from each document
  documents.forEach((doc, docIndex) => {
    const concepts = extractConcepts(doc.content || doc.text || '')
    
    concepts.forEach((concept, conceptIndex) => {
      const conceptId = `concept-${concept}`
      
      // Create or update concept node
      if (!conceptMap.has(conceptId)) {
        conceptMap.set(conceptId, {
          id: conceptId,
          label: concept.charAt(0).toUpperCase() + concept.slice(1),
          type: "concept",
          size: 20 + Math.random() * 30,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          frequency: 1
        })
      } else {
        const existing = conceptMap.get(conceptId)!
        existing.frequency += 1
        existing.size = Math.min(80, 20 + existing.frequency * 8)
      }
      
      // Create edges between concepts in the same document
      concepts.forEach((otherConcept, otherIndex) => {
        if (conceptIndex !== otherIndex && concept !== otherConcept) {
          const edgeId = `${conceptId}-${otherConcept}`
          const reverseEdgeId = `${otherConcept}-${conceptId}`
          
          if (!edgeMap.has(edgeId) && !edgeMap.has(reverseEdgeId)) {
            const weight = 1 + Math.random() * 2
            edgeMap.set(edgeId, {
              id: edgeId,
              source: conceptId,
              target: `concept-${otherConcept}`,
              weight,
              label: `${Math.round(weight * 10) / 10}`,
              type: "co-occurrence"
            })
          } else {
            // Increase weight for existing edge
            const existingEdge = edgeMap.get(edgeId) || edgeMap.get(reverseEdgeId)!
            existingEdge.weight += 0.5
            existingEdge.label = `${Math.round(existingEdge.weight * 10) / 10}`
          }
        }
      })
    })
    
    // Add document node
    const docNode: ConceptNode = {
      id: `doc-${docIndex}`,
      label: doc.name || `Document ${docIndex + 1}`,
      type: "document",
      size: 40,
      color: "#ef4444",
      document: doc.name,
      frequency: 1
    }
    nodes.push(docNode)
    
    // Connect document to its main concepts
    const mainConcepts = concepts.slice(0, 3)
    mainConcepts.forEach(concept => {
      const conceptId = `concept-${concept}`
      const edgeId = `doc-${docIndex}-${concept}`
      
      edgeMap.set(edgeId, {
        id: edgeId,
        source: `doc-${docIndex}`,
        target: conceptId,
        weight: 2,
        label: "contains",
        type: "semantic"
      })
    })
  })
  
  // Add concept nodes
  conceptMap.forEach(node => {
    nodes.push(node)
  })
  
  // Add edges
  edgeMap.forEach(edge => {
    edges.push(edge)
  })
  
  return { nodes, edges }
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Load actual PDF metadata from your storage
    // 2. Extract concepts using NLP libraries
    // 3. Build relationships based on semantic similarity
    
    // For now, using mock data to demonstrate the concept
    const mockDocuments = [
      {
        name: "Machine Learning Basics",
        content: "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It involves algorithms that can identify patterns in data and make predictions or decisions based on those patterns.",
        text: "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It involves algorithms that can identify patterns in data and make predictions or decisions based on those patterns."
      },
      {
        name: "Data Science Fundamentals",
        content: "Data science combines statistics, mathematics, programming, and domain expertise to extract meaningful insights from large datasets. It involves data collection, cleaning, analysis, and visualization to support decision-making processes.",
        text: "Data science combines statistics, mathematics, programming, and domain expertise to extract meaningful insights from large datasets. It involves data collection, cleaning, analysis, and visualization to support decision-making processes."
      },
      {
        name: "AI Applications in Business",
        content: "Artificial intelligence is transforming business operations through automation, predictive analytics, and intelligent decision support systems. Companies are using AI to optimize processes, enhance customer experiences, and gain competitive advantages.",
        text: "Artificial intelligence is transforming business operations through automation, predictive analytics, and intelligent decision support systems. Companies are using AI to optimize processes, enhance customer experiences, and gain competitive advantages."
      }
    ]
    
    const graphData = buildKnowledgeGraph(mockDocuments)
    
    return NextResponse.json(graphData)
  } catch (error) {
    console.error("Error generating knowledge graph:", error)
    return NextResponse.json(
      { error: "Failed to generate knowledge graph" },
      { status: 500 }
    )
  }
} 