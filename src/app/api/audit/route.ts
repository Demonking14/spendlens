import { NextResponse } from "next/server";
import { z } from "zod";
import { generateSummary } from "@/lib/anthropic/summary";
import { runAudit } from "@/lib/audit-engine";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AuditInput, AuditRecommendation, AuditResult } from "@/types/audit";

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const HIGH_SAVINGS_THRESHOLD = 500;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const toolNameSchema = z.enum([
  "cursor",
  "github_copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "windsurf",
]);

const useCaseSchema = z.enum(["coding", "writing", "data", "research", "mixed"]);

const auditInputSchema = z.object({
  tools: z
    .array(
      z.object({
        tool: toolNameSchema,
        plan: z.string().min(1),
        seats: z.number().int().min(1),
        monthlySpend: z.number().min(0),
      }),
    )
    .min(1),
  teamSize: z.number().int().min(1).max(500),
  useCase: useCaseSchema,
});

type AuditInsertRow = {
  id: string;
  created_at: string;
};

function isRateLimited(ipAddress: string): boolean {
  const now = Date.now();
  const currentRecord = rateLimitStore.get(ipAddress);

  if (!currentRecord || currentRecord.resetAt <= now) {
    rateLimitStore.set(ipAddress, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (currentRecord.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  currentRecord.count += 1;
  return false;
}

function cleanupExpiredRateLimits(): void {
  const now = Date.now();

  for (const [ipAddress, data] of Array.from(rateLimitStore.entries())) {
    if (now > data.resetAt) {
      rateLimitStore.delete(ipAddress);
    }
  }
}

function isAuditInsertRow(value: unknown): value is AuditInsertRow {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { created_at?: unknown }).created_at === "string"
  );
}

function logServerError(message: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error);
  }
}

async function insertAudit(
  input: AuditInput,
  recommendations: AuditRecommendation[],
  totalMonthlySaving: number,
  totalAnnualSaving: number,
): Promise<AuditInsertRow | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("audits")
      .insert({
        team_size: input.teamSize,
        use_case: input.useCase,
        tools: input.tools,
        total_monthly_saving: totalMonthlySaving,
        total_annual_saving: totalAnnualSaving,
        recommendations,
        summary: null,
        is_high_savings: totalMonthlySaving > HIGH_SAVINGS_THRESHOLD,
      })
      .select("id, created_at")
      .single();

    if (error) {
      logServerError("Failed to save audit to Supabase", error);
      return null;
    }

    return isAuditInsertRow(data) ? data : null;
  } catch (error) {
    logServerError("Failed to save audit to Supabase", error);
    return null;
  }
}

async function updateAuditSummary(auditId: string, summary: string): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("audits").update({ summary }).eq("id", auditId);

    if (error) {
      logServerError("Failed to update audit summary in Supabase", error);
    }
  } catch (error) {
    logServerError("Failed to update audit summary in Supabase", error);
  }
}

export async function POST(request: Request) {
  try {
    cleanupExpiredRateLimits();

    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid input", details: "Malformed JSON body" },
        { status: 400 },
      );
    }

    const validation = auditInputSchema.safeParse(requestBody);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 },
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";

    if (isRateLimited(ipAddress)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const input: AuditInput = validation.data;
    const auditResult = runAudit(input);
    const insertedAudit = await insertAudit(
      input,
      auditResult.recommendations,
      auditResult.totalMonthlySaving,
      auditResult.totalAnnualSaving,
    );
    const generatedId = insertedAudit?.id ?? crypto.randomUUID();
    const createdAt = insertedAudit?.created_at ?? new Date().toISOString();
    const resultForSummary: AuditResult = {
      id: generatedId,
      createdAt,
      ...auditResult,
    };
    const summary = await generateSummary(resultForSummary);

    if (insertedAudit) {
      await updateAuditSummary(insertedAudit.id, summary);
    }

    const finalResult: AuditResult = {
      id: generatedId,
      createdAt,
      summary,
      ...auditResult,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    logServerError("Unhandled audit route error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
