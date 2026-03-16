import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_DIR = path.resolve('data/blog/ai-tools')
const STATE_FILE = path.resolve('.stackpilots/hotspot-queue.json')
const TARGET_POSTS_PER_RUN = 2
const MAX_ITEMS_PER_FEED = 12

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
    rss: 'https://hnrss.org/newest?q=ai%20coding%20OR%20developer%20tools%20OR%20coding%20agent',
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
    .replace(/&nbsp;/g, ' ')
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
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || []

  for (const block of itemBlocks.slice(0, MAX_ITEMS_PER_FEED)) {
    const title = getTagValue(block, 'title')
    const link = normalizeUrl(getTagValue(block, 'link'))
    const description = getTagValue(block, 'description')
    const pubDate = getTagValue(block, 'pubDate') || getTagValue(block, 'published')

    if (!title || !link) continue
    items.push({ title, link, description, pubDate })
  }

  if (items.length > 0) return items

  const entryBlocks = xml.match(/<entry[\s\S]*?<\/entry>/gi) || []
  for (const block of entryBlocks.slice(0, MAX_ITEMS_PER_FEED)) {
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

function isRelevant(item) {
  const text = `${item.title} ${item.description}`.toLowerCase()
  return KEYWORDS.some((keyword) => text.includes(keyword))
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

function buildPost(item, ymd, dateIso) {
  const short = crypto.createHash('sha1').update(item.link).digest('hex').slice(0, 10)
  const slug = `${item.feedKey}-${ymd}-${slugify(item.title)}-${short}`
  const fileName = `${slug}.mdx`
  const summary = item.description || `Daily hotspot update from ${item.feedKey}.`

  const content =
    `---\n` +
    `title: '${item.title.replace(/'/g, "''")}'\n` +
    `date: ${dateIso}\n` +
    `tags: [${item.tags.map((tag) => `'${tag}'`).join(', ')}]\n` +
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

  return { fileName, content, link: item.link }
}

async function readJson(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return fallback
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8')
}

async function collectExistingPosts() {
  const sourceLinks = new Set()
  const generatedFiles = []
  const linkByFile = {}

  let names = []
  try {
    names = await fs.readdir(OUTPUT_DIR)
  } catch {
    return { sourceLinks, generatedFiles }
  }

  for (const name of names) {
    if (!name.endsWith('.mdx')) continue
    const fullPath = path.join(OUTPUT_DIR, name)
    generatedFiles.push(name)

    try {
      const content = await fs.readFile(fullPath, 'utf8')
      const match = content.match(/- Original article: \[[^\]]+\]\((https?:\/\/[^)]+)\)/i)
      if (match?.[1]) {
        const normalized = normalizeUrl(match[1])
        sourceLinks.add(normalized)
        linkByFile[name] = normalized
      }
    } catch {
      // Ignore unreadable files and continue scanning.
    }
  }

  return { sourceLinks, generatedFiles, linkByFile }
}

function normalizeState(state) {
  return {
    version: 1,
    queue: Array.isArray(state?.queue) ? state.queue : [],
    history: Array.isArray(state?.history) ? state.history : [],
  }
}

function upsertHistoryEntry(history, date, files, links) {
  const existing = history.find((entry) => entry.date === date)
  if (existing) {
    existing.files = [...new Set([...(existing.files || []), ...files])]
    existing.links = [...new Set([...(existing.links || []), ...links])]
    return existing
  }

  const entry = { date, files: [...new Set(files)], links: [...new Set(links)] }
  history.push(entry)
  return entry
}

function selectPublishBatch(queue, count) {
  const primary = []
  const usedFeeds = new Set()

  for (const item of queue) {
    if (primary.length >= count) break
    if (usedFeeds.has(item.feedKey)) continue
    primary.push(item)
    usedFeeds.add(item.feedKey)
  }

  if (primary.length >= count) return primary

  for (const item of queue) {
    if (primary.length >= count) break
    if (primary.some((selected) => selected.link === item.link)) continue
    primary.push(item)
  }

  return primary
}

async function fetchCandidates() {
  const candidates = []
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
        candidates.push({
          ...item,
          feedKey: feed.key,
          tags: feed.tags,
          score: scoreCandidate(item),
        })
      }
    } catch (error) {
      console.warn(`Skip ${feed.key}: ${error.message}`)
    }
  }

  return candidates
}

async function run() {
  const now = new Date()
  const dateIso = now.toISOString()
  const ymd = dateIso.slice(0, 10)

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const existingPosts = await collectExistingPosts()
  const existingLinks = existingPosts.sourceLinks
  const existingTodayFiles = existingPosts.generatedFiles.filter((name) =>
    FEEDS.some((feed) => name.startsWith(`${feed.key}-${ymd}-`))
  )
  const existingTodayLinks = existingTodayFiles
    .map((name) => existingPosts.linkByFile[name])
    .filter(Boolean)

  const state = normalizeState(await readJson(STATE_FILE, {}))
  const todayEntry = upsertHistoryEntry(state.history, ymd, existingTodayFiles, existingTodayLinks)

  const seenQueueLinks = new Set()
  state.queue = state.queue
    .filter((item) => item?.link && !existingLinks.has(item.link))
    .filter((item) => {
      if (seenQueueLinks.has(item.link)) return false
      seenQueueLinks.add(item.link)
      return true
    })

  const freshCandidates = await fetchCandidates()
  for (const item of freshCandidates) {
    if (existingLinks.has(item.link)) continue
    if (state.queue.some((queued) => queued.link === item.link)) continue
    state.queue.push({ ...item, queuedAt: dateIso })
  }

  state.queue.sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0)
    const aTime = a.pubDate ? Date.parse(a.pubDate) || 0 : 0
    const bTime = b.pubDate ? Date.parse(b.pubDate) || 0 : 0
    return bTime - aTime
  })

  const alreadyPublishedToday = new Set(todayEntry.links || [])
  const remainingNeeded = Math.max(0, TARGET_POSTS_PER_RUN - (todayEntry.files || []).length)
  const publishableQueue = state.queue.filter((item) => !alreadyPublishedToday.has(item.link))
  const publishBatch = selectPublishBatch(publishableQueue, remainingNeeded)

  for (const item of publishBatch) {
    const post = buildPost(item, ymd, dateIso)
    const filePath = path.join(OUTPUT_DIR, post.fileName)
    await fs.writeFile(filePath, post.content, 'utf8')
    todayEntry.files = [...new Set([...(todayEntry.files || []), post.fileName])]
    todayEntry.links = [...new Set([...(todayEntry.links || []), post.link])]
    existingLinks.add(post.link)
  }

  state.queue = state.queue.filter((item) => !existingLinks.has(item.link))
  await writeJson(STATE_FILE, state)

  console.log(`Queued candidates available: ${state.queue.length}`)
  console.log(`Published today: ${(todayEntry.files || []).length}`)

  if ((todayEntry.files || []).length < TARGET_POSTS_PER_RUN) {
    throw new Error(
      `Daily publish target not met: ${(todayEntry.files || []).length}/${TARGET_POSTS_PER_RUN}`
    )
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
