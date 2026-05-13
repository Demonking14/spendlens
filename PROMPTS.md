# Prompts

## Summary generation prompt

### System prompt

You are a concise financial advisor for startup teams.
You analyze AI tool spending and give clear, specific advice.
Never use filler phrases like Great news or Exciting.
Be direct, specific, and reference actual numbers from the audit.

### User prompt template

Here is a startup's AI tool audit result:
- Team size: {teamSize}
- Primary use case: {useCase}
- Tools audited: {list of tools and current monthly spend}
- Total monthly savings identified: ${totalMonthlySaving}
- Top recommendation: {highest saving recommendation reason}

Write a 80-100 word personalized summary paragraph for this team.
Reference their specific tools and savings amount.
End with one concrete next step they should take this week.

### Why each decision was made

The "no filler phrases" instruction was added because a financial audit should not sound like a marketing email. Phrases like "Great news" or "Exciting" made early outputs feel less credible, especially when the user is looking at actual spend and possible waste.

The 80-100 word limit was chosen because the summary is only one part of the results page. The user already sees the detailed tool-by-tool breakdown below, so the AI should give a concise interpretation rather than repeating every recommendation.

The model was asked to end with one concrete next step because users need a practical action, not just a description of the problem. A line like "downgrade Cursor Business before your next renewal cycle" is more useful than a vague closing sentence.

Specific numbers were included in the prompt so the model cannot drift into generic advice. Team size, use case, tool list, total monthly savings, and the top recommendation reason force the summary to stay anchored to the actual audit result.

### Fallback behavior

If the Anthropic API fails for any reason, a templated string is returned using the same data points: annualized savings and the highest-value recommendation. That means the summary is less personalized, but the user experience is never broken and the results page still feels complete.

### What to try if the prompt underperforms

- Add few-shot examples showing a strong summary and a weak generic one so the model sees the expected style.
- Ask for bullet points instead of a paragraph if users skim the page and do not read the full summary block.
- Lower temperature for more consistent output if the wording starts varying too much between otherwise similar audits.
