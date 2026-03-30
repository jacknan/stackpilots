'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import AdsterraResponsiveBanner from '@/components/ads/AdsterraResponsiveBanner'

const mobileBanner = {
  key: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_MOBILE_KEY || 'b82be0fede991af90817c4db78e6f327',
  scriptSrc:
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_MOBILE_SRC ||
    'https://www.highperformanceformat.com/b82be0fede991af90817c4db78e6f327/invoke.js',
  width: 320,
  height: 50,
}

const mediumBanner = {
  key: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_RECT_KEY || '6274b0e36aef3eb9b13d943694fdb868',
  scriptSrc:
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_RECT_SRC ||
    'https://www.highperformanceformat.com/6274b0e36aef3eb9b13d943694fdb868/invoke.js',
  width: 300,
  height: 250,
}

const desktopBanner = {
  key: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_DESKTOP_KEY || 'cf4e42705131c9ed3f786b9526d8ab03',
  scriptSrc:
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_DESKTOP_SRC ||
    'https://www.highperformanceformat.com/cf4e42705131c9ed3f786b9526d8ab03/invoke.js',
  width: 728,
  height: 90,
}

function isBlogDetailRoute(pathname: string) {
  if (!pathname.startsWith('/blog/')) return false
  if (pathname === '/blog') return false
  if (pathname.startsWith('/blog/page/')) return false
  return true
}

export default function GlobalAdSlot() {
  const pathname = usePathname() || '/'

  const shouldRender = useMemo(() => {
    if (process.env.NODE_ENV !== 'production') return false
    if (isBlogDetailRoute(pathname)) return false
    return true
  }, [pathname])

  if (!shouldRender) return null

  return (
    <div className="border-t border-gray-200 pt-8 pb-2 dark:border-gray-700">
      <p className="mb-3 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Sponsored
      </p>
      <AdsterraResponsiveBanner
        mobile={mobileBanner}
        medium={mediumBanner}
        desktop={desktopBanner}
        className="flex justify-center"
      />
    </div>
  )
}
