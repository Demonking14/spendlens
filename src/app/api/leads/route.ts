import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const leadSchema = z.object({
  auditId: z.string().uuid(),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
});

type AuditEmailRow = {
  id: string;
  total_monthly_saving: number | string;
  total_annual_saving: number | string;
  is_high_savings: boolean | null;
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

function hasHoneypotValue(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuditEmailRow(value: unknown): value is AuditEmailRow {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (typeof value.total_monthly_saving === "number" ||
      typeof value.total_monthly_saving === "string") &&
    (typeof value.total_annual_saving === "number" ||
      typeof value.total_annual_saving === "string") &&
    (typeof value.is_high_savings === "boolean" || value.is_high_savings === null)
  );
}

function formatCurrency(value: number | string): string {
  return Math.round(Number(value)).toLocaleString("en-US");
}

function buildAuditUrl(request: Request, auditId: string): string {
  const origin =
    request.headers.get("origin") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return new URL(`/results/${auditId}`, origin).toString();
}

function buildEmailHtml(audit: AuditEmailRow, auditUrl: string): string {
  const highSavingsSection = audit.is_high_savings
    ? `<div style="margin-top:24px;padding:16px;border-radius:8px;background:#eef2ff;color:#312e81;">
        <strong>Your team qualifies for a Credex consultation.</strong>
        <p style="margin:8px 0 0;">Reply to this email or visit credex.rocks to book a free call.</p>
      </div>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="font-size:28px;margin:0 0 16px;">Your AI Spend Audit</h1>
      <p>Here's a summary of what we found:</p>
      <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">
        <p style="margin:0;">Monthly savings: <strong>$${formatCurrency(audit.total_monthly_saving)}</strong></p>
        <p style="margin:8px 0 0;">Annual savings: <strong>$${formatCurrency(audit.total_annual_saving)}</strong></p>
      </div>
      ${highSavingsSection}
      <p style="margin-top:24px;">
        <a href="${auditUrl}" style="color:#4f46e5;font-weight:700;text-decoration:none;">View your full audit &rarr;</a>
      </p>
      <p style="margin-top:32px;color:#6b7280;font-size:13px;">SpendLens is a free tool by Credex</p>
    </div>
  `;
}

function logServerError(message: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error);
  }
}

async function sendAuditEmail(email: string, audit: AuditEmailRow, auditUrl: string): Promise<void> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      logServerError("RESEND_API_KEY is not set", new Error("Missing RESEND_API_KEY"));
      return;
    }

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "SpendLens <audit@yourdomain.com>",
      to: email,
      subject: "Your AI spend audit is ready",
      html: buildEmailHtml(audit, auditUrl),
    });
  } catch (error) {
    logServerError("Failed to send audit email with Resend", error);
  }
}

export async function POST(request: Request) {
  try {
    cleanupExpiredRateLimits();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (isRecord(body) && hasHoneypotValue(body.website)) {
      return NextResponse.json({ success: true });
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";

    if (isRateLimited(ipAddress)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const validation = leadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { auditId, email, companyName, role } = validation.data;
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("audits")
      .update({
        email,
        company_name: companyName ?? null,
        role: role ?? null,
      })
      .eq("id", auditId)
      .select("id, total_monthly_saving, total_annual_saving, is_high_savings")
      .single();

    if (error || !isAuditEmailRow(data)) {
      logServerError("Failed to update audit lead details in Supabase", error);
      return NextResponse.json({ error: "Unable to save lead" }, { status: 500 });
    }

    await sendAuditEmail(email, data, buildAuditUrl(request, auditId));

    return NextResponse.json({ success: true });
  } catch (error) {
    logServerError("Unhandled leads route error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
