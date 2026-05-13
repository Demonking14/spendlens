"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LeadCapture } from "@/components/LeadCapture";
import { TOOLS_CONFIG } from "@/lib/audit-engine/rules";
import type { AuditResult, ToolName } from "@/types/audit";

type ResultsContentProps = {
  result: AuditResult | null;
};

function formatCurrency(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function getToolDisplayName(tool: ToolName): string {
  return TOOLS_CONFIG[tool]?.displayName ?? tool;
}

export function ResultsContent({ result }: ResultsContentProps) {
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadSuccessMessage, setLeadSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) {
      return undefined;
    }

    const timer = window.setTimeout(() => setShowLeadCapture(true), 3000);
    return () => window.clearTimeout(timer);
  }, [result]);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!result) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Audit result unavailable</h1>
        <p className="mt-3 text-muted-foreground">
          This results link is missing audit data. Run a new audit to generate a shareable result.
        </p>
        <Link
          className="mt-6 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background"
          href="/audit"
        >
          Run a new audit
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {leadSuccessMessage ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {leadSuccessMessage}
          </div>
        ) : null}

        {result.totalMonthlySaving === 0 ? (
          <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Audit result</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              You&apos;re spending efficiently on AI tools
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We did not identify meaningful monthly savings from your current tool mix.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Monthly savings</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-green-600 sm:text-6xl">
                ${formatCurrency(result.totalMonthlySaving)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Annual savings</p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-green-600 sm:text-6xl">
                ${formatCurrency(result.totalAnnualSaving)}
              </p>
            </div>
          </section>
        )}

        {result.summary ? (
          <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Your personalized audit</p>
            <blockquote className="mt-3 border-l-4 border-green-500 pl-4 text-lg leading-8 text-foreground">
              {result.summary}
            </blockquote>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Per tool breakdown</h2>
          <div className="grid gap-4">
            {result.recommendations.map((recommendation, index) => (
              <article
                className="rounded-lg border border-border bg-white p-5 shadow-sm"
                key={`${recommendation.tool}-${recommendation.recommendedAction}-${index}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {getToolDisplayName(recommendation.tool)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Current monthly spend: ${formatCurrency(recommendation.currentSpend)}
                    </p>
                  </div>
                  {recommendation.switchTo ? (
                    <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      Consider switching to: {getToolDisplayName(recommendation.switchTo)}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 font-semibold text-foreground">{recommendation.recommendedAction}</p>
                <p
                  className={`mt-2 text-sm font-medium ${
                    recommendation.estimatedSaving > 0 ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  Estimated saving: ${formatCurrency(recommendation.estimatedSaving)}/month
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{recommendation.reason}</p>
              </article>
            ))}
          </div>
        </section>

        {result.totalMonthlySaving > 500 ? (
          <section className="rounded-xl bg-indigo-700 p-6 text-white shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold">You could save even more with Credex</h2>
            <p className="mt-3 max-w-3xl text-indigo-50">
              Credex sells discounted AI credits from companies that overforecast. Your team
              qualifies for a free consultation.
            </p>
            <a
              className="mt-6 inline-flex rounded-md bg-white px-5 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
              href="https://credex.rocks"
            >
              Book a free consultation &rarr;
            </a>
          </section>
        ) : null}

        {result.totalMonthlySaving < 100 ? (
          <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              You&apos;re spending efficiently. Want to be notified when new optimizations apply to
              your stack?
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="low-savings-email">
                Email address
              </label>
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-ring"
                id="low-savings-email"
                placeholder="you@company.com"
                type="email"
              />
              <button
                className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
                type="button"
              >
                Notify me
              </button>
            </div>
          </section>
        ) : null}

        <div className="flex justify-center sm:justify-start">
          <button
            aria-label="Share audit results"
            className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-gray-50"
            type="button"
            onClick={handleShare}
          >
            {copied ? "Link copied!" : "Share this audit \u2192"}
          </button>
        </div>
      </div>

      {showLeadCapture ? (
        <LeadCapture
          auditId={result.id}
          totalMonthlySaving={result.totalMonthlySaving}
          onComplete={() => {
            setShowLeadCapture(false);
            setLeadSuccessMessage("Report sent! Check your inbox.");
          }}
          onSkip={() => setShowLeadCapture(false)}
        />
      ) : null}
    </main>
  );
}
