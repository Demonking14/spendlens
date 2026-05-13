# Metrics

## North Star metric

Qualified consultations booked per week.

This is the best North Star because SpendLens is not a habit product and does not need daily active users to be healthy. A completed audit only matters if it turns into a conversation with a company that actually has meaningful AI spend and a real chance of buying credits through Credex. I would not use total audits or email captures as the North Star because both can grow while lead quality stays weak.

## Three input metrics that drive the North Star

**Metric name:** Audit completion rate  
**Why it drives the North Star:** Users have to reach the value moment before they will trust the result enough to share contact information or book a consultation.  
**Healthy number:** Week 1: 35-45% of people who start the form complete the audit. Month 3: 50-60% after better copy and less friction.

**Metric name:** Audit-to-lead conversion rate  
**Why it drives the North Star:** This tells us whether users believe the result is useful enough to exchange their email after seeing it.  
**Healthy number:** Week 1: 10-15% of completed audits turn into captured leads. Month 3: 20-30% once the post-results modal and follow-up value are clearer.

**Metric name:** High-savings CTA click rate  
**Why it drives the North Star:** The Credex consultation path only matters if users with meaningful savings actually engage with it.  
**Healthy number:** Week 1: 15-20% of users shown the high-savings CTA click through. Month 3: 25-35% after better positioning and credibility.

## First 5 analytics events to instrument

**audit_started**  
Triggered when a user begins interacting with the audit form.  
Why it matters: measures top-of-funnel intent and lets us calculate drop-off before completion.

**audit_completed**  
Triggered when `/api/audit` returns a successful result and the user lands on the results page.  
Why it matters: this is the product’s value moment and the baseline denominator for lead conversion.

**lead_captured**  
Triggered when a user submits the lead capture form successfully.  
Why it matters: shows whether the audit produced enough trust to earn follow-up permission.

**share_clicked**  
Triggered when the user copies the shareable results URL.  
Why it matters: indicates whether results are compelling enough to spread organically.

**consultation_booked**  
Triggered when a user clicks through or completes the Credex consultation path.  
Why it matters: this is the strongest signal that the lead is commercially meaningful.

## Pivot trigger

If audit_to_lead conversion is below 8% after 500 completed audits in the first 30 days, I would treat that as a serious signal that users do not trust the savings estimates enough to trade an email for follow-up. At that point I would pivot from "instant audit with optional lead capture" to a more transparent methodology-first experience that shows the pricing assumptions, rule logic, and confidence level before asking for contact details.
