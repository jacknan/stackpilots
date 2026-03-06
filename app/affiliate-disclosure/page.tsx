import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Affiliate Disclosure',
  description: 'Disclosure about affiliate links and monetization on StackPilots.',
})

export default function AffiliateDisclosurePage() {
  return (
    <div className="prose dark:prose-invert max-w-none pt-8 pb-12">
      <h1>Affiliate Disclosure</h1>
      <p>
        Some links on StackPilots are affiliate links. If you purchase through these links, we may
        earn a commission at no additional cost to you.
      </p>
      <h2>Editorial independence</h2>
      <p>
        Recommendations are based on practical relevance, developer workflow fit, and transparent
        comparison criteria.
      </p>
      <h2>Advertising relationships</h2>
      <p>
        Sponsored placements, if any, are clearly identified. Paid relationships do not guarantee
        positive coverage.
      </p>
      <h2>Contact</h2>
      <p>
        For partnership and disclosure questions, email{' '}
        <a href="mailto:nan8278@gmail.com">nan8278@gmail.com</a>.
      </p>
    </div>
  )
}
