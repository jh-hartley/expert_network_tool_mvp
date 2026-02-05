"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import DataTable from "../components/data-table"
import { useStore } from "@/lib/use-store"
import type { Expert } from "@/lib/types"

const filters = [
  { label: "Status", options: ["Cleared", "Pending", "Blocked"] },
  { label: "Network", options: ["GLG", "AlphaSights", "Third Bridge", "Guidepoint", "Direct"] },
  { label: "Industry", options: ["Technology", "Healthcare", "Energy", "Finance", "Consumer"] },
]

const columns = [
  { key: "name", label: "Name" },
  { key: "title", label: "Title / Role" },
  { key: "industry", label: "Industry" },
  { key: "network", label: "Network" },
  { key: "status", label: "Status" },
  { key: "calls", label: "Calls", className: "text-right" },
]

function Badge({ label, variant }: { label: string; variant: "green" | "red" | "amber" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

const PAGE_SIZE = 10

function complianceBadge(status: string) {
  const map: Record<string, { label: string; variant: "green" | "red" | "amber" }> = {
    cleared: { label: "Cleared", variant: "green" },
    blocked: { label: "Blocked", variant: "red" },
    pending: { label: "Pending", variant: "amber" },
  }
  const m = map[status] ?? map.pending
  return <Badge label={m.label} variant={m.variant} />
}

export default function ExpertsPage() {
  const { items: experts } = useStore("experts")
  const [page, setPage] = useState(0)

  // Sort newest first
  const sorted = [...experts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageExperts = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const rows = pageExperts.map((e: Expert) => ({
    name: e.name,
    title: `${e.title}, ${e.company}`,
    industry: e.industry,
    network: e.network,
    status: complianceBadge(e.compliance),
    calls: e.callCount,
  }))

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Experts"
        description="Browse and manage expert profiles, qualifications, and compliance status."
        actions={
          <Link
            href="/upload"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Experts
          </Link>
        }
      />

      <div className="mt-4">
        <FilterPanel filters={filters} searchPlaceholder="Search by name, role, or industry..." />
      </div>

      <div className="mt-3">
        <DataTable columns={columns} rows={rows} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Showing {page * PAGE_SIZE + 1}--{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} experts
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-7 rounded-md border border-border bg-card px-2.5 text-[11px] text-muted-foreground disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-7 rounded-md border border-border bg-card px-2.5 text-[11px] text-foreground hover:bg-accent disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
