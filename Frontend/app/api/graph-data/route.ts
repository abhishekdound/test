import { NextResponse } from 'next/server'

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

// Mock concept extraction function
function extractConcepts(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word))

  const wordFreq: { [key: string]: number } = {}
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })

  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

function buildKnowledgeGraph(documents: any[]): GraphData {
  const nodes: ConceptNode[] = []
  const edges: ConceptEdge[] = []
  const conceptMap = new Map<string, ConceptNode>()
  const edgeMap = new Map<string, ConceptEdge>()

  // Add document nodes
  documents.forEach((doc, docIndex) => {
    const docId = `doc-${docIndex}`
    nodes.push({
      id: docId,
      label: doc.name,
      type: "document",
      size: 60,
      color: "#ef4444",
      document: doc.name,
      frequency: 1
    })

    const concepts = extractConcepts(doc.content || doc.text || '')

    concepts.forEach((concept) => {
      const conceptId = `concept-${concept}`

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

      // Create edge from document to concept
      const docConceptEdgeId = `${docId}-${conceptId}`
      if (!edgeMap.has(docConceptEdgeId)) {
        edgeMap.set(docConceptEdgeId, {
          id: docConceptEdgeId,
          source: docId,
          target: conceptId,
          weight: 2,
          label: "contains",
          type: "semantic"
        })
      }
    })

    // Create edges between concepts in the same document
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const concept1 = `concept-${concepts[i]}`
        const concept2 = `concept-${concepts[j]}`
        const edgeId = `${concept1}-${concept2}`
        const reverseEdgeId = `${concept2}-${concept1}`

        if (!edgeMap.has(edgeId) && !edgeMap.has(reverseEdgeId)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: concept1,
            target: concept2,
            weight: 1 + Math.random() * 2,
            label: "co-occurs",
            type: "co-occurrence"
          })
        }
      }
    }
  })

  // Add concept nodes
  conceptMap.forEach(node => nodes.push(node))

  // Add edges
  edgeMap.forEach(edge => edges.push(edge))

  return { nodes, edges }
}

export async function GET() {
  try {
    // Mock documents for demonstration
    const mockDocuments = [
      {
        name: "Machine Learning Fundamentals",
        content: "Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models. It enables computers to learn and improve from experience without being explicitly programmed. Key concepts include supervised learning, unsupervised learning, neural networks, and deep learning.",
        text: "Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models. It enables computers to learn and improve from experience without being explicitly programmed. Key concepts include supervised learning, unsupervised learning, neural networks, and deep learning."
      },
      {
        name: "Data Science Applications", 
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
import { NextResponse } from 'next/server'

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

export async function GET() {
  try {
    // For demonstration, return mock data
    // In a real application, this would fetch from your backend
    const mockGraphData: GraphData = {
      nodes: [
        {
          id: "doc1",
          label: "Machine Learning Guide",
          type: "document",
          size: 80,
          color: "#ef4444",
          frequency: 1
        },
        {
          id: "doc2", 
          label: "Data Science Handbook",
          type: "document",
          size: 80,
          color: "#ef4444",
          frequency: 1
        },
        {
          id: "concept1",
          label: "Neural Networks",
          type: "concept",
          size: 60,
          color: "#3b82f6",
          frequency: 15
        },
        {
          id: "concept2",
          label: "Data Processing",
          type: "concept", 
          size: 50,
          color: "#3b82f6",
          frequency: 8
        },
        {
          id: "concept3",
          label: "Algorithms",
          type: "concept",
          size: 45,
          color: "#3b82f6",
          frequency: 12
        }
      ],
      edges: [
        {
          id: "edge1",
          source: "doc1",
          target: "concept1",
          weight: 3,
          label: "contains",
          type: "co-occurrence"
        },
        {
          id: "edge2",
          source: "doc2",
          target: "concept2",
          weight: 2,
          label: "discusses",
          type: "co-occurrence"
        },
        {
          id: "edge3",
          source: "concept1",
          target: "concept3",
          weight: 1,
          label: "related to",
          type: "semantic"
        }
      ]
    }

    return NextResponse.json(mockGraphData)
  } catch (error) {
    console.error('Error fetching graph data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch graph data' },
      { status: 500 }
    )
  }
}
