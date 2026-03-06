import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import toolsData from '@/data/toolsData'
import JsonFormatterTool from '@/components/tools/JsonFormatterTool'
import JwtDebuggerTool from '@/components/tools/JwtDebuggerTool'
import TimestampConverterTool from '@/components/tools/TimestampConverterTool'
import RegexTesterTool from '@/components/tools/RegexTesterTool'
import Base64Tool from '@/components/tools/Base64Tool'
import SvgOptimizerTool from '@/components/tools/SvgOptimizerTool'
import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'

type ToolPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-static'

export function generateStaticParams() {
  return toolsData.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = toolsData.find((item) => item.slug === slug)

  if (!tool) {
    return genPageMetadata({ title: 'Tool Not Found' })
  }

  return genPageMetadata({
    title: `${tool.name} Tool`,
    description: tool.description,
    keywords: [tool.targetKeyword, tool.name, 'developer tools'],
  })
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { slug } = await params
  const tool = toolsData.find((item) => item.slug === slug)

  if (!tool) {
    notFound()
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide uppercase">
          {tool.category}
        </p>
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-6xl dark:text-gray-100">
          {tool.name}
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          {tool.description}
        </p>
      </div>

      <div className="py-10">
        {tool.slug === 'json-formatter' && <JsonFormatterTool />}
        {tool.slug === 'jwt-debugger' && <JwtDebuggerTool />}
        {tool.slug === 'timestamp-converter' && <TimestampConverterTool />}
        {tool.slug === 'regex-tester' && <RegexTesterTool />}
        {tool.slug === 'base64-tool' && <Base64Tool />}
        {tool.slug === 'svg-optimizer' && <SvgOptimizerTool />}
      </div>

      <div className="grid gap-8 py-10 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-gray-700 dark:text-gray-300">
            {tool.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick start</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-gray-700 dark:text-gray-300">
            {tool.quickStart.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <section className="py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Related guides</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {tool.relatedGuides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="hover:border-primary-400 block rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-700 transition dark:border-gray-700 dark:text-gray-200"
            >
              {guide.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FAQ</h2>
        <div className="mt-5 space-y-4">
          {tool.faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-xl border border-gray-200 p-5 dark:border-gray-700"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
