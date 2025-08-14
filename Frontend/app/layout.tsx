
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import AdobeScript from "@/components/AdobeScript"

export const metadata: Metadata = {
  title: "Adobe Learn",
  description: "An intelligent PDF learning platform powered by AI",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AdobeScript />
        {children}
      </body>
    </html>
  )
}
