# Tests

## Test suite

**File:** `src/lib/audit-engine/index.test.ts`  
**How to run:** `npx vitest run`

| Test name | What it covers | Expected result | Current status |
|---|---|---|---|
| Empty tools array returns zero savings | Audit engine handles an input with no selected tools | `totalMonthlySaving` is `0` and `totalAnnualSaving` is `0` | passing |
| Cursor Business with 3 seats triggers downgrade to Pro | Cursor plan-fit rule for small teams | Recommendation downgrades to `pro` and estimated saving is `$60` | passing |
| Claude Team with 3 seats triggers downgrade to Pro | Claude Team minimum-seat rule | Recommendation downgrades to `pro` and estimated saving is `$30` | passing |
| GitHub Copilot Enterprise with 5 seats triggers downgrade | Copilot Enterprise plan-fit rule for small teams | Estimated saving is `$100` | passing |
| Already optimal plan returns estimatedSaving of 0 | Prevents false savings from being manufactured | `estimatedSaving` is `0` and action is `No action needed` | passing |
| Overpay detection: Claude Pro 1 seat spending $50 flags $30 overage | Detects spend that exceeds expected plan pricing | Overage recommendation appears with `$30` estimated saving | passing |
| Anthropic API user spending $600/month gets a recommendation | API direct user handling | Recommendation is not `No action needed` | passing |

## How to run

```bash
npx vitest run
```

## Coverage notes

The audit engine is fully unit tested because it is pure logic with no side effects. That made it the highest-leverage place to invest test effort, since it controls the correctness of the savings numbers and recommendations shown to users.

The API routes and UI were integration tested manually through the deployed URL instead of being unit tested. Given the 7-day timeline, this was the right tradeoff: the deterministic logic layer got automated coverage, while the end-to-end product flow was validated manually in the live app.

## What would be tested next

If there was more time, the next automated tests would cover API route input validation edge cases, especially malformed tool payloads and invalid UUIDs. I would also test the lead capture honeypot logic to make sure bot submissions are silently ignored. Finally, I would add rendering tests for the results page when total savings are zero so the efficient-spend state stays correct.
