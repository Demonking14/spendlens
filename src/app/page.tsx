import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Stop overpaying for AI tools
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Get a free audit of your AI tool spend in 2 minutes.
        </p>
        <Link
          className="mt-8 inline-flex rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
          href="/audit"
        >
          Audit my stack &rarr;
        </Link>
      </section>
    </main>
  );
}
