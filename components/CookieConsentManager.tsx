'use client'

import { useEffect, useState } from 'react'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import Link from '@/components/Link'

const CONSENT_STORAGE_KEY = 'stackpilots_cookie_consent'

type ConsentValue = 'accepted' | 'rejected' | null

function getStoredConsent(): ConsentValue {
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  if (value === 'accepted' || value === 'rejected') {
    return value
  }
  return null
}

export default function CookieConsentManager({
  analyticsConfig,
}: {
  analyticsConfig: AnalyticsConfig
}) {
  const [consent, setConsent] = useState<ConsentValue>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setConsent(getStoredConsent())
    setIsReady(true)
  }, [])

  const updateConsent = (nextConsent: Exclude<ConsentValue, null>) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, nextConsent)
    setConsent(nextConsent)
  }

  const shouldShowBanner = isReady && consent === null

  return (
    <>
      {consent === 'accepted' && <Analytics analyticsConfig={analyticsConfig} />}

      {shouldShowBanner && (
        <div className="fixed right-4 bottom-4 left-4 z-[100] mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-xl sm:left-auto dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            We use essential cookies and optional analytics cookies to understand traffic and
            improve StackPilots. Choose your preference.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateConsent('accepted')}
              className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Accept analytics
            </button>
            <button
              type="button"
              onClick={() => updateConsent('rejected')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              Only essential
            </button>
            <Link
              href="/cookie-policy"
              className="text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cookie policy
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
