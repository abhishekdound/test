# 🧠 Knowledge Graph Feature - Adobe Learn

## Overview
The Knowledge Graph is an interactive visualization that shows the relationships between concepts across all uploaded PDF documents. It transforms your documents into a connected network of ideas, making it easier to discover patterns and connections.

## ✨ Features

### 1. **Interactive Graph Visualization**
- **Nodes**: Represent concepts, documents, and topics
- **Edges**: Show relationships and connections between concepts
- **Interactive**: Pan, zoom, and click on nodes for details

### 2. **Smart Concept Extraction**
- Automatically identifies key concepts from PDF content
- Frequency-based concept ranking
- Co-occurrence analysis for relationship mapping

### 3. **Visual Design**
- **Document Nodes**: Red rectangular nodes representing PDF files
- **Concept Nodes**: Colorful circular nodes with size based on frequency
- **Relationship Edges**: Different colors for different relationship types
- **Professional UI**: Clean, modern interface with Adobe-inspired design

### 4. **Real-time Statistics**
- Total nodes and connections
- Concept and document counts
- Dynamic updates as documents are added

## 🚀 How to Use

### Accessing the Knowledge Graph
1. Open Adobe Learn application
2. Click on the **"Knowledge Graph"** tab (purple tab)
3. The graph will automatically load and display

### Interacting with the Graph
- **Pan**: Click and drag to move around the graph
- **Zoom**: Use mouse wheel or zoom controls
- **Select Nodes**: Click on any node to see detailed information
- **Refresh**: Click the refresh button to regenerate the graph

### Understanding the Visualization
- **Red Rectangles**: Your uploaded PDF documents
- **Colored Circles**: Extracted concepts (size indicates frequency)
- **Blue Lines**: Co-occurrence relationships between concepts
- **Red Lines**: Document-to-concept relationships

## 🔧 Technical Implementation

### Backend API
- **Endpoint**: `/api/graph-data`
- **Method**: GET
- **Response**: JSON with nodes and edges data

### Frontend Component
- **Component**: `components/KnowledgeGraph.tsx`
- **Library**: ReactFlow for graph rendering
- **State Management**: React hooks for data and interactions

### Data Structure
```typescript
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
```

## 🎯 Future Enhancements

### Phase 2: Interactive Annotations
- User-created notes and connections
- Custom relationship definitions
- Collaborative knowledge building

### Phase 3: Advanced AI Insights
- Q&A interface with document context
- ELI5 explanations at different complexity levels
- Conversation history and follow-up questions

## 🛠️ Dependencies

### New Packages Added
- `reactflow`: Interactive graph visualization
- `networkx`: Graph analysis and algorithms (backend)

### Existing Dependencies Used
- Next.js 14 API routes
- Tailwind CSS for styling
- Lucide React for icons

## 📱 Responsive Design
- Works on desktop and mobile devices
- Adaptive graph sizing
- Touch-friendly interactions

## 🔍 Troubleshooting

### Common Issues
1. **Graph not loading**: Check browser console for errors
2. **Empty graph**: Ensure PDFs are uploaded first
3. **Performance issues**: Large graphs may take time to render

### Performance Tips
- Limit to reasonable number of documents for optimal performance
- Use the refresh button if the graph becomes unresponsive
- Close other browser tabs to free up memory

## 🎨 Customization

### Styling
- Node colors and sizes can be modified in `KnowledgeGraph.tsx`
- Graph layout and positioning can be adjusted
- Theme colors follow Adobe Learn's design system

### Data Sources
- Currently uses mock data for demonstration
- Can be connected to real PDF analysis results
- Supports custom concept extraction algorithms

---

**Note**: This is Phase 1 of the Knowledge Graph implementation. Future phases will add more interactive features and AI-powered insights. 