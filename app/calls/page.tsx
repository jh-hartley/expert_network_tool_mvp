"use client"

import { Phone, Plus, PhoneOff, Clock, DollarSign } from "lucide-react"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import DataTable from "../components/data-table"
import StatCard from "../components/stat-card"
import { useStore } from "@/lib/use-store"
import type { Call } from "@/lib/types"

const filters = [
  { label: "Status", options: ["Scheduled", "Completed", "Cancelled", "No-show"] },
  { label: "Project", options: ["Project Alpha", "Project Beta", "Project Gamma"] },
]

const columns = [
  { key: "expert", label: "Expert" },
  { key: "date", label: "Date" },
  { key: "duration", label: "Duration" },
  { key: "project", label: "Project" },
  { key: "status", label: "Status" },
  { key: "cost", label: "Cost", className: "text-right" },
]

function Badge({ label, variant }: { label: string; variant: "green" | "blue" | "red" | "amber" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: "green" | "blue" | "red" | "amber" }> = {
    completed: { label: "Completed", variant: "green" },
    scheduled: { label: "Scheduled", variant: "blue" },
    cancelled: { label: "Cancelled", variant: "red" },
    "no-show": { label: "No-show", variant: "amber" },
  }
  const m = map[status] ?? { label: status, variant: "amber" as const }
  return <Badge label={m.label} variant={m.variant} />
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatCost(cents: number) {
  return cents === 0 ? "$0" : `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export default function CallsPage() {
  const { items: calls } = useStore("calls")

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const weekCalls = calls.filter((c) => c.date >= oneWeekAgo)
  const completedWeek = weekCalls.filter((c) => c.status === "completed")
  const cancelledWeek = weekCalls.filter((c) => c.status === "cancelled")
  const avgDuration = completedWeek.length > 0
    ? Math.round(completedWeek.reduce((s, c) => s + c.duration, 0) / completedWeek.length)
    : 0
  const totalSpend = calls.filter((c) => {
    const d = new Date(c.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.status === "completed"
  }).reduce((s, c) => s + c.cost, 0)

  // Sort by date descending
  const sorted = [...calls].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const rows = sorted.map((c: Call) => ({
    expert: c.expertName,
    date: formatDate(c.date),
    duration: c.duration > 0 ? `${c.duration} min` : "--",
    project: c.project,
    status: statusBadge(c.status),
    cost: formatCost(c.cost),
  }))

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Calls"
        description="Track scheduled and completed expert calls, manage follow-ups, and monitor spend."
        actions={
          <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
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
        <FilterPanel filters={filters} searchPlaceholder="Search calls..." />
      </div>

      <div className="mt-3">
        <DataTable columns={columns} rows={rows} />
      </div>
    </div>
  )
}
