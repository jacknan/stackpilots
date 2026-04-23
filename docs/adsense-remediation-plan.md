# AdSense Remediation Plan (StackPilots)

## Goal

Get `https://www.stackpilots.org` ready for AdSense re-review by addressing the "Low value content" decision with site-level improvements (not only article rewrites).

Target window: **2-4 weeks** before re-submission.

---

## Current Risk Signals (Likely)

- High volume of short, template-like news rewrite posts.
- Repetitive structure across many AI-tool news pages.
- Limited "product value" beyond chronological blog listing.
- Mixed quality across recent auto-generated posts.
- Thin summaries visible on listing pages reduce perceived editorial value.

---

## Success Criteria Before Re-Submit

- At least **20 high-quality English technical posts** with clear original analysis.
- Thin/repetitive posts either:
  - rewritten to quality standard, or
  - set to `noindex`, or
  - removed.
- Add **5 value modules/pages** (see P1 below).
- Stable UX and trust pages (About, Contact, Privacy, Terms, Editorial Policy, Methodology).
- Internal linking and category architecture cleaned up.
- 7-14 days of stable publishing quality after cleanup.

---

## Priority Plan

## P0 (48-72 hours): Stop quality leakage

1. **Change auto-publish mode**
   - Keep candidate collection.
   - Publish only after manual review.
   - Daily target can remain 2, but must pass quality checklist.

2. **Run content audit**
   - Label each article: `keep`, `rewrite`, `noindex`, `remove`.
   - Focus first on AI Tools pages that look like short rewrites.

3. **Fix listing-page quality**
   - Ensure summaries are meaningful and non-truncated junk.
   - Remove obvious boilerplate phrases.

4. **Set minimum quality gate**
   - Minimum word count (recommended: 900+ for analysis posts).
   - Must include: what happened, technical implications, who should care, risks, action items.

---

## P1 (Week 1): Add site-level value modules

Build these pages/modules (high impact for AdSense quality perception):

1. `/start-here`
   - New visitor onboarding.
   - Explain what StackPilots helps solve and where to begin.

2. `/methodology` or `/how-we-review-ai-tools`
   - Explain evaluation method, scoring criteria, update policy.

3. `/best-ai-dev-tools` (hub page)
   - Curated, updated comparison hub.
   - Not a news stream; show use-case-based recommendations.

4. Author/editor transparency
   - Enrich author profile and editorial responsibility.

5. Topic hubs with intent
   - Example hubs: `AI coding`, `security tooling`, `workflow automation`.
   - Each hub should have a short guide + handpicked links.

---

## P2 (Week 2): Raise content floor

1. Rewrite top 10-15 weak posts into full technical analysis.
2. Add 5-8 evergreen pieces:
   - comparison
   - migration guide
   - implementation playbook
   - architecture/security trade-off guide
3. Add explicit "who should use / who should avoid" sections.
4. Improve internal links:
   - each post -> 1 pillar + 2 related deep posts.

---

## P3 (Week 3): Compliance + final review

1. Crawl/site QA:
   - broken links
   - duplicate titles/meta
   - orphan pages
2. Verify trust pages and accessibility are healthy.
3. Keep publishing quality stable for at least 7 days.
4. Re-submit to AdSense.

---

## Publishing Quality Checklist (Use Per Post)

- Original angle (not just source rewrite).
- Technical depth and concrete implications.
- Practical actions a team can execute.
- Balanced risks/limitations.
- Clean English and coherent structure.
- At least one authoritative source reference.

If any item fails -> draft only, do not publish.

---

## Operational Changes Recommended

- Keep automation for sourcing and drafting.
- Add manual editorial approval before publish.
- Keep daily cadence flexible during remediation (quality > quantity).
- Track weekly metrics:
  - publish count (quality-approved)
  - rewrite/removal count
  - avg word count
  - hub page sessions

---

## Re-Submission Timing

Do **not** re-apply immediately.

Recommended trigger:

- P0 + P1 complete,
- at least one full week of quality-consistent output,
- visible reduction of thin pages.

Then submit for review again.

---

## Optional Revenue Backup (Parallel)

While waiting for AdSense:

- Ezoic (early monetization option)
- direct affiliate placements for dev tools
- sponsor slot in curated newsletter section

These can reduce revenue downtime while AdSense is pending.
