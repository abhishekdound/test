'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    AdobeDC?: any
  }
}

export default function AdobeScript() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Only load if not already loaded and we're on client side
    if (typeof window !== 'undefined' && !window.AdobeDC) {
      const script = document.createElement('script')
      script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js'
      script.async = true
      script.onload = () => {
        console.log('Adobe PDF Embed API loaded successfully')
      }
      script.onerror = () => {
        console.error('Failed to load Adobe PDF Embed API')
      }

      document.head.appendChild(script)

      return () => {
        // Cleanup if needed
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  return null
}