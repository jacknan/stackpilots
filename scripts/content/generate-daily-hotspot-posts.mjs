import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const OUTPUT_DIR = path.resolve('data/blog/ai-tools')

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

function pickFirstItem(xml) {
  const itemMatch = xml.match(/<item>[\s\S]*?<\/item>/i)
  if (!itemMatch) return null
  const item = itemMatch[0]
  const get = (tag) => {
    const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    return m ? decodeXml(m[1].trim()) : ''
  }
  return {
    title: stripHtml(get('title')),
    link: stripHtml(get('link')),
    description: stripHtml(get('description')),
    pubDate: stripHtml(get('pubDate')),
  }
}

function buildPost(feedKey, item, tags) {
  const now = new Date()
  const dateIso = now.toISOString()
  const ymd = dateIso.slice(0, 10)
  const short = crypto.createHash('sha1').update(item.link).digest('hex').slice(0, 6)
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

async function run() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  let created = 0

  for (const feed of FEEDS) {
    const response = await fetch(feed.rss)
    if (!response.ok) {
      console.warn(`Skip ${feed.key}: HTTP ${response.status}`)
      continue
    }

    const xml = await response.text()
    const item = pickFirstItem(xml)
    if (!item || !item.title || !item.link) {
      console.warn(`Skip ${feed.key}: no parsable item`)
      continue
    }

    const post = buildPost(feed.key, item, feed.tags)
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
