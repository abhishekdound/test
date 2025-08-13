
"use client"

import { useState, useEffect, useCallback } from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Network, Brain } from "lucide-react"

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

// Custom node component
const CustomNode = ({ data }: { data: any }) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case "document":
        return {
          background: data.color,
          border: "2px solid #ef4444",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "white",
          minWidth: "120px",
          textAlign: "center" as const,
        }
      case "concept":
        return {
          background: data.color,
          border: "2px solid #3b82f6",
          borderRadius: "50%",
          padding: "8px",
          fontSize: "11px",
          fontWeight: "600",
          color: "white",
          minWidth: `${data.size}px`,
          minHeight: `${data.size}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center" as const,
        }
      default:
        return {
          background: "#6b7280",
          border: "2px solid #374151",
          borderRadius: "6px",
          padding: "6px 10px",
          fontSize: "11px",
          color: "white",
        }
    }
  }

  return (
    <div style={getNodeStyle()}>
      <div className="font-medium">{data.label}</div>
      {data.type === "concept" && (
        <div className="text-xs opacity-80">Freq: {data.frequency}</div>
      )}
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

      const response = await fetch("/api/graph-data")
      if (!response.ok) {
        throw new Error("Failed to fetch graph data")
      }

      const data: GraphData = await response.json()

      // Convert to ReactFlow format
      const flowNodes: Node[] = data.nodes.map((node) => ({
        id: node.id,
        type: "custom",
        position: {
          x: Math.random() * 800,
          y: Math.random() * 600,
        },
        data: node,
        style: {
          width: node.type === "concept" ? node.size : "auto",
          height: node.type === "concept" ? node.size : "auto",
        },
      }))

      const flowEdges: Edge[] = data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: "smoothstep",
        style: {
          stroke: edge.type === "co-occurrence" ? "#3b82f6" : "#ef4444",
          strokeWidth: Math.max(1, edge.weight),
        },
        labelStyle: {
          fill: "#6b7280",
          fontSize: "10px",
          fontWeight: "500",
        },
      }))

      setNodes(flowNodes)
      setEdges(flowEdges)

      // Calculate stats
      setGraphStats({
        totalNodes: data.nodes.length,
        totalEdges: data.edges.length,
        concepts: data.nodes.filter(n => n.type === "concept").length,
        documents: data.nodes.filter(n => n.type === "document").length,
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [setNodes, setEdges])

  useEffect(() => {
    fetchGraphData()
  }, [fetchGraphData])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const handleRefresh = () => {
    fetchGraphData()
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Knowledge Graph Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 mb-4">{error}</div>
            <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <CardTitle className="text-white text-lg">Knowledge Graph</CardTitle>
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-600/30">
              AI Generated
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Network className="w-4 h-4" />
            <span>{graphStats.totalNodes} Nodes</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{graphStats.totalEdges} Connections</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Brain className="w-4 h-4" />
            <span>{graphStats.concepts} Concepts</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>{graphStats.documents} Documents</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-300">Building knowledge graph...</p>
              </div>
            </div>
          )}

          <div className="h-96 w-full border border-gray-600 rounded-lg overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              className="bg-gray-900"
            >
              <Background color="#374151" gap={20} />
              <Controls className="bg-gray-800 border-gray-600" />
            </ReactFlow>
          </div>

          {selectedNode && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-2">Node Details</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedNode.data.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Label:</span>
                  <span className="text-white">{selectedNode.data.label}</span>
                </div>
                {selectedNode.data.frequency && (
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span className="text-white">{selectedNode.data.frequency}</span>
                  </div>
                )}
                {selectedNode.data.document && (
                  <div className="flex justify-between">
                    <span>Document:</span>
                    <span className="text-white">{selectedNode.data.document}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <h5 className="font-medium text-white text-sm mb-2">Legend</h5>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Concepts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500"></div>
                <span>Co-occurrence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500"></div>
                <span>Semantic</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default KnowledgeGraph
