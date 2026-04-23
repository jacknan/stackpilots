import fs from 'node:fs/promises'
import path from 'node:path'

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[index + 1] : true
    args[key] = value
    if (value !== true) index += 1
  }
  return args
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content)
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n')
}

function unique(items) {
  return [...new Set(items.filter(Boolean))]
}

function toProductOutput(input) {
  const siteName = input.site?.name || 'New Site'
  const topic = input.site?.topic || 'developer content'
  const monetization = Array.isArray(input.constraints?.monetization)
    ? input.constraints.monetization
    : ['adsense']

  return {
    status: 'ok',
    artifacts: {
      niche: `Actionable content site focused on ${topic}`,
      audience: [
        'Frontend and full-stack developers',
        'Indie makers shipping web products',
        'Engineering teams adopting AI workflows',
      ],
      positioning: `${siteName} provides practical, production-first playbooks instead of generic tutorials.`,
      monetization: unique([...monetization, 'affiliate', 'newsletter sponsorships']),
      initial_offers: [
        'Weekly implementation checklist',
        'Downloadable prompt library for engineering tasks',
        'Technical teardown newsletter',
      ],
    },
    risks: [
      'Competitive SERPs in developer and AI categories',
      'Early revenue volatility before traffic stabilizes',
    ],
    next_actions: [
      'Define 30-day editorial calendar by topic cluster',
      'Set quality bar for publish-ready articles',
      'Finalize conversion flow from article to lead capture',
    ],
  }
}

function toSeoOutput(input) {
  const topic = input.site?.topic || 'developer workflows'
  const product = input.previous_outputs?.product?.artifacts || {}

  return {
    status: 'ok',
    artifacts: {
      categories: ['Tutorials', 'Guides', 'Comparisons', 'Best practices'],
      topic_clusters: [
        {
          cluster: `${topic} foundations`,
          intent: 'informational',
          topics: [`what is ${topic}`, `${topic} beginner roadmap`, `${topic} common mistakes`],
        },
        {
          cluster: 'Tool and workflow decisions',
          intent: 'commercial',
          topics: [
            'tooling comparison matrix',
            'workflow cost and ROI',
            'implementation checklist',
          ],
        },
        {
          cluster: 'Execution templates',
          intent: 'transactional',
          topics: [
            'copy-ready starter templates',
            'team adoption playbook',
            'audit and refactor workflow',
          ],
        },
      ],
      internal_link_rules: [
        'Each article links to one pillar page and two related supporting pages',
        'Use descriptive anchors tied to target query intent',
        'Add related-post modules at the end of each article',
      ],
      onpage_requirements: [
        'One clear H1 and intent-aligned title tag',
        'Include practical examples and implementation steps',
        'Add FAQ section when search intent supports it',
        'Use concise meta descriptions with clear outcome promise',
        product.positioning
          ? `Reflect positioning consistently: ${product.positioning}`
          : 'Keep brand positioning consistent across pages',
      ],
    },
    risks: [
      'Keyword cannibalization without strict topic mapping',
      'Content freshness decay in fast-moving tooling space',
    ],
    next_actions: [
      'Assign one primary keyword per planned article',
      'Create canonical pillar pages for top clusters',
      'Review internal linking coverage weekly',
    ],
  }
}

function toDevOutput(input) {
  const topic = input.site?.topic || 'developer workflows'
  const categories = input.previous_outputs?.seo?.artifacts?.categories || ['Tutorials']

  return {
    status: 'ok',
    artifacts: {
      file_changes: [
        {
          path: 'data/blog',
          reason: `Add initial content drafts across categories: ${categories.join(', ')}`,
        },
        {
          path: 'app',
          reason: 'Add category hubs and related-post navigation blocks',
        },
        {
          path: 'layouts',
          reason: 'Standardize article layout for SEO and monetization placements',
        },
      ],
      env_vars: [
        'NEXT_PUBLIC_SITE_DOMAIN',
        'NEXT_PUBLIC_ANALYTICS_ID',
        'NEXT_PUBLIC_ADSENSE_CLIENT',
      ],
      ads_plan: [
        'Keep site-wide AdSense bootstrap active',
        'Render ad slots after intro and mid-article sections',
        'Avoid ads on short pages with low content depth',
      ],
      validation_checks: [
        'Run yarn build successfully',
        'Confirm metadata and sitemap generation',
        `Review article template against topic: ${topic}`,
      ],
    },
    risks: [
      'Template regressions can impact existing article rendering',
      'Ad placement density may reduce reading experience',
    ],
    next_actions: [
      'Implement layout updates in a small scoped PR',
      'Run build and basic smoke checks',
      'Publish initial content batch and monitor engagement',
    ],
  }
}

function toOpsOutput(input) {
  const domain = input.site?.domain || 'example.com'

  return {
    status: 'ok',
    artifacts: {
      launch_checklist: [
        `Verify DNS, HTTPS, and canonical settings for ${domain}`,
        'Validate robots.txt, sitemap.xml, and structured data output',
        'Confirm analytics and ad scripts on production pages',
      ],
      monitoring: [
        'Daily indexation and crawl health checks',
        'Weekly Core Web Vitals and page quality trend review',
        'Revenue and ad policy warning monitoring',
      ],
      incident_playbook: [
        'Traffic drop: inspect indexing, templates, and deploy diffs',
        'Ad drop: verify ads.txt, CSP, and script delivery',
        'Build failure: rollback to last green commit and redeploy',
      ],
      weekly_kpis: [
        'Indexed pages count',
        'Organic clicks and impressions',
        'Ad RPM and session revenue',
        'Newsletter conversion rate',
      ],
    },
    risks: [
      'Algorithm updates may impact short-term discoverability',
      'Monetization tuning can conflict with UX if over-optimized',
    ],
    next_actions: [
      'Set KPI thresholds and alert routing',
      'Create weekly launch review ritual',
      'Iterate content plan using KPI feedback loops',
    ],
  }
}

function generateOutput(step, input) {
  if (step === 'product') return toProductOutput(input)
  if (step === 'seo') return toSeoOutput(input)
  if (step === 'dev') return toDevOutput(input)
  if (step === 'ops') return toOpsOutput(input)
  throw new Error(`Unsupported step: ${step}`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const step = args.step
  const inputPath = args.input
  const outputPath = args.output

  if (!step || !inputPath || !outputPath) {
    throw new Error('Usage: node local-agent.mjs --step <step> --input <file> --output <file>')
  }

  const input = await readJson(inputPath)
  const output = generateOutput(step, input)
  await writeJson(outputPath, output)
  console.log(`Generated output for step: ${step}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
