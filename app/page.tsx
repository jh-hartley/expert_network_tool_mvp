import {
  Compass,
  Upload,
  Users,
  Phone,
  Shield,
  ClipboardList,
  Search,
  ArrowRight,
  TriangleAlert,
} from "lucide-react"
import Link from "next/link"

const checklist = [
  { done: true, text: "Upload / paste expert data" },
  { done: true, text: "Standardise + dedupe profiles" },
  { done: true, text: "Track calls and spend" },
  { done: true, text: "Clearance / conflict workflow (status-only)" },
  { done: false, text: "AI survey KPI extraction (mock)" },
  { done: false, text: "Search experts / transcripts (filters + NL query, mock)" },
]

const quickLinks = [
  { label: "Overview", href: "/dashboard", icon: Compass, description: "High-level metrics and activity" },
  { label: "Upload", href: "/upload", icon: Upload, description: "Import expert profiles from CSV" },
  { label: "Experts", href: "/experts", icon: Users, description: "Browse, filter, and sort profiles" },
  { label: "Calls", href: "/calls", icon: Phone, description: "Schedule, track, and review calls" },
  { label: "Compliance", href: "/experts", icon: Shield, description: "Clearance workflow and status" },
  { label: "AI Surveys", href: "/ai-surveys", icon: ClipboardList, description: "Distribute and analyse surveys" },
  { label: "Search", href: "/search", icon: Search, description: "Full-text search across all data" },
]

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Hackathon banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Hackathon prototype scaffold
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
            No production data. No server persistence. Browser-only demo with synthetic seed data.
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Helmsman
            </h1>
            <p className="text-sm text-muted-foreground">
              Expert Network Ops Hub
            </p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Centralise expert network management across GLG, AlphaSights, Third Bridge, and Guidepoint.
          Upload profiles, track calls, manage compliance, and run AI-powered surveys -- all in one place.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Overview
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/upload"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Upload Experts
          </Link>
        </div>
      </div>

      {/* Quick-access grid */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Quick Access
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-accent">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{link.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Demo checklist */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          What This Prototype Demonstrates
        </h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <ul className="flex flex-col gap-2">
            {checklist.map((item) => (
              <li key={item.text} className="flex items-center gap-2.5">
                <span
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    item.done
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {item.done ? "\u2713" : "\u2013"}
                </span>
                <span
                  className={[
                    "text-sm",
                    item.done ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
