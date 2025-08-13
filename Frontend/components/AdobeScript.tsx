
'use client'

import { useEffect } from 'react'

export default function AdobeScript() {
  useEffect(() => {
    // Load Adobe script dynamically on client side
    if (typeof window !== 'undefined' && !window.AdobeDC) {
      const script = document.createElement('script')
      script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js'
      script.async = true
      document.head.appendChild(script)
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }
  }, [])

  return null
}
