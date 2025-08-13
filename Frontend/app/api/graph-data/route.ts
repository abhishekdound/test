
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
  const mockConcepts = [
    { id: '1', label: 'Machine Learning', type: 'concept' as const, size: 20, color: '#3b82f6', frequency: 15 },
    { id: '2', label: 'Neural Networks', type: 'concept' as const, size: 18, color: '#8b5cf6', frequency: 12 },
    { id: '3', label: 'Data Science', type: 'concept' as const, size: 16, color: '#10b981', frequency: 10 },
    { id: '4', label: 'Algorithm', type: 'concept' as const, size: 14, color: '#f59e0b', frequency: 8 },
    { id: '5', label: 'Document A', type: 'document' as const, size: 12, color: '#ef4444', frequency: 5 },
    { id: '6', label: 'Deep Learning', type: 'topic' as const, size: 15, color: '#06b6d4', frequency: 7 },
  ]
  
  return mockConcepts
}

// Mock edge generation
function generateEdges(nodes: ConceptNode[]): ConceptEdge[] {
  const edges: ConceptEdge[] = []
  
  // Create some meaningful connections
  edges.push(
    { id: 'e1-2', source: '1', target: '2', weight: 0.8, label: 'related', type: 'semantic' },
    { id: 'e1-3', source: '1', target: '3', weight: 0.6, label: 'part of', type: 'semantic' },
    { id: 'e2-6', source: '2', target: '6', weight: 0.9, label: 'subset', type: 'semantic' },
    { id: 'e3-4', source: '3', target: '4', weight: 0.5, label: 'uses', type: 'co-occurrence' },
    { id: 'e5-1', source: '5', target: '1', weight: 0.7, label: 'contains', type: 'co-occurrence' },
    { id: 'e5-2', source: '5', target: '2', weight: 0.4, label: 'mentions', type: 'co-occurrence' },
  )
  
  return edges
}

export async function GET() {
  try {
    // In a real implementation, this would:
    // 1. Fetch processed documents from the backend
    // 2. Extract concepts using NLP
    // 3. Generate relationships between concepts
    // 4. Create graph structure
    
    // For now, return mock data
    const mockText = "This is mock document text for concept extraction"
    const nodes = extractConcepts(mockText)
    const edges = generateEdges(nodes)
    
    const graphData: GraphData = {
      nodes,
      edges
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
