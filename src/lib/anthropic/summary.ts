import { TOOLS_CONFIG } from "@/lib/audit-engine/rules";
import type { AuditRecommendation, AuditResult } from "@/types/audit";

const SYSTEM_PROMPT = `You are a concise financial advisor for startup teams.
You analyze AI tool spending and give clear, specific advice.
Never use filler phrases like 'Great news!' or 'Exciting!'.
Be direct, specific, and reference actual numbers from the audit.`;

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-opus-4-5";
const MAX_TOKENS = 200;
const ANTHROPIC_VERSION = "2023-06-01";

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicMessageResponse = {
  content: AnthropicTextBlock[];
};

function formatCurrency(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function getToolDisplayName(tool: string): string {
  return TOOLS_CONFIG[tool]?.displayName ?? tool;
}

function getTopRecommendation(result: AuditResult): AuditRecommendation | undefined {
  return [...result.recommendations].sort(
    (first, second) => second.estimatedSaving - first.estimatedSaving,
  )[0];
}

function buildToolsList(result: AuditResult): string {
  return result.input.tools
    .map((toolInput) => `${getToolDisplayName(toolInput.tool)} ($${formatCurrency(toolInput.monthlySpend)}/month)`)
    .join(", ");
}

function buildUserPrompt(result: AuditResult): string {
  const topRecommendation = getTopRecommendation(result);

  return `Here is a startup's AI tool audit result:
- Team size: ${result.input.teamSize}
- Primary use case: ${result.input.useCase}
- Tools audited: ${buildToolsList(result)}
- Total monthly savings identified: $${formatCurrency(result.totalMonthlySaving)}
- Top recommendation: ${topRecommendation?.reason ?? "No major savings opportunity was identified."}

Write a 80-100 word personalized summary paragraph for this team.
Reference their specific tools and savings amount.
End with one concrete next step they should take this week.`;
}

function buildFallbackSummary(result: AuditResult): string {
  const topRecommendation = getTopRecommendation(result);
  const annualSaving = formatCurrency(result.totalMonthlySaving * 12);

  return `Based on your audit, you're spending $${annualSaving} more annually than necessary. Your biggest opportunity is ${topRecommendation?.recommendedAction ?? "reviewing your current AI tool plans"}. Review your current plans and consider the suggested alternatives to start saving immediately.`;
}

function isAnthropicMessageResponse(value: unknown): value is AnthropicMessageResponse {
  if (typeof value !== "object" || value === null || !("content" in value)) {
    return false;
  }

  const content = (value as { content: unknown }).content;

  return (
    Array.isArray(content) &&
    content.every(
      (block) =>
        typeof block === "object" &&
        block !== null &&
        (block as { type?: unknown }).type === "text" &&
        typeof (block as { text?: unknown }).text === "string",
    )
  );
}

export async function generateSummary(result: AuditResult): Promise<string> {
  const fallbackSummary = buildFallbackSummary(result);

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return fallbackSummary;
    }

    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt(result),
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackSummary;
    }

    const data: unknown = await response.json();

    if (!isAnthropicMessageResponse(data)) {
      return fallbackSummary;
    }

    const summary = data.content
      .map((block) => block.text)
      .join(" ")
      .trim();

    return summary || fallbackSummary;
  } catch {
    return fallbackSummary;
  }
}
