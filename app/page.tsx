import Link from "next/link"
import {
  Compass,
  Upload,
  Layers,
  PhoneCall,
  Search,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"

const workflowSteps = [
  {
    step: 1,
    icon: Upload,
    title: "Ingest",
    description:
      "Upload or paste expert data from networks, emails, spreadsheets, and transcripts.",
  },
  {
    step: 2,
    icon: Layers,
    title: "Standardise",
    description:
      "Deduplicate, clean, anonymise, and normalise profiles into a consistent schema.",
  },
  {
    step: 3,
    icon: PhoneCall,
    title: "Operate",
    description:
      "Shortlist experts, schedule calls, track spend, and manage compliance clearance.",
  },
  {
    step: 4,
    icon: Search,
    title: "Retrieve",
    description:
      "Search experts and transcripts, extract KPIs and quotes with AI-powered tools.",
  },
]

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Compass className="h-8 w-8 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Expert Network Workflow Manager
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
          Helmsman
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Standardise expert data, track calls and spend, and reduce admin
          overhead. One hub to replace manual Excel and email workflows.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/upload"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Upload New Data
          </Link>
        </div>
      </div>

      {/* 4-step workflow */}
      <div className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map(({ step, icon: Icon, title, description }) => (
            <div
              key={step}
              className="relative flex flex-col gap-3 rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {step}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Prototype constraints callout */}
      <div className="mb-16 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Prototype constraints
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            This is a demonstration prototype. No real database -- placeholder
            content only. No production data is required. The focus is on UX
            workflow and information architecture.
          </p>
        </div>
      </div>

      {/* Roadmap checklist */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">
          What this prototype demonstrates
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            "Upload / paste expert data",
            "Standardise + dedupe profiles",
            "Track calls and spend",
            "Clearance / conflict workflow (status-only)",
            "AI survey KPI extraction (mock)",
            "Search experts / transcripts (filters + NL query, mock)",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-muted/50" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
