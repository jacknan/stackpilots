import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const MAX_DISPLAY = 5

const hubSections = [
  {
    href: '/ai-tools',
    title: 'AI Tools',
    description:
      'Comparisons, benchmarks, and practical recommendations for AI coding assistants and creative tools.',
  },
  {
    href: '/guides',
    title: 'Guides',
    description:
      'Hands-on tutorials for Next.js, prompt engineering, and real-world development workflows.',
  },
  {
    href: '/tools',
    title: 'Tools',
    description:
      'Free browser utilities for JSON, JWT, Base64, regex, timestamps, and SVG optimization.',
  },
  {
    href: '/frontend',
    title: 'Frontend',
    description:
      'Modern frontend engineering insights for Next.js, Tailwind CSS, TypeScript, and performance.',
  },
]

export default function Home({ posts }) {
  return (
    <>
      <section className="pt-4 pb-10 md:pt-6">
        <h1 className="max-w-5xl text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl md:leading-[1.08] lg:text-6xl dark:text-gray-100">
          AI tools, developer guides, and practical web utilities
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          {siteMetadata.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/tools"
            className="bg-primary-500 hover:bg-primary-600 rounded-lg px-5 py-2 text-sm font-semibold text-white"
          >
            Explore Developer Tools
          </Link>
          <Link
            href="/ai-tools"
            className="border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400 rounded-lg border px-5 py-2 text-sm font-semibold"
          >
            Browse AI Tool Coverage
          </Link>
        </div>
      </section>

      <section className="pb-10">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Browse by topic
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {hubSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="hover:border-primary-400 block rounded-xl border border-gray-200 p-5 transition dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h2 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 dark:text-gray-100">
            Latest Articles
          </h2>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Fresh tutorials, tool comparisons, and implementation notes for developers.
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
