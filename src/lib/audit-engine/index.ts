import { TOOLS_CONFIG } from "./rules";
import type {
  AuditInput,
  AuditRecommendation,
  AuditResult,
  ToolInput,
  ToolName,
} from "@/types/audit";

type AuditOutput = Omit<AuditResult, "id" | "createdAt" | "summary">;

const OVERPAY_THRESHOLD_MULTIPLIER = 1.1; // More than 10% above list price suggests add-ons or overages.
const CHATGPT_TO_CURSOR_SAVING_RATE = 0.3; // Estimate 30% savings when replacing costly ChatGPT coding usage.
const GEMINI_TO_CURSOR_SAVING_RATE = 0.2; // Estimate 20% savings when replacing costly Gemini coding usage.
const API_TO_CURSOR_SAVING_RATE = 0.4; // Estimate 40% savings when predictable API coding usage moves to Cursor.
const API_PREDICTABILITY_THRESHOLD = 500; // Above $500/month, flat team plans can reduce budget volatility.
const API_CODING_REPLACEMENT_THRESHOLD = 200; // Above $200/month, coding API usage may justify a tool replacement.
const CURSOR_BUSINESS_SMALL_TEAM_MAX_SEATS = 5; // Cursor Business is usually overkill at five seats or fewer.
const CLAUDE_TEAM_MIN_SEATS = 5; // Claude Team is intended for five or more seats in these audit rules.
const COPILOT_ENTERPRISE_SMALL_TEAM_MAX_SEATS = 10; // Copilot Enterprise is usually premature at ten seats or fewer.
const CHATGPT_TEAM_MIN_SEATS = 2; // ChatGPT Team requires team usage to justify the higher plan.
const WINDSURF_TEAMS_SMALL_TEAM_MAX_SEATS = 3; // Windsurf Teams is usually overkill at three seats or fewer.
const WRITING_TEAM_SIZE_THRESHOLD = 5; // Writing teams above five people benefit more from team collaboration features.
const RESEARCH_TEAM_SEAT_THRESHOLD = 3; // Research recommendations prefer team tooling after three seats.
const DATA_TEAM_SEAT_THRESHOLD = 5; // Data workflows usually need shared administration after five seats.
const CURSOR_BUSINESS_PRICE = 40;
const CURSOR_PRO_PRICE = 20;
const CLAUDE_TEAM_PRICE = 30;
const CLAUDE_PRO_PRICE = 20;
const COPILOT_ENTERPRISE_PRICE = 39;
const COPILOT_BUSINESS_PRICE = 19;
const CHATGPT_TEAM_PRICE = 30;
const CHATGPT_PLUS_PRICE = 20;
const WINDSURF_TEAMS_PRICE = 35;
const WINDSURF_PRO_PRICE = 15;
const GEMINI_PRO_PRICE = 20;

function normalizePlan(plan: string): string {
  return plan.trim().toLowerCase();
}

function getPlanPrice(toolInput: ToolInput): number | null {
  const toolConfig = TOOLS_CONFIG[toolInput.tool];
  const planConfig = toolConfig.plans[normalizePlan(toolInput.plan)];

  return planConfig?.monthlyPricePerSeat ?? null;
}

function createRecommendation(
  toolInput: ToolInput,
  recommendedAction: string,
  estimatedSaving: number,
  reason: string,
  options: {
    recommendedPlan?: string;
    switchTo?: ToolName;
  } = {},
): AuditRecommendation {
  return {
    tool: toolInput.tool,
    currentSpend: toolInput.monthlySpend,
    recommendedAction,
    estimatedSaving,
    reason,
    ...options,
  };
}

function addWrongPlanRecommendations(
  toolInput: ToolInput,
  recommendations: AuditRecommendation[],
): boolean {
  const plan = normalizePlan(toolInput.plan);
  const { seats } = toolInput;

  if (
    toolInput.tool === "cursor" &&
    plan === "business" &&
    seats <= CURSOR_BUSINESS_SMALL_TEAM_MAX_SEATS
  ) {
    const saving = (CURSOR_BUSINESS_PRICE - CURSOR_PRO_PRICE) * seats;
    recommendations.push(
      createRecommendation(
        toolInput,
        "Downgrade Cursor Business to Cursor Pro",
        saving,
        "Your team is small enough that Cursor Pro should cover the same core workflow at a lower seat cost.",
        { recommendedPlan: "pro" },
      ),
    );
    return true;
  }

  if (toolInput.tool === "claude" && plan === "team" && seats < CLAUDE_TEAM_MIN_SEATS) {
    const saving = (CLAUDE_TEAM_PRICE - CLAUDE_PRO_PRICE) * seats;
    recommendations.push(
      createRecommendation(
        toolInput,
        "Downgrade Claude Team to Claude Pro",
        saving,
        "Claude Team has a minimum-seat economics profile, so a sub-five-person team is better matched to Pro.",
        { recommendedPlan: "pro" },
      ),
    );
    return true;
  }

  if (
    toolInput.tool === "github_copilot" &&
    plan === "enterprise" &&
    seats <= COPILOT_ENTERPRISE_SMALL_TEAM_MAX_SEATS
  ) {
    const saving = (COPILOT_ENTERPRISE_PRICE - COPILOT_BUSINESS_PRICE) * seats;
    recommendations.push(
      createRecommendation(
        toolInput,
        "Downgrade GitHub Copilot Enterprise to Business",
        saving,
        "Copilot Business is usually the more efficient plan before enterprise-scale controls are needed.",
        { recommendedPlan: "business" },
      ),
    );
    return true;
  }

  if (toolInput.tool === "chatgpt" && plan === "team" && seats < CHATGPT_TEAM_MIN_SEATS) {
    const saving = (CHATGPT_TEAM_PRICE - CHATGPT_PLUS_PRICE) * seats;
    recommendations.push(
      createRecommendation(
        toolInput,
        "Downgrade ChatGPT Team to Plus",
        saving,
        "A single-seat ChatGPT setup does not need team-plan collaboration overhead.",
        { recommendedPlan: "plus" },
      ),
    );
    return true;
  }

  if (
    toolInput.tool === "windsurf" &&
    plan === "teams" &&
    seats <= WINDSURF_TEAMS_SMALL_TEAM_MAX_SEATS
  ) {
    const saving = (WINDSURF_TEAMS_PRICE - WINDSURF_PRO_PRICE) * seats;
    recommendations.push(
      createRecommendation(
        toolInput,
        "Downgrade Windsurf Teams to Pro",
        saving,
        "A very small Windsurf team can usually avoid team-plan administration costs.",
        { recommendedPlan: "pro" },
      ),
    );
    return true;
  }

  return false;
}

function addUseCaseRecommendations(
  input: AuditInput,
  toolInput: ToolInput,
  recommendations: AuditRecommendation[],
): boolean {
  const plan = normalizePlan(toolInput.plan);
  const spendPerSeat = toolInput.monthlySpend / toolInput.seats;
  let triggered = false;

  if (
    input.useCase === "coding" &&
    toolInput.tool === "chatgpt" &&
    (plan === "plus" || plan === "team") &&
    spendPerSeat > CHATGPT_PLUS_PRICE
  ) {
    recommendations.push(
      createRecommendation(
        toolInput,
        "Switch coding-heavy ChatGPT usage to Cursor Pro",
        toolInput.monthlySpend * CHATGPT_TO_CURSOR_SAVING_RATE,
        "Cursor Pro is purpose-built for coding workflows and may reduce duplicated chat-based coding spend.",
        { recommendedPlan: "pro", switchTo: "cursor" },
      ),
    );
    triggered = true;
  }

  if (
    input.useCase === "coding" &&
    toolInput.tool === "gemini" &&
    plan === "pro" &&
    spendPerSeat > GEMINI_PRO_PRICE
  ) {
    recommendations.push(
      createRecommendation(
        toolInput,
        "Switch coding-heavy Gemini usage to Cursor Pro",
        toolInput.monthlySpend * GEMINI_TO_CURSOR_SAVING_RATE,
        "Cursor Pro is a stronger dedicated coding environment when Gemini spend is above its base seat price.",
        { recommendedPlan: "pro", switchTo: "cursor" },
      ),
    );
    triggered = true;
  }

  if (input.useCase === "writing" && toolInput.tool === "cursor" && plan === "pro") {
    recommendations.push(
      createRecommendation(
        toolInput,
        "Switch writing-heavy Cursor usage to Claude Pro",
        0,
        "Claude Pro is a better fit for writing workflows at comparable seat pricing.",
        { recommendedPlan: "pro", switchTo: "claude" },
      ),
    );
    triggered = true;
  }

  if (
    input.useCase === "writing" &&
    toolInput.tool === "chatgpt" &&
    plan === "plus" &&
    input.teamSize > WRITING_TEAM_SIZE_THRESHOLD
  ) {
    recommendations.push(
      createRecommendation(
        toolInput,
        "Switch writing team usage to Claude Team",
        0,
        "Claude Team is a better writing collaboration fit for teams larger than five people.",
        { recommendedPlan: "team", switchTo: "claude" },
      ),
    );
    triggered = true;
  }

  if (input.useCase === "research" && toolInput.tool === "chatgpt" && plan === "plus") {
    recommendations.push(
      createRecommendation(
        toolInput,
        "Switch research-heavy ChatGPT usage to Claude Pro",
        0,
        "Claude Pro is a stronger research fit at comparable seat pricing.",
        { recommendedPlan: "pro", switchTo: "claude" },
      ),
    );
    triggered = true;
  }

  if (
    input.useCase === "research" &&
    toolInput.tool === "gemini" &&
    plan === "pro" &&
    toolInput.seats > RESEARCH_TEAM_SEAT_THRESHOLD
  ) {
    const saving = (GEMINI_PRO_PRICE - GEMINI_PRO_PRICE) * toolInput.seats;
    recommendations.push(
      createRecommendation(
        toolInput,
        "Switch research team usage to Claude Team",
        saving,
        "Claude Team is a better fit for multi-seat research workflows even when the monthly savings are neutral.",
        { recommendedPlan: "team", switchTo: "claude" },
      ),
    );
    triggered = true;
  }

  if (
    input.useCase === "data" &&
    toolInput.tool === "claude" &&
    plan === "pro" &&
    toolInput.seats > DATA_TEAM_SEAT_THRESHOLD
  ) {
    const saving =
      toolInput.seats >= CLAUDE_TEAM_MIN_SEATS
        ? (CLAUDE_TEAM_PRICE - CLAUDE_PRO_PRICE) * toolInput.seats
        : 0;
    recommendations.push(
      createRecommendation(
        toolInput,
        "Move data-heavy Claude Pro seats to Claude Team",
        saving,
        "Claude Team can centralize administration for larger data teams while improving plan fit.",
        { recommendedPlan: "team" },
      ),
    );
    triggered = true;
  }

  if (
    input.useCase === "data" &&
    toolInput.tool === "chatgpt" &&
    plan === "plus" &&
    toolInput.seats > RESEARCH_TEAM_SEAT_THRESHOLD
  ) {
    const saving = (CHATGPT_PLUS_PRICE - CHATGPT_TEAM_PRICE) * toolInput.seats;

    if (saving > 0) {
      recommendations.push(
        createRecommendation(
          toolInput,
          "Move data-heavy ChatGPT Plus seats to ChatGPT Team",
          saving,
          "ChatGPT Team should only replace Plus when the seat economics produce real monthly savings.",
          { recommendedPlan: "team" },
        ),
      );
      triggered = true;
    }
  }

  return triggered;
}

function addOverpayRecommendation(
  toolInput: ToolInput,
  recommendations: AuditRecommendation[],
): boolean {
  const planPrice = getPlanPrice(toolInput);

  if (planPrice === null || planPrice === 0) {
    return false;
  }

  const expectedMonthlySpend = planPrice * toolInput.seats;
  const overpayThreshold = expectedMonthlySpend * OVERPAY_THRESHOLD_MULTIPLIER;

  if (toolInput.monthlySpend > overpayThreshold) {
    recommendations.push(
      createRecommendation(
        toolInput,
        "You may be on add-ons or overages",
        toolInput.monthlySpend - expectedMonthlySpend,
        "Your spend is higher than the standard plan price for your seat count.",
      ),
    );
    return true;
  }

  return false;
}

function addApiRecommendations(
  input: AuditInput,
  toolInput: ToolInput,
  recommendations: AuditRecommendation[],
): boolean {
  if (toolInput.tool !== "anthropic_api" && toolInput.tool !== "openai_api") {
    return false;
  }

  let triggered = false;

  if (toolInput.monthlySpend > API_PREDICTABILITY_THRESHOLD) {
    recommendations.push(
      createRecommendation(
        toolInput,
        "Consider Claude Team or ChatGPT Team for predictable costs if your usage is consistent",
        0,
        "A flat team plan may reduce budget variance when direct API usage is consistently above $500 per month.",
      ),
    );
    triggered = true;
  }

  if (toolInput.monthlySpend > API_CODING_REPLACEMENT_THRESHOLD && input.useCase === "coding") {
    recommendations.push(
      createRecommendation(
        toolInput,
        "Consider Cursor Pro as a potential replacement for coding-heavy API usage",
        toolInput.monthlySpend * API_TO_CURSOR_SAVING_RATE,
        "Cursor Pro can replace some direct coding API usage with a predictable seat-based workflow.",
        { recommendedPlan: "pro", switchTo: "cursor" },
      ),
    );
    triggered = true;
  }

  return triggered;
}

export function runAudit(input: AuditInput): AuditOutput {
  const recommendations: AuditRecommendation[] = [];

  input.tools.forEach((toolInput) => {
    const beforeCount = recommendations.length;

    addWrongPlanRecommendations(toolInput, recommendations);
    addUseCaseRecommendations(input, toolInput, recommendations);
    addOverpayRecommendation(toolInput, recommendations);
    addApiRecommendations(input, toolInput, recommendations);

    if (recommendations.length === beforeCount) {
      recommendations.push(
        createRecommendation(
          toolInput,
          "No action needed",
          0,
          "You are on the right plan for your team size and use case.",
        ),
      );
    }
  });

  const totalMonthlySaving = recommendations.reduce(
    (total, recommendation) => total + recommendation.estimatedSaving,
    0,
  );

  return {
    input,
    recommendations,
    totalMonthlySaving,
    totalAnnualSaving: totalMonthlySaving * 12,
  };
}
