import Link from "next/link"
import {
  Compass,
  LayoutDashboard,
  Upload,
  Users,
  Phone,
  ClipboardList,
  Search,
  Settings,
  AlertTriangle,
} from "lucide-react"

const features = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "High-level metrics and project status at a glance.",
  },
  {
    label: "Upload",
    href: "/upload",
    icon: Upload,
    description: "Ingest call transcripts, expert bios, and project briefs.",
  },
  {
    label: "Experts",
    href: "/experts",
    icon: Users,
    description: "Browse and manage expert profiles and compliance data.",
  },
  {
    label: "Calls",
    href: "/calls",
    icon: Phone,
    description: "Track scheduled and completed expert calls.",
  },
  {
    label: "AI Surveys",
    href: "/ai-surveys",
    icon: ClipboardList,
    description: "AI-powered survey creation and response analysis.",
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
    description: "Semantic search across transcripts and expert data.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure project parameters and integrations.",
  },
]

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hackathon banner */}
      <div className="mb-10 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Hackathon prototype scaffold
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            No production data &mdash; no persistence &mdash; demo only
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            Helmsman
          </h1>
        </div>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground text-pretty">
          Expert Network Ops Hub &mdash; streamline expert calls, transcripts,
          surveys, and compliance in one unified workspace.
        </p>
      </div>

      {/* Roadmap checklist */}
      <div className="mb-12 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">
          What this prototype will demonstrate next
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
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
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ label, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                {label}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
