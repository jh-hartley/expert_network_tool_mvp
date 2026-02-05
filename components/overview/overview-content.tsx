import Link from "next/link"
import {
  ArrowRight,
  Upload,
  Layers,
  Workflow,
  Search,
  LayoutDashboard,
  Users,
  Phone,
  ClipboardList,
  Settings,
  AlertTriangle,
} from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Ingest",
    description:
      "Upload or paste data from expert networks -- emails, spreadsheets, web pages, transcripts. Multiple format support.",
  },
  {
    number: "02",
    icon: Layers,
    title: "Standardise",
    description:
      "Deduplicate, clean, and anonymise expert profiles into a consistent schema. Auto-detect conflicts.",
  },
  {
    number: "03",
    icon: Workflow,
    title: "Operate",
    description:
      "Shortlist experts, schedule calls, track spend, and manage compliance clearance status across workstreams.",
  },
  {
    number: "04",
    icon: Search,
    title: "Retrieve",
    description:
      "Search experts and transcripts, extract KPIs, surface quotes, and prepare retrieval sets for analysis.",
  },
]

const modules = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Operations at a glance -- stats, spend, recent activity.",
    href: "/dashboard",
  },
  {
    icon: Upload,
    title: "Upload",
    description: "Ingest expert profiles, transcripts, and survey data.",
    href: "/upload",
  },
  {
    icon: Users,
    title: "Experts",
    description: "Searchable expert database with compliance tracking.",
    href: "/experts",
  },
  {
    icon: Phone,
    title: "Calls",
    description: "Schedule, track, and manage expert call details.",
    href: "/calls",
  },
  {
    icon: ClipboardList,
    title: "AI Surveys",
    description: "Manage survey responses and extracted KPI data.",
    href: "/ai-surveys",
  },
  {
    icon: Search,
    title: "Search",
    description: "Query experts and transcripts with structured or natural language.",
    href: "/search",
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Case setup, anonymisation, and data management.",
    href: "/settings",
  },
]

export function OverviewContent() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-4">
        <div className="max-w-2xl">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Expert Network Workflow Manager
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base md:leading-relaxed">
            Helmsman standardises expert data from multiple networks, tracks calls and
            spend, manages compliance workflows, and provides structured retrieval
            for analysis -- reducing admin overhead across your expert network
            workstreams.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Upload Data
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow steps */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          End-to-End Workflow
        </h2>
        <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tabular-nums text-muted-foreground/60">
                  {step.number}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                  <step.icon className="h-3.5 w-3.5 text-foreground" />
                </div>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Module directory */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Modules
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-muted-foreground/30"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary transition-colors group-hover:bg-muted">
                <mod.icon className="h-3.5 w-3.5 text-foreground" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-foreground">
                {mod.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {mod.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Prototype notice */}
      <section className="pb-4">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              Prototype Notice
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This is a workflow prototype demonstrating UX patterns and information
              architecture for expert network operations. All data shown is placeholder
              content -- no real client or expert information is included.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
