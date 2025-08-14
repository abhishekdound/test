
'use client'

import { useEffect, useState } from 'react'

export default function AdobeScript() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Check if Adobe PDF Embed API script is already loaded
    if (window.AdobeDC) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js'
    script.async = true
    script.onload = () => {
      console.log('Adobe PDF Embed API loaded')
    }
    script.onerror = () => {
      console.error('Failed to load Adobe PDF Embed API')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector('script[src="https://acrobatservices.adobe.com/view-sdk/viewer.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [isClient])

  if (!isClient) {
    return null
  }

  return null
}
