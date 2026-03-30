import { ReactNode } from 'react'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import AdsterraBanner from '@/components/ads/AdsterraBanner'

interface LayoutProps {
  content: CoreContent<Blog>
  children: ReactNode
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
}

export default function PostLayout({ content, next, prev, children }: LayoutProps) {
  const { path, slug, date, title } = content
  const adsterraBannerKey = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY || ''
  const adsterraBannerSrc = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_SRC || ''
  const adsterraBannerWidth = Number.parseInt(
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_WIDTH || '300',
    10
  )
  const adsterraBannerHeight = Number.parseInt(
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_HEIGHT || '250',
    10
  )
  const shouldShowAdsterraBanner =
    process.env.NODE_ENV === 'production' &&
    Boolean(adsterraBannerKey && adsterraBannerSrc) &&
    Number.isFinite(adsterraBannerWidth) &&
    Number.isFinite(adsterraBannerHeight)

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <header>
            <div className="space-y-1 border-b border-gray-200 pb-10 text-center dark:border-gray-700">
              <dl>
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:divide-y-0 dark:divide-gray-700">
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>
              {shouldShowAdsterraBanner && (
                <div className="py-8">
                  <p className="mb-3 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Sponsored
                  </p>
                  <AdsterraBanner
                    adKey={adsterraBannerKey}
                    scriptSrc={adsterraBannerSrc}
                    width={adsterraBannerWidth}
                    height={adsterraBannerHeight}
                    className="not-prose flex justify-center"
                  />
                </div>
              )}
            </div>
            {siteMetadata.comments && (
              <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
                <Comments slug={slug} />
              </div>
            )}
            <footer>
              <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
                {prev && prev.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${prev.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
                {next && next.path && (
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${next.path}`}
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Next post: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
