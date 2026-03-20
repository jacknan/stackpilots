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

function sentenceCase(input) {
  if (!input) return ''
  return input.charAt(0).toUpperCase() + input.slice(1)
}

function buildAngle(item) {
  const text = `${item.title} ${item.description}`.toLowerCase()

  if (text.includes('security') || text.includes('vulnerab')) {
    return {
      category: 'security engineering',
      implications: [
        'Security teams can shift from noisy scanner output toward higher-confidence review queues.',
        'Engineering teams should connect vulnerability findings to reproducible validation and concrete patch plans.',
        'Application security becomes easier to operationalize when findings align with repository context and runtime behavior.',
      ],
      takeaways: [
        'Pilot the workflow on one service with reliable test coverage before rolling it across the estate.',
        'Track false-positive rate and time-to-remediation instead of only counting findings.',
        'Require human review for critical auth, data exposure, and infrastructure-touching fixes.',
      ],
      risks: [
        'Teams may over-trust agent-generated security findings without validating exploitability.',
        'Poor environment setup can reduce the quality advantage of context-aware security tooling.',
      ],
    }
  }

  if (
    text.includes('copilot') ||
    text.includes('codex') ||
    text.includes('claude') ||
    text.includes('agent')
  ) {
    return {
      category: 'developer tooling',
      implications: [
        'Developer workflows are moving from single-assistant usage toward role-based agent collaboration.',
        'Teams can now compare multiple implementation paths and reasoning styles before code hardens in production.',
        'Tooling decisions increasingly affect review velocity, governance, and delivery quality instead of just raw coding speed.',
      ],
      takeaways: [
        'Define clear responsibility boundaries for planning, architecture, implementation, and release checks.',
        'Keep agent output inside normal pull request review so governance stays familiar to the team.',
        'Prefer small, reviewable changes until you understand the blast radius of the new workflow.',
      ],
      risks: [
        'Without clear ownership, multiple agents can create redundant or conflicting output.',
        'Teams may optimize for speed before they have adequate quality gates and observability.',
      ],
    }
  }

  if (text.includes('api') || text.includes('sdk') || text.includes('framework')) {
    return {
      category: 'platform engineering',
      implications: [
        'New APIs and SDK capabilities change how quickly teams can embed automation into product workflows.',
        'Platform teams need to evaluate integration complexity alongside productivity gains.',
        'The most valuable tools are usually the ones that fit existing repos, CI, and release discipline.',
      ],
      takeaways: [
        'Test the integration path end to end before expanding to broader use cases.',
        'Document operational constraints, rate limits, and fallback behavior early.',
        'Measure the effect on delivery lead time, developer satisfaction, and incident rate.',
      ],
      risks: [
        'Rapid SDK adoption can create hidden maintenance burden if contracts change quickly.',
        'Teams may ignore long-term supportability while optimizing for launch speed.',
      ],
    }
  }

  return {
    category: 'software engineering',
    implications: [
      'The story reflects a shift in how engineering teams evaluate tools, workflows, and delivery trade-offs.',
      'Operational decisions around tooling now have direct impact on collaboration quality and release confidence.',
      'Teams that translate news into concrete process changes usually capture more value than teams that only monitor headlines.',
    ],
    takeaways: [
      'Turn the announcement into one or two practical experiments instead of broad process changes.',
      'Write down success metrics before adopting a new tool or workflow at team scale.',
      'Review security, governance, and rollback implications as part of adoption planning.',
    ],
    risks: [
      'Headline-driven adoption often leads to fragmented tooling and duplicated workflows.',
      'Teams may copy tactics from larger vendors without matching the same operational maturity.',
    ],
  }
}

function cleanSummary(input) {
  return sentenceCase((input || '').replace(/\s+/g, ' ').trim())
}

function buildSummary(item, angle) {
  const base = cleanSummary(item.description)
  const shortBase = base
    ? base.slice(0, 170)
    : `${sentenceCase(item.title)} is relevant to ${angle.category} teams right now.`
  return `${shortBase} This analysis translates the update into practical engineering implications and action items.`.slice(
    0,
    220
  )
}

function listSection(items) {
  return items.map((item) => `- ${item}`).join('\n')
}

function buildPostBody(item, angle) {
  const sourceSummary =
    cleanSummary(item.description) ||
    `${sentenceCase(item.title)} signals a relevant change for teams working on developer tools and AI-enabled delivery workflows.`

  return (
    `## What happened\n\n` +
    `${sourceSummary}\n\n` +
    `In practical terms, this matters because the update touches ${angle.category} decisions that engineering teams often need to make under delivery pressure. Instead of treating the source as a simple news item, the better move is to ask what changes in architecture, process, or release discipline if this trend continues.\n\n` +
    `## Why this matters to engineering teams\n\n` +
    `${listSection(angle.implications)}\n\n` +
    `## Technical implications\n\n` +
    `The most important engineering question is not whether the announcement is impressive, but whether it changes how a team should structure work. For developer tooling stories, that usually means tighter review loops, stronger contract definitions, and clearer role boundaries between planning, implementation, and validation. For platform or security stories, it means translating claims into measurable operational outcomes such as failure reduction, review speed, or lower remediation time.\n\n` +
    `A mature team should also separate headline value from implementation value. A new capability can be strategically important while still being operationally immature. That is why adoption works best when teams begin with a narrow, instrumented use case and expand only after they can observe meaningful quality or productivity gains.\n\n` +
    `## Practical takeaways\n\n` +
    `${listSection(angle.takeaways)}\n\n` +
    `## Risks and limitations\n\n` +
    `${listSection(angle.risks)}\n\n` +
    `## Recommended next step\n\n` +
    `Treat this update as an input into your engineering roadmap, not an instruction to adopt blindly. Pick one concrete workflow, define a success metric, and run a time-boxed experiment before expanding usage. That approach turns industry news into operational learning instead of content churn.\n\n` +
    `## Source context\n\n` +
    `- Original article: [${item.title}](${item.link})\n` +
    `${item.pubDate ? `- Published: ${item.pubDate}\n` : ''}`
  )
}

function buildPost(item, ymd, dateIso) {
  const short = crypto.createHash('sha1').update(item.link).digest('hex').slice(0, 10)
  const slug = `${item.feedKey}-${ymd}-${slugify(item.title)}-${short}`
  const fileName = `${slug}.mdx`
  const angle = buildAngle(item)
  const summary = buildSummary(item, angle)
  const contentBody = buildPostBody(item, angle)

  const content =
    `---\n` +
    `title: '${item.title.replace(/'/g, "''")}'\n` +
    `date: ${dateIso}\n` +
    `tags: [${item.tags.map((tag) => `'${tag}'`).join(', ')}]\n` +
    `draft: false\n` +
    `summary: '${summary.replace(/'/g, "''").slice(0, 220)}'\n` +
    `layout: PostSimple\n` +
    `---\n\n` +
    `${contentBody}`

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
