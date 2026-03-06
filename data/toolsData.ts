export type DeveloperTool = {
  slug: string
  name: string
  summary: string
  description: string
  category: string
  targetKeyword: string
  useCases: string[]
  quickStart: string[]
  relatedGuides: Array<{ title: string; href: string }>
  faqs: Array<{ question: string; answer: string }>
}

const toolsData: DeveloperTool[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    summary: 'Format, validate, and inspect API payloads in real time.',
    description:
      'Use this JSON formatter to beautify raw payloads, validate malformed objects, and inspect nested API responses faster during development.',
    category: 'Data & API',
    targetKeyword: 'real-time json formatter',
    useCases: [
      'Pretty-print minified JSON from API logs.',
      'Validate malformed payloads before committing schema changes.',
      'Inspect nested objects while debugging frontend rendering issues.',
    ],
    quickStart: [
      'Paste JSON input into the editor.',
      'Run format and validation checks instantly.',
      'Copy the normalized output for API tests or docs.',
    ],
    relatedGuides: [
      {
        title: 'Why Every Developer Needs a Real-Time JSON Formatter in 2025',
        href: '/blog/guides/why-developers-need-real-time-json-formatter',
      },
      {
        title: 'How to Build a Full-Stack App in Minutes Using Next.js and Cursor AI',
        href: '/blog/guides/build-full-stack-app-nextjs-cursor-ai',
      },
    ],
    faqs: [
      {
        question: 'Does the formatter validate JSON syntax?',
        answer:
          'Yes. It highlights invalid syntax and returns a normalized output only for valid JSON.',
      },
      {
        question: 'Can I format large JSON payloads?',
        answer:
          'Yes. The tool is intended for day-to-day API debugging, including larger request and response bodies.',
      },
    ],
  },
  {
    slug: 'jwt-debugger',
    name: 'JWT Debugger',
    summary: 'Decode claims and verify token structure during auth debugging.',
    description:
      'Inspect JWT header and payload content, verify structure, and speed up authentication debugging without leaving your browser workflow.',
    category: 'Security & Auth',
    targetKeyword: 'jwt debugger tool',
    useCases: [
      'Read token claims while testing login flows.',
      'Check token expiration and issuer values quickly.',
      'Validate token structure before backend integration tests.',
    ],
    quickStart: [
      'Paste a JWT token string.',
      'Review decoded header and payload.',
      'Verify expiry and critical claims before deployment.',
    ],
    relatedGuides: [
      {
        title: 'Understanding JWT: How to Safely Decode and Verify Your Tokens',
        href: '/blog/guides/understanding-jwt-decode-and-verify',
      },
      {
        title: 'Secure Your Web App: Essential Security Checklists for Developers',
        href: '/blog/frontend/secure-web-app-essential-security-checklists',
      },
    ],
    faqs: [
      {
        question: 'Does this tool verify JWT signatures?',
        answer:
          'Yes. HS256 signatures can be verified by providing the shared secret in the debugger.',
      },
      {
        question: 'Can I use it for expired tokens?',
        answer:
          'Yes. Decoding still works for expired tokens so you can inspect claims and troubleshoot auth issues.',
      },
    ],
  },
  {
    slug: 'timestamp-converter',
    name: 'Timestamp Converter',
    summary: 'Convert Unix timestamps to readable dates quickly.',
    description:
      'Convert Unix timestamps to human-readable dates and back to speed up debugging for logs, analytics events, and scheduled jobs.',
    category: 'Date & Time',
    targetKeyword: 'unix timestamp converter',
    useCases: [
      'Translate backend log timestamps during incident reviews.',
      'Generate Unix values for test fixtures and seed data.',
      'Validate timezone behavior across systems.',
    ],
    quickStart: [
      'Enter a Unix timestamp or calendar date.',
      'Switch timezone and format options.',
      'Copy the converted output for your app or tests.',
    ],
    relatedGuides: [
      {
        title: 'The Ultimate Guide to Unix Timestamp Conversion for Web Devs',
        href: '/blog/guides/unix-timestamp-converter-guide',
      },
      {
        title: 'Optimizing Core Web Vitals for Your React Application',
        href: '/blog/frontend/optimizing-core-web-vitals-react',
      },
    ],
    faqs: [
      {
        question: 'Does it support milliseconds and seconds?',
        answer: 'Yes. You can convert both 10-digit and 13-digit Unix values.',
      },
      {
        question: 'Can I switch timezone?',
        answer: 'Yes. Use UTC and local timezone modes for accurate debugging.',
      },
    ],
  },
  {
    slug: 'svg-optimizer',
    name: 'SVG Optimizer',
    summary: 'Shrink icon payloads for faster rendering and delivery.',
    description:
      'Optimize SVG markup to reduce file size, clean unnecessary metadata, and improve frontend performance for icon-heavy interfaces.',
    category: 'Performance',
    targetKeyword: 'svg optimizer for web performance',
    useCases: [
      'Reduce SVG icon size before shipping design assets.',
      'Clean noisy exports from design tools.',
      'Improve Core Web Vitals by cutting payload weight.',
    ],
    quickStart: [
      'Paste raw SVG markup.',
      'Apply optimization rules and preview output.',
      'Copy minified SVG into your component library.',
    ],
    relatedGuides: [
      {
        title: 'How to Optimize SVG Icons for Faster Web Performance',
        href: '/blog/guides/optimize-svg-icons-for-web-performance',
      },
      {
        title: 'Tailwind CSS Best Practices for Scalable Frontend Architecture',
        href: '/blog/frontend/tailwind-css-best-practices-scalable-architecture',
      },
    ],
    faqs: [
      {
        question: 'Will optimization break my SVG visuals?',
        answer:
          'The optimizer keeps visual output intact while removing redundant metadata when possible.',
      },
      {
        question: 'Can I optimize inline SVG?',
        answer: 'Yes. Inline snippets are supported and can be copied directly into JSX.',
      },
    ],
  },
  {
    slug: 'base64-tool',
    name: 'Base64 Tool',
    summary: 'Encode and decode Base64 strings for data transport tasks.',
    description:
      'Encode or decode Base64 strings for API payloads, auth headers, and binary transport workflows used in modern web applications.',
    category: 'Encoding',
    targetKeyword: 'base64 encoding decoding tool',
    useCases: [
      'Encode credentials for test authorization flows.',
      'Decode payload snippets received from APIs.',
      'Validate binary-to-text transport conversions.',
    ],
    quickStart: [
      'Paste text or Base64 input.',
      'Choose encode or decode mode.',
      'Copy output for immediate use in your app.',
    ],
    relatedGuides: [
      {
        title: 'Base64 Encoding vs. Decoding: When and Why to Use It',
        href: '/blog/guides/base64-encoding-vs-decoding',
      },
      {
        title: 'Prompt Engineering for Developers: Best Practices for Cleaner Code',
        href: '/blog/guides/prompt-engineering-for-developers',
      },
    ],
    faqs: [
      {
        question: 'Is Base64 encryption?',
        answer: 'No. Base64 is an encoding format, not an encryption method.',
      },
      {
        question: 'Can I decode malformed strings?',
        answer:
          'The tool warns on invalid input and returns decoded output only for valid Base64 content.',
      },
    ],
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    summary: 'Test expressions with instant feedback for edge-case matching.',
    description:
      'Build and test regular expressions with immediate match feedback to speed up validation logic for forms, parsers, and search features.',
    category: 'Validation',
    targetKeyword: 'online regex tester',
    useCases: [
      'Validate user input patterns in forms.',
      'Test extraction patterns for logs and plain text.',
      'Debug edge cases with grouped and flagged expressions.',
    ],
    quickStart: [
      'Write or paste a regular expression.',
      'Add test input and toggle flags.',
      'Inspect matched groups and refine the expression.',
    ],
    relatedGuides: [
      {
        title: 'Regex Made Easy: Top Online Tools to Test Your Expressions',
        href: '/blog/guides/regex-tools-for-developers',
      },
      {
        title: 'Why TypeScript is No Longer Optional for Modern Web Projects',
        href: '/blog/frontend/why-typescript-is-no-longer-optional',
      },
    ],
    faqs: [
      {
        question: 'Does it support regex flags?',
        answer:
          'Yes. Common flags like global, multiline, and case-insensitive can be toggled during testing.',
      },
      {
        question: 'Can I test capture groups?',
        answer: 'Yes. Group results are surfaced so you can verify extraction logic quickly.',
      },
    ],
  },
]

export default toolsData
