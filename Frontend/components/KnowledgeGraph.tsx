
'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { ReactFlow, useNodesState, useEdgesState, Controls, Background, Node, Edge, NodeTypes, Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

// Custom Node Component
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
      data.type === 'concept' ? 'border-blue-500' : 
      data.type === 'document' ? 'border-green-500' : 
      'border-purple-500'
    }`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">
            {data.type} • freq: {data.frequency}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

function KnowledgeGraph() {
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

      const response = await fetch('http://localhost:8080/api/frontend/graph-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: GraphData = await response.json()

      // Transform nodes for React Flow
      const flowNodes: Node[] = data.nodes.map((node, index) => ({
        id: node.id,
        type: 'custom',
        position: {
          x: Math.cos(index * 0.5) * 200 + 400,
          y: Math.sin(index * 0.5) * 200 + 300,
        },
        data: {
          label: node.label,
          type: node.type,
          frequency: node.frequency,
          size: node.size,
          color: node.color,
        },
      }))

      // Transform edges for React Flow
      const flowEdges: Edge[] = data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        style: { strokeWidth: Math.max(1, edge.weight * 3) },
        labelStyle: { fontSize: 12, fontWeight: 'bold' },
      }))

      setNodes(flowNodes)
      setEdges(flowEdges)

      // Update stats
      const concepts = data.nodes.filter(n => n.type === 'concept').length
      const documents = data.nodes.filter(n => n.type === 'document').length
      
      setGraphStats({
        totalNodes: data.nodes.length,
        totalEdges: data.edges.length,
        concepts,
        documents,
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  if (error) {
    return (
      <Card className="w-full h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            Knowledge Graph - Error
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchGraphData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Graph Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.totalNodes}</div>
            <p className="text-sm text-muted-foreground">Total Nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.totalEdges}</div>
            <p className="text-sm text-muted-foreground">Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.concepts}</div>
            <p className="text-sm text-muted-foreground">Concepts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{graphStats.documents}</div>
            <p className="text-sm text-muted-foreground">Documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Graph Container */}
      <Card className="w-full h-96">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Graph</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGraphData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-80 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading knowledge graph...</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              className="bg-gray-50 dark:bg-gray-900"
            >
              <Controls />
              <Background />
            </ReactFlow>
          )}
        </CardContent>
      </Card>

      {/* Selected Node Info */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle>Node Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Label:</strong> {selectedNode.data.label}</div>
              <div><strong>Type:</strong> <Badge variant="outline">{selectedNode.data.type}</Badge></div>
              <div><strong>Frequency:</strong> {selectedNode.data.frequency}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default KnowledgeGraph
