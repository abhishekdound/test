
'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    AdobeDC?: any
  }
}

export default function AdobeScript() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return

    // Check if Adobe DC is already loaded
    if (window.AdobeDC) {
      setIsLoaded(true)
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="acrobatservices.adobe.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true))
      existingScript.addEventListener('error', () => setError('Failed to load Adobe PDF SDK'))
      return
    }

    // Load the Adobe PDF Embed API script
    const script = document.createElement('script')
    script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js'
    script.async = true
    
    script.onload = () => {
      console.log('Adobe PDF Embed API loaded successfully')
      setIsLoaded(true)
    }
    
    script.onerror = () => {
      console.error('Failed to load Adobe PDF Embed API')
      setError('Failed to load Adobe PDF SDK')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
