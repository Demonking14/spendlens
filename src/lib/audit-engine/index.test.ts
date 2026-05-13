import { describe, expect, it } from "vitest";
import { runAudit } from "./index";
import type { AuditInput } from "@/types/audit";

describe("runAudit", () => {
  it("returns zero savings for an empty tools array", () => {
    const input: AuditInput = { tools: [], teamSize: 5, useCase: "coding" };

    const result = runAudit(input);

    expect(result.totalMonthlySaving).toBe(0);
    expect(result.totalAnnualSaving).toBe(0);
  });

  it("downgrades Cursor Business with 3 seats to Pro", () => {
    const input: AuditInput = {
      teamSize: 3,
      useCase: "coding",
      tools: [{ tool: "cursor", plan: "business", seats: 3, monthlySpend: 120 }],
    };

    const [recommendation] = runAudit(input).recommendations;

    expect(recommendation.estimatedSaving).toBe(60);
    expect(recommendation.recommendedPlan).toBe("pro");
  });

  it("downgrades Claude Team with 3 seats to Pro", () => {
    const input: AuditInput = {
      teamSize: 3,
      useCase: "mixed",
      tools: [{ tool: "claude", plan: "team", seats: 3, monthlySpend: 90 }],
    };

    const [recommendation] = runAudit(input).recommendations;

    expect(recommendation.estimatedSaving).toBe(30);
    expect(recommendation.recommendedPlan).toBe("pro");
  });

  it("downgrades GitHub Copilot Enterprise with 5 seats to Business", () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: "coding",
      tools: [{ tool: "github_copilot", plan: "enterprise", seats: 5, monthlySpend: 195 }],
    };

    const [recommendation] = runAudit(input).recommendations;

    expect(recommendation.estimatedSaving).toBe(100);
  });

  it("returns no saving for an already optimal plan", () => {
    const input: AuditInput = {
      teamSize: 2,
      useCase: "coding",
      tools: [{ tool: "cursor", plan: "pro", seats: 2, monthlySpend: 40 }],
    };

    const [recommendation] = runAudit(input).recommendations;

    expect(recommendation.estimatedSaving).toBe(0);
    expect(recommendation.recommendedAction).toBe("No action needed");
  });

  it("flags overpaying when spend is much higher than plan price", () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: "mixed",
      tools: [{ tool: "claude", plan: "pro", seats: 1, monthlySpend: 50 }],
    };

    const [recommendation] = runAudit(input).recommendations;

    expect(recommendation.recommendedAction).toBe("You may be on add-ons or overages");
    expect(recommendation.estimatedSaving).toBe(30);
  });

  it("recommends action for API direct users spending over $500", () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: "mixed",
      tools: [{ tool: "anthropic_api", plan: "usage_based", seats: 1, monthlySpend: 600 }],
    };

    const [recommendation] = runAudit(input).recommendations;

    expect(recommendation.recommendedAction).not.toBe("No action needed");
  });
});
