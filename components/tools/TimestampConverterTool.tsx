'use client'

import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type TimeMode = 'seconds' | 'milliseconds'

function toIsoFromUnix(value: string, mode: TimeMode): string {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return ''
  const ms = mode === 'seconds' ? numeric * 1000 : numeric
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

export default function TimestampConverterTool() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [unixInput, setUnixInput] = useState('1704067200')
  const [mode, setMode] = useState<TimeMode>('seconds')
  const [dateInput, setDateInput] = useState('2025-01-01T00:00')

  useEffect(() => {
    const sharedUnix = searchParams.get('unix')
    const sharedMode = searchParams.get('mode')
    const sharedDate = searchParams.get('date')
    if (sharedUnix) setUnixInput(sharedUnix)
    if (sharedMode === 'seconds' || sharedMode === 'milliseconds') setMode(sharedMode)
    if (sharedDate) setDateInput(sharedDate)
  }, [searchParams])

  const isoDate = useMemo(() => toIsoFromUnix(unixInput, mode), [unixInput, mode])

  const reverseValue = useMemo(() => {
    const date = new Date(dateInput)
    if (Number.isNaN(date.getTime())) return ''
    return mode === 'seconds'
      ? Math.floor(date.getTime() / 1000).toString()
      : date.getTime().toString()
  }, [dateInput, mode])

  const shareState = async () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('unix', unixInput)
    params.set('mode', mode)
    params.set('date', dateInput)
    const nextUrl = `${pathname}?${params.toString()}`
    router.replace(nextUrl, { scroll: false })
    await navigator.clipboard.writeText(`${window.location.origin}${nextUrl}`)
  }

  return (
    <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Interactive Timestamp Converter
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Convert Unix timestamps to readable dates and convert calendar time back to Unix format.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="unix-input"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Unix input
          </label>
          <input
            id="unix-input"
            value={unixInput}
            onChange={(event) => setUnixInput(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Parsed UTC: {isoDate || 'Invalid timestamp'}
          </p>
        </div>

        <div>
          <label
            htmlFor="datetime-input"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Date input
          </label>
          <input
            id="datetime-input"
            type="datetime-local"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Unix value: {reverseValue || 'Invalid date'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setMode('seconds')}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
            mode === 'seconds'
              ? 'bg-primary-600 text-white'
              : 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'
          }`}
        >
          Seconds
        </button>
        <button
          onClick={() => setMode('milliseconds')}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
            mode === 'milliseconds'
              ? 'bg-primary-600 text-white'
              : 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'
          }`}
        >
          Milliseconds
        </button>
        <button
          onClick={shareState}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          Share link
        </button>
      </div>
    </section>
  )
}
