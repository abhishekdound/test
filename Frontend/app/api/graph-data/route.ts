
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
    "Machine Learning", "Artificial Intelligence", "Neural Networks", 
    "Data Science", "Deep Learning", "Computer Vision", "Natural Language Processing",
    "Algorithms", "Statistics", "Python", "TensorFlow", "PyTorch"
  ]
  
  return concepts.map((concept, index) => ({
    id: `concept-${index}`,
    label: concept,
    type: "concept" as const,
    size: 60 + Math.random() * 40,
    color: `hsl(${200 + index * 15}, 70%, 50%)`,
    frequency: Math.floor(Math.random() * 50) + 10
  }))
}

// Mock document nodes
function createDocumentNodes(): ConceptNode[] {
  const documents = [
    "ML_Fundamentals.pdf", 
    "Deep_Learning_Guide.pdf", 
    "Data_Science_Handbook.pdf",
    "AI_Ethics.pdf"
  ]
  
  return documents.map((doc, index) => ({
    id: `doc-${index}`,
    label: doc,
    type: "document" as const,
    size: 80,
    color: `hsl(${0 + index * 20}, 80%, 50%)`,
    document: doc,
    frequency: Math.floor(Math.random() * 30) + 20
  }))
}

// Mock edge creation
function createEdges(nodes: ConceptNode[]): ConceptEdge[] {
  const edges: ConceptEdge[] = []
  
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 1; j < Math.min(i + 3, nodes.length); j++) {
      if (Math.random() > 0.7) {
        edges.push({
          id: `edge-${i}-${j}`,
          source: nodes[i].id,
          target: nodes[j].id,
          weight: Math.random() * 3 + 1,
          label: `${Math.floor(Math.random() * 100)}%`,
          type: Math.random() > 0.5 ? "co-occurrence" : "semantic"
        })
      }
    }
  }
  
  return edges
}

export async function GET() {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock graph data
    const conceptNodes = extractConcepts("Sample text for concept extraction")
    const documentNodes = createDocumentNodes()
    const allNodes = [...conceptNodes, ...documentNodes]
    const edges = createEdges(allNodes)
    
    const graphData: GraphData = {
      nodes: allNodes,
      edges: edges
    }
    
    return NextResponse.json(graphData)
  } catch (error) {
    console.error('Graph data generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate graph data' },
      { status: 500 }
    )
  }
}
