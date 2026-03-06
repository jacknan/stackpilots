import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Contact',
  description: 'Contact StackPilots for editorial feedback, partnerships, and tool requests.',
})

export default function ContactPage() {
  return (
    <div className="prose dark:prose-invert max-w-none pt-8 pb-12">
      <h1>Contact</h1>
      <p>
        We welcome feedback on guides, tool requests, collaboration opportunities, and editorial
        corrections.
      </p>
      <h2>Email</h2>
      <p>
        Reach us at <a href="mailto:nan8278@gmail.com">nan8278@gmail.com</a>.
      </p>
      <h2>What to include</h2>
      <ul>
        <li>Topic or URL you are referring to.</li>
        <li>Specific issue, question, or request.</li>
        <li>Any timeline constraints if relevant.</li>
      </ul>
      <p>We usually respond within 2-3 business days.</p>
    </div>
  )
}
