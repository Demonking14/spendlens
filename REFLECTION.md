# Reflection

## 1. The hardest bug I hit this week

The two hardest technical challenges this week were Resend email setup and Supabase integration — both for the same underlying reason: they were services I had never used before and the error messages were not always clear about what was actually wrong.

With Resend, the blocker was domain verification. Resend requires a custom domain to send transactional emails from — you cannot use a Gmail or generic address in production. I spent time trying to work around this before accepting it as a known limitation. The honest solution for anyone deploying this themselves is to add their own domain in the Resend dashboard and update the from address in the leads API route — the code is written and ready, the domain is the only missing piece.

With Supabase, the challenge was understanding how the client works in a Next.js App Router context. There are two separate clients — a browser client and a server client — and they are configured differently. The server client requires cookies from next/headers which behaves differently in server components versus route handlers. I got stuck on this for a while because the error messages pointed at authentication rather than the actual issue which was the cookie configuration. What fixed it was reading the Supabase SSR docs specifically for Next.js App Router rather than the general docs.

The broader lesson was that unfamiliar services need their own dedicated learning time before integration. Trying to learn and build simultaneously on Day 5 made both take longer than they should have.

## 2. A decision I reversed mid-week

The clearest reversal was around the data model and controller flow in the audit engine. I initially built the recommendation logic as one large function that handled everything — checking plan fit, detecting overpay, and suggesting alternatives — all in a single block with nested if and while conditions.

Midway through Day 3 I got stuck debugging a case where the wrong recommendation was being returned for a specific tool. The problem was that the nested conditions had become hard to follow — I could not easily tell which check was triggering and why. I was second guessing every condition: should this check run before that one, should this be an else if or a separate if, what happens when two checks both trigger for the same tool.

I reversed the decision and restructured the engine into a cleaner flow where each check runs independently and appends to a recommendations array rather than trying to pick one path through a tree of conditions. This made the logic much easier to follow and debug. It also made writing the tests easier because each check could be tested in isolation.

The lesson was that when conditional logic becomes hard to reason about, the solution is usually to flatten it rather than add more conditions. A linear sequence of independent checks is easier to debug than a deeply nested decision tree.

## 3. What I would build in week 2

The highest priority for week 2 would be adding a pre-consultation chat feature. The current flow takes a user from audit results directly to a Credex consultation booking — but there is a gap between seeing a savings number and being ready to talk to a sales person. Many users will see the $500/month saving, feel interested, but not be ready to book a call with a company they just discovered.

A lightweight chat interface — even just a simple Q&A — between the results page and the consultation CTA would bridge that gap. The user could ask things like "how does Credex actually work", "what credits are available for my specific tools", or "is this legitimate" before committing to a consultation. This would likely increase consultation booking rates significantly because it builds trust before asking for a time commitment.

The second priority would be fixing the Resend email integration properly. The code is written and the logic works — the only blocker is domain verification. For the production version, Credex would use their own domain and this would work immediately. Adding clear setup instructions in the README so anyone deploying their own instance knows exactly what to configure would make this a non-issue going forward.

Third priority would be fixing the form UX issue surfaced during user feedback — some users do not know their exact monthly spend. Adding an approximate range selector as an alternative to the exact number input would reduce drop-off on the form.

## 4. How I used AI tools

I used Claude and Cursor throughout the week for different types of tasks.

Cursor was my primary coding environment. I used it for generating component boilerplate, writing TypeScript interfaces, and getting unstuck on syntax I was not familiar with. It was particularly useful for the Supabase client setup where the correct pattern for Next.js App Router is specific and hard to remember.

Claude I used more for thinking through architecture decisions, reviewing the audit engine logic for edge cases, and writing the Anthropic API prompt. I would describe the problem in plain English and use the response to pressure test my approach before writing code.

I did not trust AI for the audit engine rules themselves. The savings calculations and plan recommendations need to be financially defensible — a finance person should read the logic and agree with it. AI suggestions for the rules tended to be plausible-sounding but not always grounded in how these tools are actually priced and used. I wrote and verified those rules manually against real pricing pages.

The frontend was largely vibe coded using Cursor — I was honest about this. The component structure and Tailwind styling came mostly from AI suggestions with my own adjustments for layout and responsiveness.

One specific time AI was wrong: Cursor suggested a Supabase query pattern using the wrong client — it used the browser client inside a server-side API route, which caused a silent auth failure. The error was not obvious because the request did not throw, it just returned no data. I caught it by reading the Supabase SSR docs and realising the server client with cookies was required in route handlers.

## 5. Self-ratings

**Discipline: 7/10**  
I worked consistently across the week but some days ran shorter than planned. If I had been stricter about daily hour targets from Day 1 I would have had more time to polish the UI and fix the Resend gap.

**Code quality: 8.5/10**  
The TypeScript types are clean and strict throughout, the audit engine logic is well structured after the Day 3 refactor, and the API routes have proper validation and error handling. The frontend components could be more modular in places.

**Design sense: 6/10**  
The UI is functional and readable but not visually distinctive. I prioritised getting all features working over visual polish. Given more time I would invest in making the results page more striking — it is the page that gets screenshotted and shared.

**Problem solving: 7/10**  
I handled the Supabase blocker well by going back to first principles and reading the correct documentation. The Resend blocker I accepted as a limitation rather than finding a workaround — in hindsight I could have used a different email service with less strict domain requirements.

**Entrepreneurial thinking: 8/10**  
I understood from the start that the Credex CTA placement was the most important product decision — showing it only for high-savings audits makes it feel like a genuine recommendation rather than an advertisement. The pre-consultation chat idea came from thinking about the real gap in the user journey, not just the feature list.
