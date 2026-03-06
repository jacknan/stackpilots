import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { genPageMetadata } from 'app/seo'

const POSTS_PER_PAGE = 5
const filteredBlogs = allBlogs.filter((post) =>
  process.env.NODE_ENV === 'production' ? !post.draft : true
)

export const generateStaticParams = async () => {
  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE)
  const paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }))

  return paths
}

export async function generateMetadata(props: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const params = await props.params
  const pageNumber = parseInt(params.page)
  const isFirstPage = pageNumber === 1
  const isPaginatedPage = pageNumber > 1

  return genPageMetadata({
    title: isFirstPage ? 'Blog' : `Blog - Page ${pageNumber}`,
    description: isFirstPage
      ? 'Latest articles and tutorials from StackPilots.'
      : `Browse page ${pageNumber} of the StackPilots blog archive.`,
    alternates: {
      canonical: isFirstPage ? '/blog' : `/blog/page/${pageNumber}`,
    },
    robots: {
      index: !isPaginatedPage,
      follow: true,
    },
  })
}

export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params
  const posts = allCoreContent(sortPosts(filteredBlogs))
  const pageNumber = parseInt(params.page as string)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  // Return 404 for invalid page numbers or empty pages
  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="All Posts"
    />
  )
}
