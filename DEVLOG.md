# Devlog

## Day 1 — 2026-05-07

**Hours worked:** 2-3

**What I did:** Initialized the Next.js 14 project with TypeScript and started configuration. Got stuck on Tailwind setup — the configuration was not applying styles correctly and took significant time to debug.

**What I learned:** Tailwind v4 has a different configuration approach than v3 — the tailwind.config.js content paths need to match exactly where your component files live or styles don't apply.

**Blockers / what I'm stuck on:** Tailwind configuration took longer than expected. Resolved by end of day but slowed initial momentum.

**Plan for tomorrow:** Build the full UI structure, set up TypeScript interfaces for all audit types, and get the project skeleton solid enough to start adding real logic.

---

## Day 2 — 2026-05-08

**Hours worked:** 4-5

**What I did:** Built the full UI layout and set up all TypeScript interfaces — ToolName, AuditInput, AuditResult, AuditRecommendation and all related types. Created the complete folder structure with components, lib, and api directories. Got the project to a state where real feature work can begin.

**What I learned:** Defining TypeScript types before writing any logic forces you to think through the data shape early. Caught several design issues just by trying to type the audit result structure — for example realising recommendations needed to be per-tool not a single object.

**Blockers / what I'm stuck on:** Nothing blocking. Structure is solid going into Day 3.

**Plan for tomorrow:** Build the audit engine with hardcoded rules, set up API routes, and write the required markdown files.

---

## Day 3 — 2026-05-09

**Hours worked:** 4-5

**What I did:** Built the core audit engine with hardcoded rules for all 8 tools — plan fit checks, overpay detection, and cheaper alternative suggestions. Set up API routes for /api/audit and /api/leads. Created the required markdown file skeletons including PRICING_DATA.md with real pricing URLs.

**What I learned:** Hardcoding the audit rules rather than using AI for the logic was the right call. The savings calculations need to be deterministic and defensible — an AI generating savings numbers would be unpredictable and hard to trust.

**Blockers / what I'm stuck on:** Some edge cases in the audit engine around API direct users (anthropic_api, openai_api) where there is no seat price — had to handle those separately.

**Plan for tomorrow:** Build the full results page UI with savings breakdown, integrate Anthropic API for personalized summary, and write PROMPTS.md.

---

## Day 4 — 2026-05-10

**Hours worked:** 3-4

**What I did:** Built the complete results page UI showing per-tool breakdown, hero savings numbers, and conditional Credex CTA for audits over $500 monthly savings. Integrated Anthropic API for personalized audit summary with templated fallback. Writing and iterating on the AI prompt took 3-4 hours — went through several versions before the output felt specific and useful rather than generic.

**What I learned:** Prompt engineering for a specific output format takes much longer than expected. The first version of the prompt kept producing outputs that said things like "Great news!" which felt wrong for a financial tool. Adding explicit instructions to avoid filler phrases and reference specific numbers made a significant difference.

**Blockers / what I'm stuck on:** Getting the Anthropic summary to feel genuinely personalized rather than templated took iteration. Settled on a prompt that forces the model to reference actual tool names and dollar amounts.

**Plan for tomorrow:** Learn Supabase, add lead capture with DB storage, deploy to Vercel.

---

## Day 5 — 2026-05-11

**Hours worked:** 5-6

**What I did:** Learned Supabase from scratch — went through the docs to understand how the client works, set up the audits table with the correct schema, and integrated it into the API routes. Deployed the project to Vercel with all environment variables configured. Did not set up Resend transactional email — Resend requires a verified custom domain which I do not currently have, so this feature is not complete.

**What I learned:** Supabase is more approachable than expected once you understand it is just Postgres with an auto-generated API. The SSR client setup with cookies took time to get right in the Next.js App Router context.

**Blockers / what I'm stuck on:** Resend email is not implemented due to domain verification requirement. This is a known gap in the submission — the lead capture form works and saves to Supabase but does not send a confirmation email.

**Plan for tomorrow:** Show the project to real people for feedback, write entrepreneurial markdown files.

---

## Day 6 — 2026-05-12

**Hours worked:** 3-4

**What I did:** Showed the working project to college friends and asked for honest feedback. The feature they responded most positively to was the Credex redirect for high-savings audits — they felt it was a seamless integration rather than a forced advertisement, because it only appears when the savings number is large enough to justify it. Took notes from their feedback for USER_INTERVIEWS.md. Started writing GTM.md and ECONOMICS.md.

**What I learned:** Showing the project to real people surfaces things you stop noticing after staring at the same UI for days. One friend immediately asked "what if I don't know my exact monthly spend?" which exposed a gap in the form — there is no way to enter an approximate amount or skip a field.

**Blockers / what I'm stuck on:** The feedback session surfaced a UX issue with the spend input form — users do not always know their exact monthly spend. Did not have time to fix this today.

**Plan for tomorrow:** Write all remaining markdown files, final polish, verify git log has 5+ distinct days, deploy final version to GitHub and submit.

---

## Day 7 — 2026-05-13

**Hours worked:** 

**What I did:** Wrote all required markdown files — REFLECTION.md, ARCHITECTURE.md, GTM.md, ECONOMICS.md, METRICS.md, LANDING_COPY.md, TESTS.md, USER_INTERVIEWS.md. Final deployment to GitHub with all files in place. Verified CI is green and git log shows commits across the full week.

**What I learned:** 

**Blockers / what I'm stuck on:** Resend email remains unimplemented due to domain requirement. All other MVP features are complete and working on the deployed URL.

**Plan for tomorrow:** Submit via Google Form.
