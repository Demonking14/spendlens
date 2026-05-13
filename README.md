# SpendLens — AI Spend Audit Tool

SpendLens is a free AI spend audit tool for startup teams that pay for products like Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf, and AI APIs. It helps engineering and startup leaders spot plan mismatches, duplicate spend, and savings opportunities before renewal conversations. For Credex, it creates qualified leads from teams with meaningful AI spend pain.

## Screenshots
[Add 3 screenshots or a Loom link here before submitting]
- Screenshot 1: The audit form
- Screenshot 2: Results page with savings numbers
- Screenshot 3: Credex CTA for high-savings audit

## Live demo
[your Vercel URL]

## Quick start
```bash
npm install
cp .env.local.example .env.local
# fill in your keys
npm run dev
```

## Stack
- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase (Postgres)
- Resend (transactional email)
- Anthropic API (personalized summaries)
- Vercel (deployment)
- Vitest (tests)

## Decisions
1. Why Next.js App Router over Pages Router:
   The App Router fits the product shape: server routes for audit/lead APIs, server metadata for shareable results, and client components only where interactivity is needed.
2. Why Supabase over Firebase:
   SpendLens stores relational audit records, JSON recommendations, and lead fields, so Postgres is a natural fit. Supabase gives that without building auth, hosting, or database admin from scratch.
3. Why hardcoded rules for audit logic instead of AI:
   Savings recommendations need to be deterministic, explainable, cheap to run, and easy to test. AI is used only for the summary paragraph, while the math stays inspectable.
4. Why email capture after results not before:
   The user should see value before being asked for contact details. Post-results capture builds trust and avoids making the audit feel like a bait-and-switch.
5. Why in-memory rate limiting instead of Redis:
   For a first deployment, in-memory rate limiting is enough to stop casual abuse and keeps infrastructure simple. Redis becomes worthwhile once traffic is high enough or multi-region consistency matters.

## Running tests
```bash
npx vitest run
```

## CI
GitHub Actions runs lint + typecheck + tests on every push to main.
