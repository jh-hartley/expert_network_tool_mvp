"use client"

import Link from "next/link"
import { ScrollReveal } from "./components/scroll-reveal"
import {
  TriangleAlert,
  ArrowRight,
  Upload,
  Sparkles,
  Building2,
  Heart,
  Users,
  Phone,
  ShieldCheck,
  Brain,
  FileBarChart,
  Search as SearchIcon,
  Database,
  Clock,
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
  accent?: string
}[] = [
  {
    stage: 1,
    title: "Ingest & Standardise",
    subtitle:
      "Replace manual re-keying of network emails with AI-driven parsing into a single database.",
    icon: Upload,
    accent: "text-primary",
    capabilities: [
      "Bulk upload via CSV, email paste, or direct network integration",
      "AI parses unstructured profiles and screening responses automatically",
      "Deduplication and field standardisation across networks",
      "Central database auto-fills every downstream step",
    ],
  },
  {
    stage: 2,
    title: "Review Experts",
    subtitle:
      "Card-based triage flow -- shortlist, discard, or defer one expert at a time.",
    icon: Heart,
    capabilities: [
      "One-click or keyboard shortcut decisions on each profile",
      "Full detail per card: background, screener answers, compliance flags, pricing",
      "FIFO ordering so new uploads are reviewed first",
      "Decisions sync to the expert database and carry downstream",
    ],
  },
  {
    stage: 3,
    title: "Track & Shortlist",
    subtitle:
      "Unified expert table -- the single source of truth for the project.",
    icon: Users,
    capabilities: [
      "Lens-based views: Customer / Competitor / Target",
      "Natural-language search with LLM-powered ranking",
      "Toggle between external experts and BAN advisors",
      "Inline CID clearance requests and compliance flag visibility",
    ],
  },
  {
    stage: 4,
    title: "Calls & Spend",
    subtitle:
      "Self-managing call tracker with live budget roll-ups and forecast spend.",
    icon: Phone,
    capabilities: [
      "Auto-populated call details from the central expert database",
      "Live spend tracking: scheduled, completed, cancelled, forecast",
      "End-of-day summaries and upcoming-call email digests",
      "Avoided-cost reporting by outcome",
    ],
  },
  {
    stage: 5,
    title: "Enrich & Classify",
    subtitle:
      "Auto-enrich profiles with data you would otherwise look up manually.",
    icon: Building2,
    capabilities: [
      "GenAI-generated anonymised titles for client-safe sharing",
      "Company industry, FTE counts, and descriptions from BI tools",
      "Current vs. former employee classification with departure-date checks",
      "Normalised roles, companies, and seniority levels",
    ],
  },
  {
    stage: 6,
    title: "Compliance & Clearance",
    subtitle:
      "Automated cross-checks and CID clearance to prevent compliance errors.",
    icon: ShieldCheck,
    capabilities: [
      "Cross-check against client advisors, BAN advisors, and do-not-contact lists",
      "Flag or block profiles before calls are booked",
      "CID clearance at company or individual level with audit trail",
      "Auto-populate CID request forms -- defined once, reused per request",
    ],
  },
  {
    stage: 7,
    title: "Transcripts & KPI Extraction",
    subtitle:
      "Centralised transcript storage with AI-generated summaries and KPI extraction.",
    icon: Brain,
    capabilities: [
      "Auto-generated summaries to quickly locate relevant transcripts",
      "KPI extraction into the call tracker (e.g. NPS scores)",
      "Flag text that may need anonymising before client sharing",
      "Standardised file naming and separate AI-interview billing",
    ],
  },
  {
    stage: 8,
    title: "Search & Discovery",
    subtitle:
      "Query your expert database and transcripts in natural language.",
    icon: SearchIcon,
    capabilities: [
      "Expert search: filters + natural-language queries for fast triage",
      "Transcript search: filter by type/company, then query for supporting quotes",
      "Eliminates re-uploading transcripts into ChatGPT per question",
      "Future: link quotes back to source locations for cross-checking",
    ],
  },
  {
    stage: 9,
    title: "Reconciliation & Reporting",
    subtitle:
      "Clean close-out with structured exports and network settlement.",
    icon: FileBarChart,
    capabilities: [
      "Structured summary tables for network reconciliation",
      "Cost verification with audit trail",
      "End-of-day email summaries -- formatted and ready to send",
      "All tables exportable in layouts ready for email or slides",
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Required data inputs                                               */
/* ------------------------------------------------------------------ */

const dataInputBuckets: {
  label: string
  tag: string
  tagColor: string
  accentColor: string
  description: string
  items: string[]
}[] = [
  {
    label: "Readily available",
    tag: "Ready now",
    tagColor: "bg-emerald-100 text-emerald-800",
    accentColor: "bg-emerald-500",
    description: "Data the team already has to hand for every workstream.",
    items: [
      "Unstructured expert profile data from networks (email paste or CSV export)",
      "Call transcripts (human and AI interviews)",
      "Client advisor lists uploaded per project for compliance cross-checks",
    ],
  },
  {
    label: "Internal setup required",
    tag: "Internal",
    tagColor: "bg-amber-100 text-amber-800",
    accentColor: "bg-amber-500",
    description:
      "Sourced from within Bain; needs integration or one-time upload.",
    items: [
      "BAN advisor details and advisors flagged for fraud by Compliance",
      "CID connection for auto-filing clearance forms and marking companies / experts as safe to contact",
    ],
  },
  {
    label: "Third-party integrations",
    tag: "Future",
    tagColor: "bg-sky-100 text-sky-800",
    accentColor: "bg-sky-500",
    description:
      "External services that unlock full automation; the trickiest to implement.",
    items: [
      "Direct expert network API feeds to auto-populate the tracker (removing the manual data ingestion step entirely)",
      "Business intelligence platforms (e.g. D&B Hoovers, Gain.pro) for company industry, FTE counts, and descriptions",
    ],
  },
]



export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Hackathon banner */}
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Hackathon prototype
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
            Browser-only demo with synthetic seed data. Data is persisted in
            your browser via localStorage -- a server-side database is not
            permitted by company policy. Changes (screening decisions, notes, new
            uploads) survive page reloads but will be lost if you clear
            site data.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  TRY IT NOW -- prominent CTA                                   */}
      {/* ============================================================ */}
      <div className="mb-10 rounded-xl border-2 border-primary/20 bg-primary/[0.03] px-6 py-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Try it now
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Walk through a realistic DD scenario end-to-end -- from uploading
              unstructured expert data through to anonymised sources slides and
              budget reconciliation. Pre-loaded seed data means you can start
              clicking immediately.
            </p>
          </div>
          <Link
            href="/demo"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Launch Interactive Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 1 -- Hero + Value Propositions                        */}
      {/* ============================================================ */}
      <section className="mb-16">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Consensus
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          One platform replacing the spreadsheets, email chains, and manual
          processes that slow down expert network workstreams.
        </p>

        {/* Section heading */}
        <h2 className="mt-10 text-lg font-semibold tracking-tight text-foreground">
          Why It Matters
        </h2>

        {/* Problem statement */}
        <div className="mt-3 rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                The Problem
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Expert networks are critical to PE due diligence -- but the execution is dominated by busywork.
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-500/50" />
                  Multiple networks, each reporting in a different format -- all re-keyed by hand into trackers
                </li>
                <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-500/50" />
                  Compliance checks, CID requests, and do-not-contact lists managed manually across tools
                </li>
                <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-500/50" />
                  On tight-timeline cases, admin directly competes with the analytical work that drives insight
                </li>
                <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-amber-500/50" />
                  Every manual step is a point of failure: missed checks, duplicated experts, stale trackers
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Segue */}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Consensus cuts out the busywork with an end-to-end unified process --
          GenAI parses messy, non-uniform network data into a single schema, and
          every downstream step auto-populates from it:
        </p>

        {/* Four solution boxes */}
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1 -- AI Ingestion */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              AI-Powered Ingestion
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              GenAI extracts structured data from messy, non-uniform network formats.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Copy-paste emails, page grabs, or CSVs from any network into the upload portal
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                All structuring, deduplication, and collation is handled automatically
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Unified schema across every network -- no more re-keying into trackers
              </li>
            </ul>
          </div>

          {/* 2 -- More Coverage, Less Time */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              More Coverage, Less Time
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Free up hours spent on admin so you can review more experts and synthesise better insights.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Triage more candidates in the same time window
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Standardised profiles and smart filtering across all networks
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Time back goes to profile review and insight synthesis, not data entry
              </li>
            </ul>
          </div>

          {/* 3 -- Compliance Safety Net */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Built-In Compliance Checks
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              A system of checks that reduces the risk of compliance mistakes.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                CID warnings surface in the call tracker if an expert is not cleared
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Automatic cross-checks against do-not-contact and client advisor lists
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Audit trail for every clearance decision -- nothing lost in email threads
              </li>
            </ul>
          </div>

          {/* 4 -- Automated Outputs */}
          <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-primary/15">
              <FileBarChart className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Automated Reporting
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Live dashboards and export-ready outputs, not manual formatting.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                Real-time budget roll-ups, spend tracking, and forecast
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                End-of-day summaries and email digests ready to send
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                All tables exportable in formats ready for slides or email
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DIVIDER                                                       */}
      {/* ============================================================ */}
      <div className="mb-16 border-t border-border" />

      {/* ============================================================ */}
      {/*  SECTION 2 -- Pipeline ("How it works")                       */}
      {/* ============================================================ */}
      <section className="mb-16">
        <div className="mb-10 flex items-end gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Pipeline
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                How it works
              </h2>
              <Link
                href="/demo"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/15 transition-colors hover:bg-primary/15"
              >
                Demo
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Nine stages from raw network data to project close-out.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

          {pipeline.map((step, i) => {
            const Icon = step.icon
            return (
              <ScrollReveal key={step.stage} delay={i * 60}>
                <div className="relative flex gap-5 pb-10 last:pb-0">
                  {/* Timeline node */}
                  <div className="relative z-10 flex shrink-0 flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm">
                      {step.stage}
                    </span>
                  </div>

                  {/* Content card */}
                  <div className="group flex-1 rounded-lg border border-border bg-card transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
                    <div className="flex items-center gap-2.5 px-5 py-3.5">
                      <Icon className="h-4 w-4 shrink-0 text-primary/60" />
                      <h3 className="text-sm font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>

                    <div className="border-t border-border px-5 py-4">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {step.subtitle}
                      </p>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {step.capabilities.map((cap, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80"
                          >
                            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DIVIDER                                                       */}
      {/* ============================================================ */}
      <div className="mb-16 border-t border-border" />

      {/* ============================================================ */}
      {/*  SECTION 3 -- Data Requirements + Prototype Progress           */}
      {/* ============================================================ */}
      <section className="mb-16">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
          Requirements
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Required Input Data
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Data sources grouped by availability and implementation effort.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {dataInputBuckets.map((bucket, i) => (
            <div
              key={i}
              className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* Accent top bar */}
              <div className={`h-1 w-full ${bucket.accentColor}`} />

              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {bucket.label}
                  </h3>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${bucket.tagColor}`}
                  >
                    {bucket.tag}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {bucket.description}
                </p>
              </div>

              <div className="border-t border-border" />

              <ul className="flex flex-1 flex-col gap-2.5 px-5 py-4">
                {bucket.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/80"
                  >
                    <span
                      className={`mt-2 block h-1.5 w-1.5 shrink-0 rounded-full ${bucket.accentColor}`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      
    </div>
  )
}
