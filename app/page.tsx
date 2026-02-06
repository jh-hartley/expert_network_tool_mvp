"use client"

import Link from "next/link"
import {
  TriangleAlert,
  ArrowRight,
  Upload,
  Sparkles,
  Building2,
  Users,
  Phone,
  ShieldCheck,
  Brain,
  FileBarChart,
  Search as SearchIcon,
  Database,
  CheckCircle2,
  Circle,
  ArrowDown,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Pipeline stages -- ordered exactly as a workstream would flow      */
/* ------------------------------------------------------------------ */

const pipeline: {
  stage: number
  title: string
  subtitle: string
  icon: React.ElementType
  capabilities: string[]
  href?: string
}[] = [
  {
    stage: 1,
    title: "Ingest & Standardise",
    subtitle: "Upload raw expert data; let AI clean and unify it",
    icon: Upload,
    href: "/upload",
    capabilities: [
      "CSV / bulk upload from any expert network",
      "AI-driven parsing of unstructured profiles and screening responses",
      "Cross-network field standardisation and deduplication",
      "Auto-removal of target-company mentions in PEG contexts",
      "First-pass transcript sanitisation before client sharing",
    ],
  },
  {
    stage: 2,
    title: "Enrich & Classify",
    subtitle: "Augment profiles with external reference data",
    icon: Building2,
    capabilities: [
      "Company descriptions and industry classification via D&B / Hoovers",
      "FTE estimates and firmographic context",
      "Normalised titles, roles, and company references",
      "Reduced manual lookups -- consistent context for shortlisting",
    ],
  },
  {
    stage: 3,
    title: "Track & Shortlist",
    subtitle: "Single deduplicated tracker across all networks",
    icon: Users,
    href: "/experts",
    capabilities: [
      "Live lifecycle tracking: Recommended, Contacted, Shortlisted, Scheduled, Completed, Cancelled",
      "In-platform shortlisting with autofilled expert details",
      "Supervisor-ready sharing -- no more copy-paste across Excel, email, and slides",
    ],
  },
  {
    stage: 4,
    title: "Compliance & Clearance",
    subtitle: "Catch conflicts early; automate CID clearance",
    icon: ShieldCheck,
    capabilities: [
      "Cross-check against client advisors, BEN advisors, and do-not-contact lists",
      "Recency checks for former employees to flag current-competitor risk",
      "CID integration for auto-filed clearance forms",
      "Boilerplate rationale defined once at project start; client head approves / declines",
      "Expert remains flagged as conflicted until approval is granted",
      "Full audit trail of clearance decisions",
    ],
  },
  {
    stage: 5,
    title: "Calls & Spend",
    subtitle: "Live call tracker and dynamic spend roll-ups",
    icon: Phone,
    href: "/calls",
    capabilities: [
      "Auto-populated call trackers from stored expert data",
      "Dynamic spend roll-up: scheduled, completed, cancelled, forecast",
      "End-of-day summaries, upcoming-call digests, and avoided-cost reporting",
      "Status updates triggered by time and outcomes",
    ],
  },
  {
    stage: 6,
    title: "AI Interviews & Transcripts",
    subtitle: "Administrative AI support for interview workstreams",
    icon: Brain,
    href: "/ai-surveys",
    capabilities: [
      "Separate workspace for AI interview KPIs and billing",
      "LLM extraction of NPS-style measures and key quotations",
      "Neutral summaries for faster human synthesis",
      "Anonymised titles for safe external sharing",
      "Keyword search and filtered context windows",
    ],
  },
  {
    stage: 7,
    title: "Search & Discovery",
    subtitle: "Natural-language queries powered by vector similarity",
    icon: SearchIcon,
    href: "/search",
    capabilities: [
      "Embedded expert descriptions with context vectors",
      "Miniature RAG model for semantic similarity search",
      "Natural-language queries across experts and quotations",
      "Faceted results by network, industry, compliance status, and more",
    ],
  },
  {
    stage: 8,
    title: "Reconciliation & Reporting",
    subtitle: "Clean close-out and network settlement",
    icon: FileBarChart,
    capabilities: [
      "Structured summary tables for network reconciliation",
      "Cost verification with clear audit trail",
      "Expert-usage reporting to reduce end-of-project back-and-forth",
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Required data inputs                                               */
/* ------------------------------------------------------------------ */

const dataInputs = [
  "Unstructured expert profile data from networks",
  "BEN advisor details and advisors flagged for fraud by Compliance",
  "Call transcripts (human and AI interviews)",
  "External reference data (e.g. FTEs, industry classification)",
  "CID connection to support auto-filing clearance forms and marking companies / experts as safe to contact",
]

/* ------------------------------------------------------------------ */
/*  Prototype status                                                   */
/* ------------------------------------------------------------------ */

const status: { done: boolean; text: string }[] = [
  { done: true, text: "App shell, navigation, and Bain design system" },
  { done: true, text: "TypeScript data model and localStorage CRUD layer" },
  { done: true, text: "CSV upload with deduplication" },
  { done: true, text: "Data tables with sort, filter, column hiding, and pagination" },
  { done: true, text: "Settings: export / import JSON, reset data" },
  { done: false, text: "AI-powered profile parsing and enrichment" },
  { done: false, text: "Compliance cross-checks and CID clearance workflow" },
  { done: false, text: "Vector-embedded search and RAG queries" },
  { done: false, text: "LLM transcript extraction and summarisation" },
  { done: false, text: "End-of-project reconciliation tables" },
]

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Submission broken banner */}
      <div className="mb-8 rounded-lg border-2 border-red-300 bg-red-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
            <TriangleAlert className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900">
              Note: the data upload feature is currently broken
            </p>
            <p className="mt-1 text-sm leading-relaxed text-red-700">
              I{"'"}m debugging an issue with the file upload pipeline and
              working to fix it ASAP. Everything else in the demo should work
              as expected.
            </p>
          </div>
        </div>
      </div>

      {/* Hackathon banner */}
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Hackathon prototype
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
            Browser-only demo with synthetic seed data. No server persistence or
            production data.
          </p>
        </div>
      </div>

      {/* Hero */}
      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">
          Helmsman
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The end-to-end operating system for expert network workstreams --
          replacing fragmented spreadsheets, email chains, and manual processes
          with a single, intelligent platform.
        </p>
      </section>

      {/* Value propositions -- 4 columns */}
      <section className="mb-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1 -- Reduced Admin */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Reduced Typing & Admin
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Eliminate manual data entry, copy-paste, and tracker maintenance
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                AI-driven parsing and auto-populated fields
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Focus on expert selection, not spreadsheet wrangling
              </li>
            </ul>
          </div>

          {/* 2 -- Increased Coverage */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Increased Expert Coverage
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Review and shortlist more experts in the same time window
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Standardised profiles and smart filtering
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Broader coverage without compromising quality
              </li>
            </ul>
          </div>

          {/* 3 -- Automated Outputs */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <FileBarChart className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Automated Reporting
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Budgeting and spend tracking via a live dashboard
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Export ready-to-send email digests and team updates
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                KPI extraction and auto-anonymised transcripts
              </li>
            </ul>
          </div>

          {/* 4 -- Unified Interface */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Unified Interface
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                One platform connecting Bain{"'"}s existing tools
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                CID clearance, network portals, and compliance lists
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Firmographic data -- industry, FTE counts, company descriptions
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="mb-14">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          End-to-End Pipeline
        </h2>

        <div className="flex flex-col gap-0">
          {pipeline.map((step, i) => {
            const Icon = step.icon
            const isLast = i === pipeline.length - 1
            return (
              <div key={step.stage}>
                {/* Stage card */}
                <div className="group relative rounded-lg border border-border bg-card">
                  <div className="flex gap-4 p-5">
                    {/* Number + icon column */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground/60">
                        {String(step.stage).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {step.title}
                        </h3>
                        {step.href && (
                          <Link
                            href={step.href}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            Open
                            <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.subtitle}
                      </p>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {step.capabilities.map((cap, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80"
                          >
                            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Connector arrow between stages */}
                {!isLast && (
                  <div className="flex justify-center py-1.5">
                    <ArrowDown className="h-3.5 w-3.5 text-border" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Required data inputs */}
      <section className="mb-14">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Required Input Data
        </h2>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3 mb-4">
            <Database className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              For full end-state functionality, Helmsman requires the following
              data sources to be connected or uploaded.
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 pl-7">
            {dataInputs.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
              >
                <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Prototype progress */}
      <section className="mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Prototype Progress
        </h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {status.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
              )}
              <span
                className={[
                  "text-sm",
                  item.done ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
