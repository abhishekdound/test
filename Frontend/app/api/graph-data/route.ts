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
function extractConcepts(text: string): ConceptNode[] {
  const concepts = [
    'artificial intelligence', 'machine learning', 'neural networks', 'deep learning',
    'data science', 'algorithms', 'statistics', 'programming', 'python', 'analysis'
  ]

  return concepts.map((concept, index) => ({
    id: `concept-${index}`,
    label: concept,
    type: "concept" as const,
    size: Math.floor(Math.random() * 50) + 30,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
    frequency: Math.floor(Math.random() * 20) + 1
  }))
}

// Mock document nodes
function createDocumentNodes(): ConceptNode[] {
  const documents = [
    'AI Fundamentals.pdf',
    'Machine Learning Guide.pdf',
    'Data Science Handbook.pdf'
  ]

  return documents.map((doc, index) => ({
    id: `doc-${index}`,
    label: doc,
    type: "document" as const,
    size: 80,
    color: '#ef4444',
    document: doc,
    frequency: 1
  }))
}

// Mock edges creation
function createEdges(nodes: ConceptNode[]): ConceptEdge[] {
  const edges: ConceptEdge[] = []
  const concepts = nodes.filter(n => n.type === 'concept')
  const documents = nodes.filter(n => n.type === 'document')

  // Connect concepts to documents
  documents.forEach(doc => {
    const numConnections = Math.floor(Math.random() * 3) + 2
    const connectedConcepts = concepts.slice(0, numConnections)

    connectedConcepts.forEach(concept => {
      edges.push({
        id: `edge-${doc.id}-${concept.id}`,
        source: doc.id,
        target: concept.id,
        weight: Math.floor(Math.random() * 3) + 1,
        label: 'contains',
        type: 'semantic'
      })
    })
  })

  // Connect concepts to each other
  for (let i = 0; i < concepts.length - 1; i++) {
    if (Math.random() > 0.7) {
      edges.push({
        id: `edge-${concepts[i].id}-${concepts[i + 1].id}`,
        source: concepts[i].id,
        target: concepts[i + 1].id,
        weight: Math.floor(Math.random() * 2) + 1,
        label: 'related',
        type: 'co-occurrence'
      })
    }
  }

  return edges
}

export async function GET() {
  try {
    // In a real implementation, this would extract concepts from uploaded documents
    const mockText = "This is a sample document about artificial intelligence and machine learning..."

    const conceptNodes = extractConcepts(mockText)
    const documentNodes = createDocumentNodes()
    const allNodes = [...documentNodes, ...conceptNodes]
    const edges = createEdges(allNodes)

    const graphData: GraphData = {
      nodes: allNodes,
      edges: edges
    }

    return NextResponse.json(graphData)
  } catch (error) {
    console.error('Error generating graph data:', error)
    return NextResponse.json(
      { error: 'Failed to generate graph data' },
      { status: 500 }
    )
  }
}