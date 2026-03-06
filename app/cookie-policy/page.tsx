import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Cookie Policy',
  description: 'How StackPilots uses cookies and similar technologies.',
})

export default function CookiePolicyPage() {
  return (
    <div className="prose dark:prose-invert max-w-none pt-8 pb-12">
      <h1>Cookie Policy</h1>
      <p>
        StackPilots uses cookies and similar technologies to understand traffic, improve
        performance, and support advertising and affiliate measurement.
      </p>
      <h2>Types of cookies</h2>
      <ul>
        <li>Essential cookies required for core site functionality.</li>
        <li>Analytics cookies used to measure usage trends.</li>
        <li>Advertising or affiliate cookies used by third-party partners.</li>
      </ul>
      <h2>Managing cookies</h2>
      <p>
        You can control cookies in your browser settings. Disabling cookies may impact some website
        features.
      </p>
      <h2>Updates</h2>
      <p>We may update this policy as our tooling and advertising setup evolves.</p>
    </div>
  )
}
