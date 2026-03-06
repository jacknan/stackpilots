import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'

export const metadata = genPageMetadata({
  title: 'Developer Guides for Next.js & AI Workflows',
  description:
    'Step-by-step engineering tutorials focused on AI-assisted coding, Next.js architecture, and web performance.',
})

export default function GuidesPage() {
  const posts = allCoreContent(
    sortPosts(allBlogs.filter((post) => post.path.startsWith('blog/guides/')))
  )

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-6xl dark:text-gray-100">
          Developer Guides
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          Tactical guides for developers who want to build faster without compromising code quality,
          security, or performance.
        </p>
      </div>

      <div className="py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Latest guides</h2>
        <ul className="mt-4 space-y-6">
          {posts.map((post) => (
            <li
              key={post.path}
              className="rounded-xl border border-gray-200 p-5 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.date, siteMetadata.locale)}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                <Link href={`/${post.path}`}>{post.title}</Link>
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{post.summary}</p>
              <div className="mt-3 flex flex-wrap">
                {post.tags?.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-gray-600 dark:text-gray-300">
          Need all topics in one stream? Visit <Link href="/blog">the full blog feed</Link>.
        </p>
      </div>
    </div>
  )
}
