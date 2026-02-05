"use client"

import { useState, useMemo } from "react"
import { Plus, BarChart3, Clock, CheckCircle2, ClipboardList } from "lucide-react"
import PageHeader from "../components/page-header"
import FilterPanel, { type FilterGroup } from "../components/filter-panel"
import StatCard from "../components/stat-card"
import DataTable, { type Column } from "../components/data-table"
import EmptyState from "../components/empty-state"
import { useStore } from "@/lib/use-store"
import type { AISurvey } from "@/lib/types"

/* ------------------------------------------------------------------ */
/*  Filters                                                           */
/* ------------------------------------------------------------------ */
const filterDefs: FilterGroup[] = [
  { key: "status", label: "Status", options: ["Completed", "In Progress", "Draft"] },
]

/* ------------------------------------------------------------------ */
/*  Columns                                                           */
/* ------------------------------------------------------------------ */
const columns: Column<Record<string, unknown>>[] = [
  { key: "name", label: "Survey" },
  { key: "topic", label: "Topic" },
  { key: "sent", label: "Sent To", sortValue: (row) => Number(row._sentCount ?? 0) },
  { key: "responses", label: "Responses", sortValue: (row) => Number(row._responseCount ?? 0) },
  { key: "avgNps", label: "Avg NPS", className: "text-right", sortValue: (row) => Number(row._nps ?? -1) },
  { key: "status", label: "Status", sortValue: (row) => String(row._status ?? "") },
]

/* ------------------------------------------------------------------ */
/*  Badge                                                             */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700",
    "in-progress": "bg-amber-50 text-amber-700",
    draft: "bg-muted text-muted-foreground",
  }
  const labels: Record<string, string> = {
    completed: "Completed",
    "in-progress": "In Progress",
    draft: "Draft",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function AiSurveysPage() {
  const { items: surveys } = useStore("surveys")

  // Filter state
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({ status: "" })
  const [search, setSearch] = useState("")

  // Stats
  const completedCount = surveys.filter((s) => s.status === "completed").length
  const inProgressCount = surveys.filter((s) => s.status === "in-progress").length
  const withNps = surveys.filter((s) => s.avgNps !== null)
  const avgNps =
    withNps.length > 0
      ? Math.round(withNps.reduce((s, sv) => s + (sv.avgNps ?? 0), 0) / withNps.length)
      : 0

  // Filtered
  const filtered = useMemo(() => {
    let list = [...surveys]

    if (activeFilters.status) {
      const statusMap: Record<string, string> = {
        Completed: "completed",
        "In Progress": "in-progress",
        Draft: "draft",
      }
      const val = statusMap[activeFilters.status] || activeFilters.status.toLowerCase()
      list = list.filter((s) => s.status === val)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.topic.toLowerCase().includes(q),
      )
    }

    return list
  }, [surveys, activeFilters, search])

  const rows = filtered.map((s: AISurvey) => ({
    name: s.name,
    topic: s.topic,
    sent: `${s.sentTo} experts`,
    _sentCount: s.sentTo,
    responses: `${s.responses} / ${s.sentTo}`,
    _responseCount: s.responses,
    avgNps: s.avgNps !== null ? s.avgNps : "--",
    _nps: s.avgNps ?? -1,
    status: <StatusBadge status={s.status} />,
    _status: s.status,
  }))

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="AI Surveys"
        description="Create AI-powered surveys, distribute to experts, and extract KPIs from aggregated responses."
        actions={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
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

      <div className="mt-4">
        <FilterPanel
          filters={filterDefs}
          activeFilters={activeFilters}
          onFilterChange={(key, value) =>
            setActiveFilters((prev) => ({ ...prev, [key]: value }))
          }
          onClearAll={() => {
            setActiveFilters({ status: "" })
            setSearch("")
          }}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search surveys..."
        />
      </div>

      <div className="mt-3">
        {surveys.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No surveys created"
            description="Create your first AI-powered survey to distribute to experts and collect structured insights."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            pageSize={10}
            emptyMessage="No surveys match the current filters."
          />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          KPI Extraction
        </h2>
        <EmptyState
          icon={BarChart3}
          title="AI KPI extraction coming soon"
          description="Select a completed survey to automatically extract key performance indicators, sentiment scores, and notable quotes."
        />
      </div>
    </div>
  )
}
