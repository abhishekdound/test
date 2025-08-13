'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    AdobeDC?: any
  }
}

export default function AdobeScript() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.AdobeDC && !document.querySelector('script[src*="acrobatservices.adobe.com"]')) {
      const script = document.createElement('script')
      script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js'
      script.async = true
      script.onload = () => {
        console.log('Adobe View SDK loaded')
      }
      script.onerror = () => {
        console.error('Failed to load Adobe View SDK')
      }
      document.head.appendChild(script)
    }
  }, [])

  return null
}