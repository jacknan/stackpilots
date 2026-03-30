'use client'

import { useEffect, useRef } from 'react'

interface AdsterraBannerProps {
  adKey: string
  scriptSrc: string
  width: number
  height: number
  className?: string
}

declare global {
  interface Window {
    atOptions?: {
      key: string
      format: 'iframe'
      height: number
      width: number
      params: Record<string, string>
    }
  }
}

export default function AdsterraBanner({
  adKey,
  scriptSrc,
  width,
  height,
  className,
}: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !adKey || !scriptSrc) return

    container.innerHTML = ''

    const optionsScript = document.createElement('script')
    optionsScript.type = 'text/javascript'
    optionsScript.text = `window.atOptions = ${JSON.stringify({
      key: adKey,
      format: 'iframe',
      height,
      width,
      params: {},
    })};`

    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.src = scriptSrc
    invokeScript.async = true

    container.appendChild(optionsScript)
    container.appendChild(invokeScript)

    return () => {
      container.innerHTML = ''
    }
  }, [adKey, scriptSrc, height, width])

  return (
    <div className={className}>
      <div ref={containerRef} style={{ minHeight: `${height}px`, minWidth: `${width}px` }} />
    </div>
  )
}
