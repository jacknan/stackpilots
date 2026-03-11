import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const OUTPUT_DIR = path.resolve('data/blog/ai-tools')
const TARGET_POSTS_PER_RUN = 2
const MAX_ITEMS_PER_FEED = 6

const FEEDS = [
  {
    key: 'github',
    rss: 'https://github.blog/news-insights/company-news/feed/',
    tags: ['ai-tools', 'github-copilot', 'software-engineering'],
  },
  {
    key: 'openai',
    rss: 'https://openai.com/news/rss.xml',
    tags: ['ai-tools', 'software-engineering', 'trends'],
  },
  {
    key: 'verge',
    rss: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    tags: ['ai-tools', 'industry-news', 'software-engineering'],
  },
]

function stripHtml(input) {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeXml(input) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

function getTagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?: [^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  if (!match) return ''
  return decodeXml(stripHtml(match[1].trim()))
}

function parseRssItems(xml) {
  const items = []
  const matches = xml.match(/<item>[\s\S]*?<\/item>/gi) || []

  for (const block of matches.slice(0, MAX_ITEMS_PER_FEED)) {
    const title = getTagValue(block, 'title')
    const link = getTagValue(block, 'link')
    const description = getTagValue(block, 'description')
    const pubDate = getTagValue(block, 'pubDate') || getTagValue(block, 'published')

    if (!title || !link) continue
    items.push({ title, link, description, pubDate })
  }

  if (items.length > 0) return items

  const entryMatches = xml.match(/<entry[\s\S]*?<\/entry>/gi) || []
  for (const block of entryMatches.slice(0, MAX_ITEMS_PER_FEED)) {
    const title = getTagValue(block, 'title')
    const description = getTagValue(block, 'summary') || getTagValue(block, 'content')
    const pubDate = getTagValue(block, 'published') || getTagValue(block, 'updated')

    const linkTag = block.match(/<link[^>]*href="([^"]+)"[^>]*>/i)
    const link = linkTag ? decodeXml(linkTag[1].trim()) : ''

    if (!title || !link) continue
    items.push({ title, link, description, pubDate })
  }

  return items
}

function buildPost(feedKey, item, tags) {
  const now = new Date()
  const dateIso = now.toISOString()
  const ymd = dateIso.slice(0, 10)
  const short = crypto.createHash('sha1').update(item.link).digest('hex').slice(0, 10)
  const slug = `${feedKey}-${ymd}-${slugify(item.title)}-${short}`
  const fileName = `${slug}.mdx`
  const summary = item.description || `Daily hotspot update from ${feedKey}.`

  const content =
    `---\n` +
    `title: '${item.title.replace(/'/g, "''")}'\n` +
    `date: ${dateIso}\n` +
    `tags: [${tags.map((tag) => `'${tag}'`).join(', ')}]\n` +
    `draft: false\n` +
    `summary: '${summary.replace(/'/g, "''").slice(0, 220)}'\n` +
    `layout: PostSimple\n` +
    `---\n\n` +
    `## Daily hotspot snapshot\n\n` +
    `This article is generated from a curated international source feed and reviewed in-repo for relevance to AI engineering workflows.\n\n` +
    `## Why it matters\n\n` +
    `- Signal for developer tooling, platform capabilities, or engineering workflow changes.\n` +
    `- Useful for product, architecture, and release planning discussions.\n` +
    `- Helps maintain a consistent daily content cadence.\n\n` +
    `## Source\n\n` +
    `- Original article: [${item.title}](${item.link})\n` +
    `${item.pubDate ? `- Published: ${item.pubDate}\n` : ''}`

  return { fileName, content }
}

async function collectExistingSourceLinks() {
  const links = new Set()

  let entries = []
  try {
    entries = await fs.readdir(OUTPUT_DIR)
  } catch {
    return links
  }

  for (const name of entries) {
    if (!name.endsWith('.mdx')) continue
    const fullPath = path.join(OUTPUT_DIR, name)

    try {
      const content = await fs.readFile(fullPath, 'utf8')
      const match = content.match(/- Original article: \[[^\]]+\]\((https?:\/\/[^)]+)\)/i)
      if (match?.[1]) links.add(match[1].trim())
    } catch {
      // ignore unreadable files and keep processing
    }
  }

  return links
}

async function run() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  const candidates = []
  const existingLinks = await collectExistingSourceLinks()

  const requestHeaders = {
    'user-agent': 'stackpilots-daily-hotspot-bot/1.0 (+https://www.stackpilots.org)',
    accept: 'application/rss+xml, application/xml, text/xml, */*',
  }

  for (const feed of FEEDS) {
    try {
      const response = await fetch(feed.rss, { headers: requestHeaders })
      if (!response.ok) {
        console.warn(`Skip ${feed.key}: HTTP ${response.status}`)
        continue
      }

      const xml = await response.text()
      const items = parseRssItems(xml)
      if (items.length === 0) {
        console.warn(`Skip ${feed.key}: no parsable item`)
        continue
      }

      for (const item of items) {
        candidates.push({ ...item, feedKey: feed.key, tags: feed.tags })
      }
    } catch (error) {
      console.warn(`Skip ${feed.key}: ${error.message}`)
    }
  }

  const seenLinks = new Set()
  const uniqueCandidates = candidates.filter((item) => {
    if (existingLinks.has(item.link)) return false
    if (seenLinks.has(item.link)) return false
    seenLinks.add(item.link)
    return true
  })

  uniqueCandidates.sort((a, b) => {
    const aTime = a.pubDate ? Date.parse(a.pubDate) || 0 : 0
    const bTime = b.pubDate ? Date.parse(b.pubDate) || 0 : 0
    return bTime - aTime
  })

  let created = 0

  for (const candidate of uniqueCandidates) {
    if (created >= TARGET_POSTS_PER_RUN) break

    const post = buildPost(candidate.feedKey, candidate, candidate.tags)
    const filePath = path.join(OUTPUT_DIR, post.fileName)

    try {
      await fs.access(filePath)
      console.log(`Exists: ${post.fileName}`)
      continue
    } catch {
      // file does not exist
    }

    await fs.writeFile(filePath, post.content, 'utf8')
    console.log(`Created: ${post.fileName}`)
    created += 1
  }

  console.log(`Done. Created ${created} file(s).`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
