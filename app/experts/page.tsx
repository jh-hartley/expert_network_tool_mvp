"use client"

import { useState, useMemo } from "react"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import WipBanner from "../components/wip-banner"
import FilterPanel, { type FilterGroup } from "../components/filter-panel"
import DataTable, { type Column } from "../components/data-table"
import EmptyState from "../components/empty-state"
import { useStore } from "@/lib/use-store"
import type { Expert } from "@/lib/types"

/* ------------------------------------------------------------------ */
/*  Filters                                                           */
/* ------------------------------------------------------------------ */
const filterDefs: FilterGroup[] = [
  { key: "compliance", label: "Status", options: ["Cleared", "Pending", "Blocked"] },
  { key: "network", label: "Network", options: ["GLG", "AlphaSights", "Third Bridge", "Guidepoint", "Direct"] },
  { key: "industry", label: "Industry", options: ["Technology", "Healthcare", "Energy", "Finance", "Consumer"] },
]

/* ------------------------------------------------------------------ */
/*  Columns                                                           */
/* ------------------------------------------------------------------ */
const columns: Column<Record<string, unknown>>[] = [
  { key: "name", label: "Name" },
  { key: "title", label: "Title / Role" },
  { key: "industry", label: "Industry" },
  { key: "network", label: "Network" },
  { key: "status", label: "Status", sortValue: (row) => String(row._compliance ?? "") },
  { key: "calls", label: "Calls", className: "text-right" },
  { key: "tags", label: "Tags", defaultHidden: true },
]

/* ------------------------------------------------------------------ */
/*  Badge                                                             */
/* ------------------------------------------------------------------ */
function ComplianceBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    cleared: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    blocked: "bg-red-50 text-red-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function ExpertsPage() {
  const { items: experts } = useStore("experts")

  // Filter state
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    compliance: "",
    network: "",
    industry: "",
  })
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let list = [...experts]

    // Sort newest first by default
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (activeFilters.compliance) {
      list = list.filter((e) => e.compliance === activeFilters.compliance.toLowerCase())
    }
    if (activeFilters.network) {
      list = list.filter((e) => e.network === activeFilters.network)
    }
    if (activeFilters.industry) {
      list = list.filter((e) => e.industry === activeFilters.industry)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.company.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    return list
  }, [experts, activeFilters, search])

  const rows = filtered.map((e: Expert) => ({
    name: e.name,
    title: `${e.title}, ${e.company}`,
    industry: e.industry,
    network: e.network,
    status: <ComplianceBadge status={e.compliance} />,
    _compliance: e.compliance, // hidden sort value
    calls: e.callCount,
    tags: e.tags.join(", "),
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
      <WipBanner feature="experts" />

      <div className="mt-4">
        <FilterPanel
          filters={filterDefs}
          activeFilters={activeFilters}
          onFilterChange={(key, value) =>
            setActiveFilters((prev) => ({ ...prev, [key]: value }))
          }
          onClearAll={() => {
            setActiveFilters({ compliance: "", network: "", industry: "" })
            setSearch("")
          }}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, role, or tag..."
        />
      </div>

      <div className="mt-3">
        {experts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No experts yet"
            description="Upload a CSV file to get started with your expert network."
            actionLabel="Upload Experts"
            actionHref="/upload"
          />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            pageSize={10}
            emptyMessage="No experts match the current filters."
          />
        )}
      </div>

      {filtered.length > 0 && filtered.length !== experts.length && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {experts.length} experts
        </p>
      )}
    </div>
  )
}
