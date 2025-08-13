
'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { ReactFlow, useNodesState, useEdgesState, Controls, Background, Node, Edge, NodeTypes, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

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

interface NodeData {
  label: string
  type: "concept" | "document" | "topic"
  frequency?: number
  document?: string
}

// Custom node component
const CustomNode = ({ data }: { data: NodeData }) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-500'
      case 'concept': return 'bg-green-500'
      case 'topic': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={`px-3 py-2 rounded-lg text-white text-sm font-medium ${getNodeColor(data.type)} shadow-lg`}>
      <div className="font-semibold">{data.label}</div>
      {data.frequency && (
        <div className="text-xs opacity-80">freq: {data.frequency}</div>
      )}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

export default function KnowledgeGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [graphStats, setGraphStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    concepts: 0,
    documents: 0,
  })

  const fetchGraphData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/graph-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch graph data: ${response.statusText}`)
      }

      const data: GraphData = await response.json()
      
      // Transform nodes for React Flow
      const flowNodes: Node[] = data.nodes.map((node, index) => ({
        id: node.id,
        type: 'custom',
        position: {
          x: Math.cos(index * 0.5) * 200 + 300,
          y: Math.sin(index * 0.5) * 200 + 300,
        },
        data: {
          label: node.label,
          type: node.type,
          frequency: node.frequency,
          document: node.document,
        },
        draggable: true,
      }))

      // Transform edges for React Flow
      const flowEdges: Edge[] = data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: edge.type === 'semantic',
        style: {
          strokeWidth: Math.max(1, edge.weight * 3),
          stroke: edge.type === 'semantic' ? '#10b981' : '#6b7280',
        },
      }))

      setNodes(flowNodes)
      setEdges(flowEdges)

      // Update stats
      setGraphStats({
        totalNodes: data.nodes.length,
        totalEdges: data.edges.length,
        concepts: data.nodes.filter(n => n.type === 'concept').length,
        documents: data.nodes.filter(n => n.type === 'document').length,
      })

    } catch (err) {
      console.error('Failed to fetch graph data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load graph data')
    } finally {
      setIsLoading(false)
    }
  }, [setNodes, setEdges])

  useEffect(() => {
    fetchGraphData()
  }, [fetchGraphData])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const refreshGraph = useCallback(() => {
    fetchGraphData()
  }, [fetchGraphData])

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          {error}
          <Button 
            onClick={refreshGraph} 
            variant="outline" 
            size="sm" 
            className="ml-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Graph Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.totalNodes}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.totalEdges}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.concepts}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Concepts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.documents}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Graph Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={refreshGraph} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-500 text-white">Documents</Badge>
          <Badge variant="secondary" className="bg-green-500 text-white">Concepts</Badge>
          <Badge variant="secondary" className="bg-purple-500 text-white">Topics</Badge>
        </div>
      </div>

      {/* Knowledge Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-96 w-full">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Node Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{selectedNode.data.label}</h4>
                    <Badge variant="outline" className="mt-1">
                      {selectedNode.data.type}
                    </Badge>
                  </div>
                  {selectedNode.data.frequency && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Frequency: {selectedNode.data.frequency}
                      </p>
                    </div>
                  )}
                  {selectedNode.data.document && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Source: {selectedNode.data.document}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Click on a node to see details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
