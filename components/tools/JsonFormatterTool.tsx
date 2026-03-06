'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const starterJson = `{"name":"StackPilots","type":"developer-tools","topics":["AI","Next.js","SEO"]}`

export default function JsonFormatterTool() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [input, setInput] = useState(starterJson)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const sharedInput = searchParams.get('input')
    if (sharedInput) {
      setInput(sharedInput)
    }
  }, [searchParams])

  const runFormat = (space: number) => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, space))
      setError('')
    } catch {
      setOutput('')
      setError('Invalid JSON. Check commas, quotes, and brackets.')
    }
  }

  const runMinify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch {
      setOutput('')
      setError('Invalid JSON. Unable to minify.')
    }
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }

  const shareCurrentInput = async () => {
    const params = new URLSearchParams(searchParams.toString())
    if (input) {
      params.set('input', input)
    } else {
      params.delete('input')
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
    await navigator.clipboard.writeText(`${window.location.origin}${nextUrl}`)
  }

  return (
    <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Interactive JSON Formatter
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runFormat(2)}
            className="bg-primary-600 hover:bg-primary-500 rounded-md px-3 py-1.5 text-sm font-semibold text-white"
          >
            Format
          </button>
          <button
            onClick={() => runFormat(4)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            4-space
          </button>
          <button
            onClick={runMinify}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Minify
          </button>
          <button
            onClick={copyOutput}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Copy
          </button>
          <button
            onClick={shareCurrentInput}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Share link
          </button>
          <button
            onClick={() => {
              setInput('')
              setOutput('')
              setError('')
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="json-input"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Input JSON
          </label>
          <textarea
            id="json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="h-64 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            spellCheck={false}
          />
        </div>

        <div>
          <label
            htmlFor="json-output"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Output
          </label>
          <textarea
            id="json-output"
            value={output}
            readOnly
            className="h-64 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-900/70 dark:text-gray-100"
            spellCheck={false}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
}
