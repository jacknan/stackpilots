'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type MatchResult = {
  match: string
  index: number
  groups: Record<string, string> | null
}

export default function RegexTesterTool() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pattern, setPattern] = useState('\\b(next|react)\\b')
  const [flags, setFlags] = useState('gi')
  const [input, setInput] = useState('Next.js works with React. React powers component-driven UIs.')

  useEffect(() => {
    const sharedPattern = searchParams.get('pattern')
    const sharedFlags = searchParams.get('flags')
    const sharedInput = searchParams.get('input')
    if (sharedPattern) setPattern(sharedPattern)
    if (sharedFlags) setFlags(sharedFlags)
    if (sharedInput) setInput(sharedInput)
  }, [searchParams])

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags)
      const matches: MatchResult[] = []

      for (const item of input.matchAll(regex)) {
        matches.push({
          match: item[0],
          index: item.index ?? 0,
          groups: item.groups ?? null,
        })
      }

      return { error: '', matches }
    } catch {
      return { error: 'Invalid regular expression or flags.', matches: [] as MatchResult[] }
    }
  }, [pattern, flags, input])

  const shareState = async () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pattern', pattern)
    params.set('flags', flags)
    params.set('input', input)
    const nextUrl = `${pathname}?${params.toString()}`
    router.replace(nextUrl, { scroll: false })
    await navigator.clipboard.writeText(`${window.location.origin}${nextUrl}`)
  }

  return (
    <section className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Interactive Regex Tester
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Test expressions with flags and inspect matched values and positions in real time.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="regex-pattern"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Pattern
          </label>
          <input
            id="regex-pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="Enter regex pattern"
          />
        </div>

        <div>
          <label
            htmlFor="regex-flags"
            className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Flags
          </label>
          <input
            id="regex-flags"
            value={flags}
            onChange={(event) => setFlags(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="e.g. gi"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-3">
          <button
            onClick={shareState}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Share link
          </button>
        </div>
        <label
          htmlFor="regex-input"
          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Test input
        </label>
        <textarea
          id="regex-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="h-36 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          spellCheck={false}
        />
      </div>

      {result.error ? (
        <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{result.error}</p>
      ) : (
        <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Matches: {result.matches.length}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {result.matches.map((item, idx) => (
              <li key={`${item.match}-${item.index}-${idx}`} className="font-mono">
                [{item.index}] {item.match}
                {item.groups ? ` ${JSON.stringify(item.groups)}` : ''}
              </li>
            ))}
            {result.matches.length === 0 && <li className="text-gray-500">No matches found.</li>}
          </ul>
        </div>
      )}
    </section>
  )
}
