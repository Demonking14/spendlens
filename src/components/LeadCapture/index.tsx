"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

type LeadCaptureProps = {
  auditId: string;
  totalMonthlySaving: number;
  onComplete: (email: string) => void;
  onSkip: () => void;
};

const leadCaptureSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  companyName: z.string().optional(),
  role: z.string().optional(),
  website: z.string().optional(),
});

export function LeadCapture({
  auditId,
  totalMonthlySaving,
  onComplete,
  onSkip,
}: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validation = leadCaptureSchema.safeParse({
      email,
      companyName,
      role,
      website,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    if (validation.data.website) {
      onSkip();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          auditId,
          email: validation.data.email,
          companyName: validation.data.companyName,
          role: validation.data.role,
        }),
      });

      if (!response.ok) {
        throw new Error("Lead capture failed");
      }

      onComplete(validation.data.email);
    } catch {
      setError("Something went wrong, please try again");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Get your full report by email</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {totalMonthlySaving > 500
              ? "We'll also include how to claim Credex credits for your stack."
              : "We'll notify you when new savings apply to your tools."}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            aria-hidden="true"
            id="lead-website"
            name="website"
            style={{ display: "none" }}
            tabIndex={-1}
            type="text"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="lead-email">
              Email
            </label>
            <input
              className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-ring"
              id="lead-email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="lead-company">
              Company name
            </label>
            <input
              className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-ring"
              id="lead-company"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="lead-role">
              Role
            </label>
            <input
              className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-ring"
              id="lead-role"
              placeholder="e.g. CTO, Engineering Manager"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/40 border-t-background" />
                ) : null}
                {isSubmitting ? "Sending..." : "Send my report"}
              </span>
            </button>
            <button
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
              type="button"
              onClick={onSkip}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
