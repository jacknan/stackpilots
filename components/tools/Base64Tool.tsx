'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

function toUrlSafe(value: string): string {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromUrlSafe(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
}

export default function Base64Tool() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [input, setInput] = useState('StackPilots developer tools')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)

  useEffect(() => {
    const sharedInput = searchParams.get('input')
    const sharedUrlSafe = searchParams.get('urlSafe')
    if (sharedInput) setInput(sharedInput)
    if (sharedUrlSafe === '1') setUrlSafe(true)
  }, [searchParams])

  const encode = () => {
    try {
      const bytes = new TextEncoder().encode(input)
      const binary = Array.from(bytes)
        .map((byte) => String.fromCharCode(byte))
        .join('')
      const encoded = btoa(binary)
      setOutput(urlSafe ? toUrlSafe(encoded) : encoded)
      setError('')
    } catch {
      setError('Unable to encode input.')
      setOutput('')
    }
  }

  const decode = () => {
    try {
      const value = urlSafe ? fromUrlSafe(input) : input
      const binary = atob(value)
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
      setOutput(new TextDecoder().decode(bytes))
      setError('')
    } catch {
      setError('Unable to decode Base64 input.')
      setOutput('')
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }

  const shareState = async () => {
    const params = new URLSearchParams(searchParams.toString())
    if (input) params.set('input', input)
    else params.delete('input')
    if (urlSafe) params.set('urlSafe', '1')
    else params.delete('urlSafe')
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
    await navigator.clipboard.writeText(`${window.location.origin}${nextUrl}`)
  }

  return (
    <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Interactive Base64 Tool
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Encode plain text to Base64 or decode Base64 strings back to readable text.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={encode}
          className="bg-primary-600 hover:bg-primary-500 rounded-md px-4 py-2 text-sm font-semibold text-white"
        >
          Encode
        </button>
        <button
          onClick={decode}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Decode
        </button>
        <button
          onClick={copyOutput}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Copy output
        </button>
        <button
          onClick={shareState}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Share link
        </button>
        <label className="ml-2 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(event) => setUrlSafe(event.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          URL-safe mode
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="base64-input"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Input
          </label>
          <textarea
            id="base64-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="h-48 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            spellCheck={false}
          />
        </div>
        <div>
          <label
            htmlFor="base64-output"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Output
          </label>
          <textarea
            id="base64-output"
            value={output}
            readOnly
            className="h-48 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-900/70 dark:text-gray-100"
            spellCheck={false}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
}
