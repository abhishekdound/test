
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
    'Machine Learning', 'Artificial Intelligence', 'Neural Networks', 'Deep Learning',
    'Data Science', 'Algorithm', 'Training', 'Model', 'Feature', 'Dataset',
    'Classification', 'Regression', 'Clustering', 'Supervised Learning',
    'Unsupervised Learning', 'Reinforcement Learning', 'Computer Vision',
    'Natural Language Processing', 'Big Data', 'Analytics'
  ]

  return concepts.map((concept, index) => ({
    id: `concept-${index}`,
    label: concept,
    type: 'concept' as const,
    size: Math.random() * 50 + 20,
    color: '#10b981',
    frequency: Math.floor(Math.random() * 100) + 1,
  }))
}

function generateMockGraphData(): GraphData {
  // Generate mock nodes
  const conceptNodes = extractConcepts('')
  const documentNodes: ConceptNode[] = [
    {
      id: 'doc-1',
      label: 'AI Fundamentals.pdf',
      type: 'document',
      size: 60,
      color: '#3b82f6',
      document: 'AI Fundamentals.pdf',
      frequency: 1,
    },
    {
      id: 'doc-2',
      label: 'ML Algorithms.pdf',
      type: 'document',
      size: 60,
      color: '#3b82f6',
      document: 'ML Algorithms.pdf',
      frequency: 1,
    },
    {
      id: 'doc-3',
      label: 'Deep Learning Guide.pdf',
      type: 'document',
      size: 60,
      color: '#3b82f6',
      document: 'Deep Learning Guide.pdf',
      frequency: 1,
    },
  ]

  const topicNodes: ConceptNode[] = [
    {
      id: 'topic-1',
      label: 'Mathematics',
      type: 'topic',
      size: 40,
      color: '#8b5cf6',
      frequency: 15,
    },
    {
      id: 'topic-2',
      label: 'Programming',
      type: 'topic',
      size: 40,
      color: '#8b5cf6',
      frequency: 12,
    },
    {
      id: 'topic-3',
      label: 'Statistics',
      type: 'topic',
      size: 40,
      color: '#8b5cf6',
      frequency: 18,
    },
  ]

  const allNodes = [...conceptNodes.slice(0, 10), ...documentNodes, ...topicNodes]

  // Generate mock edges
  const edges: ConceptEdge[] = []
  
  // Connect documents to concepts
  documentNodes.forEach((doc, docIndex) => {
    const conceptsToConnect = conceptNodes.slice(docIndex * 3, (docIndex + 1) * 3 + 2)
    conceptsToConnect.forEach((concept, conceptIndex) => {
      edges.push({
        id: `edge-doc-${docIndex}-concept-${conceptIndex}`,
        source: doc.id,
        target: concept.id,
        weight: Math.random() * 0.8 + 0.2,
        label: 'contains',
        type: 'co-occurrence',
      })
    })
  })

  // Connect topics to concepts
  topicNodes.forEach((topic, topicIndex) => {
    const conceptsToConnect = conceptNodes.slice(topicIndex * 2, (topicIndex + 1) * 2 + 3)
    conceptsToConnect.forEach((concept, conceptIndex) => {
      edges.push({
        id: `edge-topic-${topicIndex}-concept-${conceptIndex}`,
        source: topic.id,
        target: concept.id,
        weight: Math.random() * 0.9 + 0.1,
        label: 'relates to',
        type: 'semantic',
      })
    })
  })

  // Connect some concepts to each other
  for (let i = 0; i < conceptNodes.length - 1; i++) {
    if (Math.random() > 0.7) {
      edges.push({
        id: `edge-concept-${i}-${i + 1}`,
        source: conceptNodes[i].id,
        target: conceptNodes[i + 1].id,
        weight: Math.random() * 0.6 + 0.1,
        label: 'similar to',
        type: 'semantic',
      })
    }
  }

  return {
    nodes: allNodes,
    edges: edges,
  }
}

export async function GET() {
  try {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const graphData = generateMockGraphData()

    return NextResponse.json(graphData)
  } catch (error) {
    console.error('Graph data generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate graph data' },
      { status: 500 }
    )
  }
}
