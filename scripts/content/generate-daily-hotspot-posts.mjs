import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const OUTPUT_DIR = path.resolve('data/blog/ai-tools')
const TARGET_POSTS_PER_RUN = 2
const MAX_ITEMS_PER_FEED = 10

const FEEDS = [
  {
    key: 'github-ai',
    rss: 'https://github.blog/ai-and-ml/feed/',
    tags: ['ai-tools', 'github-copilot', 'software-engineering'],
  },
  {
    key: 'techcrunch-ai',
    rss: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    tags: ['ai-tools', 'industry-news', 'software-engineering'],
  },
  {
    key: 'verge-ai',
    rss: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    tags: ['ai-tools', 'industry-news', 'software-engineering'],
  },
  {
    key: 'hn-devtools',
    rss: 'https://hnrss.org/newest?q=%22ai%20coding%22%20OR%20%22developer%20tools%22%20OR%20%22coding%20agent%22',
    tags: ['ai-tools', 'software-engineering', 'developer-workflow'],
  },
  {
    key: 'openai-news',
    rss: 'https://openai.com/news/rss.xml',
    tags: ['ai-tools', 'software-engineering', 'trends'],
  },
]

const KEYWORDS = [
  'ai',
  'agent',
  'copilot',
  'codex',
  'claude',
  'gpt',
  'llm',
  'developer',
  'development',
  'coding',
  'code',
  'software',
  'programming',
  'api',
  'security',
  'devops',
  'testing',
  'framework',
  'tool',
  'tools',
  'next.js',
  'react',
  'typescript',
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

function normalizeUrl(input) {
  try {
    const url = new URL(input)
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith('utm_')) url.searchParams.delete(key)
    }
    return url.toString()
  } catch {
    return input.trim()
  }
}

function isRelevant(item) {
  const text = `${item.title} ${item.description}`.toLowerCase()
  return KEYWORDS.some((keyword) => text.includes(keyword))
}

function parseRssItems(xml) {
  const items = []
  const matches = xml.match(/<item>[\s\S]*?<\/item>/gi) || []

  for (const block of matches.slice(0, MAX_ITEMS_PER_FEED)) {
    const title = getTagValue(block, 'title')
    const link = normalizeUrl(getTagValue(block, 'link'))
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
    const link = linkTag ? normalizeUrl(decodeXml(linkTag[1].trim())) : ''

    if (!title || !link) continue
    items.push({ title, link, description, pubDate })
  }

  return items
}

function scoreCandidate(item) {
  const text = `${item.title} ${item.description}`.toLowerCase()
  let score = 0

  for (const keyword of KEYWORDS) {
    if (text.includes(keyword)) score += 1
  }

  if (text.includes('github copilot') || text.includes('codex') || text.includes('claude'))
    score += 2
  if (text.includes('developer') || text.includes('software') || text.includes('coding')) score += 1

  return score
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
        if (!isRelevant(item)) continue
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
    const aScore = scoreCandidate(a)
    const bScore = scoreCandidate(b)

    if (bScore !== aScore) return bScore - aScore
    return bTime - aTime
  })

  let created = 0
  const usedFeeds = new Set()

  for (const candidate of uniqueCandidates) {
    if (created >= TARGET_POSTS_PER_RUN) break
    if (usedFeeds.has(candidate.feedKey)) continue

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
    usedFeeds.add(candidate.feedKey)
    created += 1
  }

  if (created < TARGET_POSTS_PER_RUN) {
    for (const candidate of uniqueCandidates) {
      if (created >= TARGET_POSTS_PER_RUN) break

      const post = buildPost(candidate.feedKey, candidate, candidate.tags)
      const filePath = path.join(OUTPUT_DIR, post.fileName)

      try {
        await fs.access(filePath)
        continue
      } catch {
        // file does not exist
      }

      await fs.writeFile(filePath, post.content, 'utf8')
      console.log(`Created fallback: ${post.fileName}`)
      created += 1
    }
  }

  console.log(`Done. Created ${created} file(s).`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
