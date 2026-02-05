"use client"

import { useState, useMemo } from "react"
import { Phone, Plus, PhoneOff, Clock, DollarSign } from "lucide-react"
import PageHeader from "../components/page-header"
import FilterPanel, { type FilterGroup } from "../components/filter-panel"
import DataTable, { type Column } from "../components/data-table"
import StatCard from "../components/stat-card"
import EmptyState from "../components/empty-state"
import { useStore } from "@/lib/use-store"
import type { Call } from "@/lib/types"

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatCost(cents: number) {
  return cents === 0
    ? "$0"
    : `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

/* ------------------------------------------------------------------ */
/*  Filters                                                           */
/* ------------------------------------------------------------------ */
const filterDefs: FilterGroup[] = [
  { key: "status", label: "Status", options: ["Scheduled", "Completed", "Cancelled", "No-show"] },
  { key: "project", label: "Project", options: ["Project Alpha", "Project Beta", "Project Gamma"] },
]

/* ------------------------------------------------------------------ */
/*  Columns                                                           */
/* ------------------------------------------------------------------ */
const columns: Column<Record<string, unknown>>[] = [
  { key: "expert", label: "Expert" },
  { key: "date", label: "Date", sortValue: (row) => String(row._dateISO ?? "") },
  { key: "duration", label: "Duration", sortValue: (row) => Number(row._durationMin ?? 0) },
  { key: "project", label: "Project" },
  { key: "status", label: "Status", sortValue: (row) => String(row._status ?? "") },
  { key: "cost", label: "Cost", className: "text-right", sortValue: (row) => Number(row._costCents ?? 0) },
  { key: "notes", label: "Notes", defaultHidden: true },
]

/* ------------------------------------------------------------------ */
/*  Badges                                                            */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700",
    scheduled: "bg-blue-50 text-blue-700",
    cancelled: "bg-red-50 text-red-700",
    "no-show": "bg-amber-50 text-amber-700",
  }
  const label = status === "no-show" ? "No-show" : status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status] || styles.scheduled}`}>
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function CallsPage() {
  const { items: calls } = useStore("calls")

  // Filter state
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    status: "",
    project: "",
  })
  const [search, setSearch] = useState("")

  // Stats
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const weekCalls = calls.filter((c) => c.date >= oneWeekAgo)
  const completedWeek = weekCalls.filter((c) => c.status === "completed")
  const cancelledWeek = weekCalls.filter((c) => c.status === "cancelled")
  const avgDuration =
    completedWeek.length > 0
      ? Math.round(completedWeek.reduce((s, c) => s + c.duration, 0) / completedWeek.length)
      : 0
  const totalSpend = calls
    .filter((c) => {
      const d = new Date(c.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.status === "completed"
    })
    .reduce((s, c) => s + c.cost, 0)

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = [...calls]

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (activeFilters.status) {
      const val = activeFilters.status.toLowerCase()
      list = list.filter((c) => c.status === val)
    }
    if (activeFilters.project) {
      list = list.filter((c) => c.project === activeFilters.project)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.expertName.toLowerCase().includes(q) ||
          c.project.toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q)),
      )
    }

    return list
  }, [calls, activeFilters, search])

  const rows = filtered.map((c: Call) => ({
    expert: c.expertName,
    date: formatDate(c.date),
    _dateISO: c.date,
    duration: c.duration > 0 ? `${c.duration} min` : "--",
    _durationMin: c.duration,
    project: c.project,
    status: <StatusBadge status={c.status} />,
    _status: c.status,
    cost: formatCost(c.cost),
    _costCents: c.cost,
    notes: c.notes || "--",
  }))

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Calls"
        description="Track scheduled and completed expert calls, manage follow-ups, and monitor spend."
        actions={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Schedule Call
          </button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This Week" value={weekCalls.length} change={`${completedWeek.length} completed`} changeType="positive" icon={Phone} />
        <StatCard label="Cancelled" value={cancelledWeek.length} changeType={cancelledWeek.length > 0 ? "negative" : "neutral"} icon={PhoneOff} />
        <StatCard label="Avg Duration" value={`${avgDuration} min`} icon={Clock} />
        <StatCard label="Total Spend" value={formatCost(totalSpend)} change="this month" changeType="neutral" icon={DollarSign} />
      </div>

      <div className="mt-4">
        <FilterPanel
          filters={filterDefs}
          activeFilters={activeFilters}
          onFilterChange={(key, value) =>
            setActiveFilters((prev) => ({ ...prev, [key]: value }))
          }
          onClearAll={() => {
            setActiveFilters({ status: "", project: "" })
            setSearch("")
          }}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by expert or project..."
        />
      </div>

      <div className="mt-3">
        {calls.length === 0 ? (
          <EmptyState
            icon={Phone}
            title="No calls recorded"
            description="Calls will appear here once experts have been contacted."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            pageSize={10}
            emptyMessage="No calls match the current filters."
          />
        )}
      </div>

      {filtered.length > 0 && filtered.length !== calls.length && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {calls.length} calls
        </p>
      )}
    </div>
  )
}
