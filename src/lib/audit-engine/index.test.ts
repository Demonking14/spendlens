import { describe, expect, it } from "vitest";
import type { AuditInput } from "@/types/audit";

// Audit engine tests will cover validation and savings behavior as logic is added.
describe("audit engine input shape", () => {
  it("should treat a form with no tools selected as invalid", () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: "coding",
      tools: [],
    };

    const isValid = input.tools.length > 0;

    expect(input.tools).toHaveLength(0);
    expect(isValid).toBe(false);
  });
});
