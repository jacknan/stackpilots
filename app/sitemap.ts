import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import toolsData from '@/data/toolsData'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const routes = [
    '',
    'blog',
    'tags',
    'about',
    'ai-tools',
    'guides',
    'tools',
    'frontend',
    'privacy-policy',
    'terms',
    'cookie-policy',
    'affiliate-disclosure',
    'contact',
  ].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  const toolRoutes = toolsData.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...toolRoutes, ...blogRoutes]
}
