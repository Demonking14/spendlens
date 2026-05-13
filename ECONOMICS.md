# Economics

SpendLens is not meant to be a standalone SaaS business. It is a free lead generation tool for Credex, so the economics only make sense if the audits create high-intent consultations that turn into AI credit purchases.

## What a converted lead is worth to Credex

Assumptions:

- Average credit deal size: $5,000
- Gross margin on credits: 30%
- Customer buys credits 3 times per year on average

Gross profit per deal is `$5,000 x 30% = $1,500`. If the average customer buys three times per year, annual revenue per customer is `$5,000 x 3 = $15,000`. Annual gross profit per converted customer is `$15,000 x 30% = $4,500`. For this model, I would treat `$4,500` as first-year LTV because the assignment only gives annual purchase frequency, not multi-year retention.

## CAC by channel

I will assume founder/operator time is valued at `$75/hour`.

**Organic Twitter/X post**  
Hours of effort: 3 hours  
Time cost: `$225`  
Expected reach: 4,000  
Conversion to audit: 2% = 80 audits  
Conversion to lead: 15% = 12 leads  
Conversion to purchase: 10% of leads = 1.2 customers  
Resulting CAC: `$225 / 1.2 = $188`

**Reddit post in r/ExperiencedDevs**  
Hours of effort: 4 hours  
Time cost: `$300`  
Expected reach: 3,000  
Conversion to audit: 2.5% = 75 audits  
Conversion to lead: 18% = 13.5 leads  
Conversion to purchase: 12% of leads = 1.62 customers  
Resulting CAC: `$300 / 1.62 = about $185`

**Direct outreach to Credex existing customers**  
Hours of effort: 5 hours  
Time cost: `$375`  
Expected reach: 40 accounts  
Conversion to audit: 35% = 14 audits  
Conversion to lead: 50% = 7 leads  
Conversion to purchase: 30% of leads = 2.1 customers  
Resulting CAC: `$375 / 2.1 = about $179`

**Product Hunt launch**  
Hours of effort: 8 hours  
Time cost: `$600`  
Expected reach: 6,000  
Conversion to audit: 1.5% = 90 audits  
Conversion to lead: 10% = 9 leads  
Conversion to purchase: 8% of leads = 0.72 customers  
Resulting CAC: `$600 / 0.72 = about $833`

## Conversion funnel that makes this profitable

Assumed funnel:

- Visitors to audit started: 35%
- Audit started to audit completed: 60%
- Audit completed to email captured: 20%
- Email captured to consultation booked: 20%
- Consultation booked to credit purchase: 25%

Starting with 1,000 visitors:

- `1,000 x 35% = 350` audit starts
- `350 x 60% = 210` completed audits
- `210 x 20% = 42` emails captured
- `42 x 20% = 8.4` consultations booked
- `8.4 x 25% = 2.1` customers

At `$4,500` first-year gross profit per customer, that yields `2.1 x $4,500 = $9,450` in gross profit from 1,000 visitors. Break-even CAC per acquired customer is therefore anything below `$4,500`, and break-even acquisition spend per 1,000 visitors is about `$9,450`. That leaves a healthy margin for low-cost organic distribution.

## Path to $1M ARR in 18 months

Assumption: `$1M ARR` here means `$1,000,000` in annualized credit sales, not gross profit.

Each customer buys `$5,000` of credits three times per year, so annual revenue per customer is `$15,000`. To reach `$1,000,000 ARR`, Credex needs:

- `$1,000,000 / $15,000 = 66.7`, so about **67 active customers**

Using the funnel above:

- Customers needed: `67`
- With consultation-to-purchase at `25%`, consultations needed: `67 / 25% = 268`
- With email-to-consultation at `20%`, captured leads needed: `268 / 20% = 1,340`
- With audit-completed-to-email at `20%`, completed audits needed: `1,340 / 20% = 6,700`
- With audit-started-to-completed at `60%`, audit starts needed: `6,700 / 60% = 11,167`
- With visitor-to-audit-started at `35%`, visitors needed: `11,167 / 35% = 31,906`

So the 18-month path is roughly:

`31,906 visitors -> 11,167 audit starts -> 6,700 completed audits -> 1,340 leads -> 268 consultations -> 67 customers -> about $1.0M ARR`

At 30% gross margin, `$1.0M ARR` in credit sales produces about `$300,000` in annual gross profit. That means SpendLens does not need massive scale to matter; it needs a steady flow of highly relevant traffic and a consultation funnel that stays efficient.
