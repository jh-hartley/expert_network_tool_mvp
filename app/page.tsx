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
    desc: "Upload or paste expert data from networks, emails, spreadsheets, and transcripts.",
  },
  {
    step: 2,
    icon: Layers,
    title: "Standardise",
    desc: "Deduplicate, clean, anonymise, and normalise profiles into a consistent schema.",
  },
  {
    step: 3,
    icon: PhoneCall,
    title: "Operate",
    desc: "Shortlist experts, schedule calls, track spend, and manage compliance clearance.",
  },
  {
    step: 4,
    icon: Search,
    title: "Retrieve",
    desc: "Search experts and transcripts. Extract KPIs and quotes with AI-powered tools.",
  },
]

const checklist = [
  "Upload / paste expert data",
  "Standardise + dedupe profiles",
  "Track calls and spend",
  "Clearance / conflict workflow (status-only)",
  "AI survey KPI extraction (mock)",
  "Search experts / transcripts (filters + NL query, mock)",
]

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="h-5 w-5 text-primary" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Expert Network Workflow Manager
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Helmsman
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Standardise expert data, track calls and spend, and reduce admin
          overhead. One hub to replace manual Excel and email workflows.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Overview
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/upload"
            className="inline-flex h-9 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Upload Data
          </Link>
        </div>
      </div>

      {/* Workflow */}
      <section className="mb-16">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          How it works
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map(({ step, icon: Icon, title, desc }) => (
            <div
              key={step}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {step}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Prototype notice */}
      <section className="mb-10 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Prototype constraints
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            Demonstration prototype with placeholder content only. No production
            data required. Focus is on UX workflow and information architecture.
          </p>
        </div>
      </section>

      {/* Checklist */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          What this prototype demonstrates
        </h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {checklist.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-[13px] text-muted-foreground"
            >
              <span className="flex h-3.5 w-3.5 shrink-0 rounded-sm border border-border" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
