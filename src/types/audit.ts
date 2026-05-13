export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type CursorPlan = "hobby" | "pro" | "business" | "enterprise" | "other";
export type GitHubCopilotPlan =
  | "free"
  | "pro"
  | "business"
  | "enterprise"
  | "other";
export type ClaudePlan =
  | "free"
  | "pro"
  | "max"
  | "team"
  | "enterprise"
  | "other";
export type ChatGPTPlan =
  | "free"
  | "plus"
  | "pro"
  | "team"
  | "enterprise"
  | "other";
export type AnthropicApiPlan =
  | "pay_as_you_go"
  | "committed_use"
  | "enterprise"
  | "other";
export type OpenAIApiPlan =
  | "pay_as_you_go"
  | "committed_use"
  | "enterprise"
  | "other";
export type GeminiPlan =
  | "free"
  | "advanced"
  | "workspace"
  | "api"
  | "enterprise"
  | "other";
export type WindsurfPlan = "free" | "pro" | "teams" | "enterprise" | "other";

export type PlanName =
  | CursorPlan
  | GitHubCopilotPlan
  | ClaudePlan
  | ChatGPTPlan
  | AnthropicApiPlan
  | OpenAIApiPlan
  | GeminiPlan
  | WindsurfPlan;

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolInput = {
  tool: ToolName;
  plan: string;
  seats: number;
  monthlySpend: number;
};

export type AuditInput = {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
};

export type AuditRecommendation = {
  tool: ToolName;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  estimatedSaving: number;
  reason: string;
  switchTo?: ToolName;
};

export type AuditResult = {
  id: string;
  input: AuditInput;
  recommendations: AuditRecommendation[];
  totalMonthlySaving: number;
  totalAnnualSaving: number;
  summary?: string;
  createdAt: string;
};
