import Link from '@/components/Link'
import Tag from '@/components/Tag'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'

export const metadata = genPageMetadata({
  title: 'Next.js & Frontend Engineering Guides',
  description:
    'In-depth frontend engineering content for Next.js, Tailwind CSS, TypeScript, and production performance.',
})

export default function FrontendPage() {
  const posts = allCoreContent(
    sortPosts(allBlogs.filter((post) => post.path.startsWith('blog/frontend/')))
  )

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-6xl dark:text-gray-100">
          Next.js and Frontend Engineering
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          Deep dives on modern frontend architecture, deployment strategy, and performance
          optimization for teams shipping production-grade web applications.
        </p>
      </div>

      <div className="py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Latest frontend articles
        </h2>
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
      </div>
    </div>
  )
}
