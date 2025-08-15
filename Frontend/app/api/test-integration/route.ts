import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    // Test backend health
    const healthResponse = await fetch(`${API_BASE_URL}/api/frontend/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!healthResponse.ok) {
      throw new Error(`Backend health check failed: ${healthResponse.status}`)
    }

    const healthData = await healthResponse.json()

    // Test performance endpoint
    const performanceResponse = await fetch(`${API_BASE_URL}/api/adobe/performance`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const performanceData = performanceResponse.ok ? await performanceResponse.json() : null

    return NextResponse.json({
      success: true,
      backend: {
        status: 'connected',
        health: healthData,
        performance: performanceData
      },
      frontend: {
        status: 'running',
        timestamp: new Date().toISOString()
      },
      integration: {
        status: 'healthy',
        message: 'Backend and frontend are properly connected'
      }
    })

  } catch (error) {
    console.error('Integration test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      backend: {
        status: 'disconnected',
        message: 'Backend is not responding'
      },
      frontend: {
        status: 'running',
        timestamp: new Date().toISOString()
      },
      integration: {
        status: 'failed',
        message: 'Backend and frontend are not properly connected'
      }
    }, { status: 500 })
  }
}
