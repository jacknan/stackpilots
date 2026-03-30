'use client'

import { useEffect, useMemo, useState } from 'react'
import AdsterraBanner from '@/components/ads/AdsterraBanner'

interface AdsterraUnit {
  key: string
  scriptSrc: string
  width: number
  height: number
}

interface AdsterraResponsiveBannerProps {
  mobile: AdsterraUnit
  medium: AdsterraUnit
  desktop: AdsterraUnit
  className?: string
}

export default function AdsterraResponsiveBanner({
  mobile,
  medium,
  desktop,
  className,
}: AdsterraResponsiveBannerProps) {
  const [viewportWidth, setViewportWidth] = useState<number | null>(null)

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const unit = useMemo(() => {
    if (viewportWidth === null) return null
    if (viewportWidth >= 1200) return desktop
    if (viewportWidth >= 768) return medium
    return mobile
  }, [desktop, medium, mobile, viewportWidth])

  if (!unit || !unit.key || !unit.scriptSrc) return null

  return (
    <AdsterraBanner
      adKey={unit.key}
      scriptSrc={unit.scriptSrc}
      width={unit.width}
      height={unit.height}
      className={className}
    />
  )
}
