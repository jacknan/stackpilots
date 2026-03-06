import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import toolsData from '@/data/toolsData'

export const metadata = genPageMetadata({
  title: 'Free Developer Utilities & Web Tools',
  description:
    'Free browser-based tools for JSON formatting, JWT debugging, Base64 conversion, regex testing, SVG optimization, and timestamp conversion.',
})

export default function ToolsPage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-6xl dark:text-gray-100">
          Developer Utilities
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          A curated utility suite for everyday engineering tasks. These tools are optimized for
          speed, privacy, and practical debugging workflows.
        </p>
      </div>

      <div className="py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {toolsData.map((tool) => (
            <div
              key={tool.slug}
              className="rounded-xl border border-gray-200 p-5 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {tool.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {tool.summary}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {tool.category}
                </span>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-semibold"
                >
                  {'Open tool page ->'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
