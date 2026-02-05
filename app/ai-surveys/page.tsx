"use client"

import { Plus, BarChart3, Clock, CheckCircle2 } from "lucide-react"
import PageHeader from "../components/page-header"
import StatCard from "../components/stat-card"
import DataTable from "../components/data-table"
import EmptyState from "../components/empty-state"
import { useStore } from "@/lib/use-store"
import type { AISurvey } from "@/lib/types"

const columns = [
  { key: "name", label: "Survey" },
  { key: "topic", label: "Topic" },
  { key: "sent", label: "Sent To" },
  { key: "responses", label: "Responses" },
  { key: "avgNps", label: "Avg NPS", className: "text-right" },
  { key: "status", label: "Status" },
]

function Badge({ label, variant }: { label: string; variant: "green" | "amber" | "muted" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    muted: "bg-muted text-muted-foreground",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: "green" | "amber" | "muted" }> = {
    completed: { label: "Completed", variant: "green" },
    "in-progress": { label: "In Progress", variant: "amber" },
    draft: { label: "Draft", variant: "muted" },
  }
  const m = map[status] ?? { label: status, variant: "muted" as const }
  return <Badge label={m.label} variant={m.variant} />
}

export default function AiSurveysPage() {
  const { items: surveys } = useStore("surveys")

  const completedCount = surveys.filter((s) => s.status === "completed").length
  const inProgressCount = surveys.filter((s) => s.status === "in-progress").length
  const withNps = surveys.filter((s) => s.avgNps !== null)
  const avgNps = withNps.length > 0
    ? Math.round(withNps.reduce((s, sv) => s + (sv.avgNps ?? 0), 0) / withNps.length)
    : 0

  const rows = surveys.map((s: AISurvey) => ({
    name: s.name,
    topic: s.topic,
    sent: `${s.sentTo} experts`,
    responses: `${s.responses} / ${s.sentTo}`,
    avgNps: s.avgNps !== null ? s.avgNps : "--",
    status: statusBadge(s.status),
  }))

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="AI Surveys"
        description="Create AI-powered surveys, distribute to experts, and extract KPIs from aggregated responses."
        actions={
          <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            New Survey
          </button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Completed" value={completedCount} changeType="positive" icon={CheckCircle2} />
        <StatCard label="In Progress" value={inProgressCount} change="awaiting responses" changeType="neutral" icon={Clock} />
        <StatCard label="Avg NPS" value={avgNps} change="across all surveys" changeType="positive" icon={BarChart3} />
      </div>

      <div className="mt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Surveys</h2>
        <DataTable columns={columns} rows={rows} />
      </div>

      <div className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">KPI Extraction</h2>
        <EmptyState
          icon={BarChart3}
          title="AI KPI extraction coming soon"
          description="Select a completed survey to automatically extract key performance indicators, sentiment scores, and notable quotes."
        />
      </div>
    </div>
  )
}
