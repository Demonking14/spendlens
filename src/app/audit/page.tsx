import { AuditForm } from "@/components/AuditForm";

// AuditPage renders the spend input form for the first user workflow.
export default function AuditPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Audit your AI spend
        </h1>
        <p className="text-base text-muted-foreground">
          Find out where you&apos;re overpaying in 2 minutes.
        </p>
      </div>
      <AuditForm />
    </main>
  );
}
