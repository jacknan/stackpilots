'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

function optimizeSvg(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s*(width|height)="[^"]*"/gi, '')
    .replace(/\s*data-name="[^"]*"/gi, '')
    .replace(/\s*id="[^"]*"/gi, '')
    .trim()
}

const starterSvg = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="100" height="100" rx="16" fill="#0EA5E9" />
  <path d="M36 62L52 78L84 46" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
</svg>`

export default function SvgOptimizerTool() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [input, setInput] = useState(starterSvg)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const sharedInput = searchParams.get('input')
    if (sharedInput) {
      setInput(sharedInput)
    }
  }, [searchParams])

  const stats = useMemo(() => {
    const before = input.length
    const after = output.length
    if (!output) return { before, after: 0, saved: 0 }
    return { before, after, saved: before - after }
  }, [input, output])

  const runOptimize = () => {
    if (!input.includes('<svg')) {
      setError('Input must contain valid SVG markup.')
      setOutput('')
      return
    }

    const optimized = optimizeSvg(input)
    setOutput(optimized)
    setError('')
  }

  const copyOutput = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }

  const shareState = async () => {
    const params = new URLSearchParams(searchParams.toString())
    if (input) params.set('input', input)
    else params.delete('input')
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
    await navigator.clipboard.writeText(`${window.location.origin}${nextUrl}`)
  }

  return (
    <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Interactive SVG Optimizer
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Remove unnecessary attributes and whitespace to reduce payload size for faster web
        rendering.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={runOptimize}
          className="bg-primary-600 hover:bg-primary-500 rounded-md px-4 py-2 text-sm font-semibold text-white"
        >
          Optimize
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
        <button
          onClick={() => {
            setInput('')
            setOutput('')
            setError('')
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="svg-input"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            SVG input
          </label>
          <textarea
            id="svg-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="h-56 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            spellCheck={false}
          />
        </div>

        <div>
          <label
            htmlFor="svg-output"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Optimized output
          </label>
          <textarea
            id="svg-output"
            value={output}
            readOnly
            className="h-56 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-900/70 dark:text-gray-100"
            spellCheck={false}
          />
        </div>
      </div>

      {output && (
        <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
          {'Characters: '}
          {stats.before}
          {' -> '}
          {stats.after}
          {' (saved '}
          {stats.saved}
          {')'}
        </p>
      )}
      {error && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
}
