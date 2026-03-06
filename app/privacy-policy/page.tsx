import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Privacy Policy',
  description: 'How StackPilots collects, uses, and protects visitor information.',
})

export default function PrivacyPolicyPage() {
  return (
    <div className="prose dark:prose-invert max-w-none pt-8 pb-12">
      <h1>Privacy Policy</h1>
      <p>
        StackPilots respects your privacy. We collect limited usage data to improve content quality,
        product decisions, and website performance.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Basic analytics events, page views, and referral sources.</li>
        <li>Information you provide voluntarily through forms or email.</li>
        <li>Technical data such as browser type, device type, and approximate region.</li>
      </ul>
      <h2>How we use data</h2>
      <ul>
        <li>To improve tutorials, tools, and site usability.</li>
        <li>To monitor site reliability and security.</li>
        <li>To communicate when you request updates or support.</li>
      </ul>
      <h2>Third-party services</h2>
      <p>
        We may use analytics, advertising, and affiliate services. These providers may process data
        according to their own privacy policies.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy requests, email <a href="mailto:nan8278@gmail.com">nan8278@gmail.com</a>.
      </p>
    </div>
  )
}
