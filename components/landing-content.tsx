import Link from "next/link"
import {
  ArrowRight,
  Upload,
  Layers,
  Workflow,
  Search,
  AlertTriangle,
} from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "1. Ingest",
    description:
      "Upload or paste data from expert networks — emails, spreadsheets, web pages, transcripts.",
  },
  {
    icon: Layers,
    title: "2. Standardise",
    description:
      "Deduplicate, clean, and anonymise expert profiles into a consistent schema.",
  },
  {
    icon: Workflow,
    title: "3. Operate",
    description:
      "Shortlist experts, schedule calls, track spend and compliance clearance status.",
  },
  {
    icon: Search,
    title: "4. Retrieve",
    description:
      "Search experts and transcripts, extract KPIs and quotes for case work.",
  },
]

export function LandingContent() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Expert Network Operations Hub
        </h1>
        <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
          Standardise expert data, track calls and spend, and reduce admin
          overhead across your expert network workstreams.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Upload New Data
          </Link>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
              <step.icon className="h-4 w-4 text-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Prototype callout */}
      <div className="mt-16 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Prototype Constraints
            </h3>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
              <li>
                Data is stored in localStorage only — no server-side
                persistence.
              </li>
              <li>
                All expert data is synthetic — no real company information is
                included.
              </li>
              <li>
                This prototype demonstrates UX and workflow design, not
                production architecture.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
