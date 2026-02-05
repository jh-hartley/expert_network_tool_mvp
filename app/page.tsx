"use client"

import Link from "next/link"
import {
  TriangleAlert,
  LayoutDashboard,
  Upload,
  Users,
  Phone,
  ClipboardList,
  Search,
  Settings,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react"

const navCards = [
  { href: "/dashboard", label: "Dashboard", desc: "Metrics and activity feed", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", desc: "Import expert lists via CSV", icon: Upload },
  { href: "/experts", label: "Experts", desc: "Browse and manage experts", icon: Users },
  { href: "/calls", label: "Calls", desc: "Schedule and track calls", icon: Phone },
  { href: "/ai-surveys", label: "AI Surveys", desc: "Automated post-call surveys", icon: ClipboardList },
  { href: "/search", label: "Search", desc: "Find experts across all data", icon: Search },
  { href: "/settings", label: "Settings", desc: "Export, import, and reset data", icon: Settings },
]

const checklist = [
  { done: true, text: "App shell with top navigation and routing" },
  { done: true, text: "Bain-friendly design system (typography, spacing, palette)" },
  { done: true, text: "Reusable components: PageHeader, StatCard, DataTable, FilterPanel, EmptyState, Modal, Toast" },
  { done: true, text: "TypeScript data model (Expert, Call, Transcript, AISurvey, ComplianceStatus)" },
  { done: true, text: "localStorage CRUD layer with seed data" },
  { done: true, text: "CSV upload with duplicate detection" },
  { done: true, text: "Data tables with sorting, filtering, column visibility, and pagination" },
  { done: true, text: "Settings: export / import JSON, reset all data" },
  { done: false, text: "Call scheduling workflow" },
  { done: false, text: "Transcript viewer and AI summarisation" },
  { done: false, text: "AI-powered survey generation" },
  { done: false, text: "Global search with faceted results" },
]

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Hackathon banner */}
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">Hackathon prototype</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
            Browser-only demo with synthetic seed data. No server persistence or production data.
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Helmsman
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-xl">
          Expert network management for Bain case teams. Source, schedule, track,
          and analyse expert calls from a single workspace.
        </p>
      </div>

      {/* Quick-access grid */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Quick Access
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </div>
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* Demo checklist */}
      <section className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          What This Prototype Demonstrates
        </h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
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
