import type { Metadata } from "next";
import { ResultsContent } from "./ResultsContent";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AuditRecommendation, AuditResult, ToolInput, ToolName, UseCase } from "@/types/audit";

type ResultsPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    data?: string | string[];
  };
};

type AuditRow = {
  id: string;
  created_at: string;
  team_size: number;
  use_case: string;
  tools: unknown;
  total_monthly_saving: number | string;
  total_annual_saving: number | string;
  recommendations: unknown;
  summary: string | null;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.vercel.app";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isToolName(value: unknown): value is ToolName {
  return (
    typeof value === "string" &&
    [
      "cursor",
      "github_copilot",
      "claude",
      "chatgpt",
      "anthropic_api",
      "openai_api",
      "gemini",
      "windsurf",
    ].includes(value)
  );
}

function isUseCase(value: unknown): value is UseCase {
  return (
    typeof value === "string" &&
    ["coding", "writing", "data", "research", "mixed"].includes(value)
  );
}

function isToolInput(value: unknown): value is ToolInput {
  return (
    isRecord(value) &&
    isToolName(value.tool) &&
    typeof value.plan === "string" &&
    typeof value.seats === "number" &&
    typeof value.monthlySpend === "number"
  );
}

function isRecommendation(value: unknown): value is AuditRecommendation {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isToolName(value.tool) &&
    typeof value.currentSpend === "number" &&
    typeof value.recommendedAction === "string" &&
    typeof value.estimatedSaving === "number" &&
    typeof value.reason === "string" &&
    (value.recommendedPlan === undefined || typeof value.recommendedPlan === "string") &&
    (value.switchTo === undefined || isToolName(value.switchTo))
  );
}

function isAuditResult(value: unknown): value is AuditResult {
  if (!isRecord(value) || !isRecord(value.input) || !Array.isArray(value.recommendations)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.input.tools) &&
    value.input.tools.every(isToolInput) &&
    typeof value.input.teamSize === "number" &&
    isUseCase(value.input.useCase) &&
    typeof value.totalMonthlySaving === "number" &&
    typeof value.totalAnnualSaving === "number" &&
    (value.summary === undefined || typeof value.summary === "string") &&
    value.recommendations.every(isRecommendation)
  );
}

function isAuditRow(value: unknown): value is AuditRow {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.created_at === "string" &&
    typeof value.team_size === "number" &&
    typeof value.use_case === "string" &&
    (typeof value.total_monthly_saving === "number" ||
      typeof value.total_monthly_saving === "string") &&
    (typeof value.total_annual_saving === "number" ||
      typeof value.total_annual_saving === "string") &&
    (value.summary === null || typeof value.summary === "string")
  );
}

function decodeAuditResult(encodedData: string | string[] | undefined): AuditResult | null {
  const encodedValue = Array.isArray(encodedData) ? encodedData[0] : encodedData;

  if (!encodedValue) {
    return null;
  }

  try {
    const json = Buffer.from(encodedValue, "base64").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    return isAuditResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function mapAuditRowToResult(row: AuditRow): AuditResult | null {
  if (
    !Array.isArray(row.tools) ||
    !row.tools.every(isToolInput) ||
    !Array.isArray(row.recommendations) ||
    !row.recommendations.every(isRecommendation) ||
    !isUseCase(row.use_case)
  ) {
    return null;
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    input: {
      tools: row.tools,
      teamSize: row.team_size,
      useCase: row.use_case,
    },
    recommendations: row.recommendations,
    totalMonthlySaving: Number(row.total_monthly_saving),
    totalAnnualSaving: Number(row.total_annual_saving),
    summary: row.summary ?? undefined,
  };
}

async function fetchAuditResult(id: string): Promise<AuditResult | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("audits")
      .select(
        "id, created_at, team_size, use_case, tools, total_monthly_saving, total_annual_saving, recommendations, summary",
      )
      .eq("id", id)
      .single();

    if (error || !isAuditRow(data)) {
      return null;
    }

    return mapAuditRowToResult(data);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: ResultsPageProps): Promise<Metadata> {
  const decodedResult = decodeAuditResult(searchParams?.data);
  const monthlySaving = decodedResult?.totalMonthlySaving;
  const description =
    monthlySaving !== undefined
      ? `I found $${Math.round(monthlySaving).toLocaleString("en-US")}/month in AI tool savings.`
      : "Get your free AI spend audit at SpendLens.";

  return {
    title: "My AI Spend Audit - SpendLens",
    description,
    openGraph: {
      title: "My AI Spend Audit - SpendLens",
      description:
        monthlySaving !== undefined
          ? `${description} Get your free audit at SpendLens.`
          : "Get your free audit at SpendLens.",
      type: "website",
      url: `${SITE_URL}/results/${params.id}`,
    },
    twitter: {
      card: "summary",
      title: "My AI Spend Audit - SpendLens",
      description,
    },
  };
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const decodedResult = decodeAuditResult(searchParams?.data);
  const storedResult = decodedResult ? null : await fetchAuditResult(params.id);

  return <ResultsContent result={decodedResult ?? storedResult} />;
}
