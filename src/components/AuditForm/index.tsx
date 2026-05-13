"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { TOOLS_CONFIG } from "@/lib/audit-engine/rules";
import type { AuditInput, AuditResult, ToolInput, ToolName, UseCase } from "@/types/audit";

const STORAGE_KEY = "spendlens_audit_input";

const TOOL_NAMES = [
  "cursor",
  "github_copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "windsurf",
] as const satisfies readonly ToolName[];

const USE_CASES = ["coding", "writing", "data", "research", "mixed"] as const satisfies readonly UseCase[];

const DEFAULT_INPUT: AuditInput = {
  teamSize: 1,
  useCase: "coding",
  tools: [],
};

type ToolFieldErrors = Partial<Record<"seats" | "monthlySpend", string>>;

type FormErrors = {
  teamSize?: string;
  tools?: string;
  toolErrors: Partial<Record<ToolName, ToolFieldErrors>>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isToolName(value: unknown): value is ToolName {
  return typeof value === "string" && TOOL_NAMES.includes(value as ToolName);
}

function isUseCase(value: unknown): value is UseCase {
  return typeof value === "string" && USE_CASES.includes(value as UseCase);
}

function isToolInput(value: unknown): value is ToolInput {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isToolName(value.tool) &&
    typeof value.plan === "string" &&
    typeof value.seats === "number" &&
    typeof value.monthlySpend === "number"
  );
}

function isAuditInput(value: unknown): value is AuditInput {
  if (!isRecord(value) || !Array.isArray(value.tools)) {
    return false;
  }

  return (
    typeof value.teamSize === "number" &&
    isUseCase(value.useCase) &&
    value.tools.every(isToolInput)
  );
}

function readSavedInput(): AuditInput {
  try {
    const savedInput = window.localStorage.getItem(STORAGE_KEY);

    if (!savedInput) {
      return DEFAULT_INPUT;
    }

    const parsedInput: unknown = JSON.parse(savedInput);
    return isAuditInput(parsedInput) ? parsedInput : DEFAULT_INPUT;
  } catch {
    return DEFAULT_INPUT;
  }
}

function validateForm(input: AuditInput): FormErrors {
  const toolErrors: FormErrors["toolErrors"] = {};
  const errors: FormErrors = { toolErrors };

  if (input.teamSize < 1 || input.teamSize > 500) {
    errors.teamSize = "Team size must be between 1 and 500.";
  }

  if (input.tools.length === 0) {
    errors.tools = "Select at least one tool.";
  }

  input.tools.forEach((toolInput) => {
    const currentToolErrors: ToolFieldErrors = {};

    if (toolInput.seats < 1) {
      currentToolErrors.seats = "Seats must be at least 1.";
    }

    if (toolInput.monthlySpend < 0) {
      currentToolErrors.monthlySpend = "Monthly spend must be $0 or more.";
    }

    if (Object.keys(currentToolErrors).length > 0) {
      toolErrors[toolInput.tool] = currentToolErrors;
    }
  });

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return (
    Boolean(errors.teamSize || errors.tools) ||
    Object.values(errors.toolErrors).some((toolError) =>
      Boolean(toolError?.seats || toolError?.monthlySpend),
    )
  );
}

function encodeAuditResult(result: AuditResult): string {
  return btoa(JSON.stringify(result));
}

export function AuditForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<AuditInput>(DEFAULT_INPUT);
  const [submitError, setSubmitError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormState(readSavedInput());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // Some browsers can block localStorage; the form still works without persistence.
    }
  }, [formState]);

  const validationErrors = useMemo(() => validateForm(formState), [formState]);
  const formHasErrors = hasErrors(validationErrors);

  function updateTeamSize(teamSize: number) {
    setFormState((currentState) => ({ ...currentState, teamSize }));
  }

  function updateUseCase(useCase: UseCase) {
    setFormState((currentState) => ({ ...currentState, useCase }));
  }

  function toggleTool(tool: ToolName, checked: boolean) {
    setFormState((currentState) => {
      if (!checked) {
        return {
          ...currentState,
          tools: currentState.tools.filter((toolInput) => toolInput.tool !== tool),
        };
      }

      if (currentState.tools.some((toolInput) => toolInput.tool === tool)) {
        return currentState;
      }

      const firstPlan = Object.keys(TOOLS_CONFIG[tool].plans)[0] ?? "";

      return {
        ...currentState,
        tools: [
          ...currentState.tools,
          {
            tool,
            plan: firstPlan,
            seats: 1,
            monthlySpend: 0,
          },
        ],
      };
    });
  }

  function updateTool(tool: ToolName, updates: Partial<Omit<ToolInput, "tool">>) {
    setFormState((currentState) => ({
      ...currentState,
      tools: currentState.tools.map((toolInput) =>
        toolInput.tool === tool ? { ...toolInput, ...updates } : toolInput,
      ),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formHasErrors) {
      setSubmitError("Please fix the errors above");
      return;
    }

    setSubmitError("");
    setRequestError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Audit request failed");
      }

      const result = (await response.json()) as AuditResult;
      const encodedResult = encodeURIComponent(encodeAuditResult(result));
      router.push(`/results/${result.id}?data=${encodedResult}`);
    } catch {
      setRequestError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {submitError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Team info</h2>
          <p className="text-sm text-muted-foreground">Tell us who is using AI tools today.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="team-size">
              Team size
            </label>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              id="team-size"
              max={500}
              min={1}
              type="number"
              value={formState.teamSize}
              onChange={(event) => updateTeamSize(Number(event.target.value))}
            />
            {validationErrors.teamSize ? (
              <span className="block text-sm text-red-600">{validationErrors.teamSize}</span>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="use-case">
              Primary use case
            </label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              id="use-case"
              value={formState.useCase}
              onChange={(event) => updateUseCase(event.target.value as UseCase)}
            >
              {USE_CASES.map((useCase) => (
                <option key={useCase} value={useCase}>
                  {useCase}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Tool rows</h2>
          <p className="text-sm text-muted-foreground">Select every AI tool your team pays for.</p>
          {validationErrors.tools ? (
            <span className="mt-2 block text-sm text-red-600">{validationErrors.tools}</span>
          ) : null}
        </div>

        <div className="space-y-4">
          {TOOL_NAMES.map((tool) => {
            const toolConfig = TOOLS_CONFIG[tool];
            const selectedTool = formState.tools.find((toolInput) => toolInput.tool === tool);
            const toolErrors = validationErrors.toolErrors[tool];

            return (
              <div key={tool} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-foreground">{toolConfig.displayName}</span>
                  <label className="flex items-center gap-2 text-sm text-foreground" htmlFor={`${tool}-enabled`}>
                    <input
                      checked={Boolean(selectedTool)}
                      className="h-4 w-4 rounded border-border"
                      id={`${tool}-enabled`}
                      type="checkbox"
                      onChange={(event) => toggleTool(tool, event.target.checked)}
                    />
                    We use this tool
                  </label>
                </div>

                {selectedTool ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground" htmlFor={`${tool}-plan`}>
                        Plan
                      </label>
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                        id={`${tool}-plan`}
                        value={selectedTool.plan}
                        onChange={(event) => updateTool(tool, { plan: event.target.value })}
                      >
                        {Object.entries(toolConfig.plans).map(([planKey, planConfig]) => (
                          <option key={planKey} value={planKey}>
                            {planConfig.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground" htmlFor={`${tool}-seats`}>
                        Seats
                      </label>
                      <input
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                        id={`${tool}-seats`}
                        min={1}
                        type="number"
                        value={selectedTool.seats}
                        onChange={(event) => updateTool(tool, { seats: Number(event.target.value) })}
                      />
                      {toolErrors?.seats ? (
                        <span className="block text-sm text-red-600">{toolErrors.seats}</span>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground" htmlFor={`${tool}-monthly-spend`}>
                        Monthly spend $
                      </label>
                      <input
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                        id={`${tool}-monthly-spend`}
                        min={0}
                        type="number"
                        value={selectedTool.monthlySpend}
                        onChange={(event) =>
                          updateTool(tool, { monthlySpend: Number(event.target.value) })
                        }
                      />
                      {toolErrors?.monthlySpend ? (
                        <span className="block text-sm text-red-600">
                          {toolErrors.monthlySpend}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={formHasErrors || isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/40 border-t-background" />
        ) : null}
        {isSubmitting ? "Analyzing your stack..." : "Run my audit"}
      </button>
      {requestError ? <p className="text-sm text-red-600">{requestError}</p> : null}
    </form>
  );
}
