import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Terms of Service',
  description: 'Terms for using StackPilots content, tools, and services.',
})

export default function TermsPage() {
  return (
    <div className="prose dark:prose-invert max-w-none pt-8 pb-12">
      <h1>Terms of Service</h1>
      <p>
        By accessing StackPilots, you agree to use the website for lawful purposes and in accordance
        with these terms.
      </p>
      <h2>Content and tools</h2>
      <ul>
        <li>Content is provided for educational and informational use.</li>
        <li>Tool outputs are provided as-is without warranty.</li>
        <li>You are responsible for validating results before production use.</li>
      </ul>
      <h2>Intellectual property</h2>
      <p>
        Unless stated otherwise, all content and branding on StackPilots are owned by StackPilots.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        StackPilots is not liable for losses resulting from use of this website, its tools, or
        linked third-party services.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{' '}
        <a href="mailto:nan8278@gmail.com">nan8278@gmail.com</a>.
      </p>
    </div>
  )
}
