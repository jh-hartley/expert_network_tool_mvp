"use client"

import { Users } from "lucide-react"
import { FilterPanel } from "@/components/filter-panel"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"

const columns = [
  { key: "name", label: "Name" },
  { key: "network", label: "Network" },
  { key: "company", label: "Company" },
  { key: "title", label: "Title" },
  { key: "segment", label: "Segment" },
  { key: "status", label: "Status" },
  { key: "risk", label: "Risk Flag" },
]

export function ExpertsContent() {
  return (
    <div className="mt-6 space-y-4">
      <FilterPanel
        filters={["All", "Network", "Segment", "Status", "Conflict Flag", "Date Added"]}
      />
      <DataTable
        columns={columns}
        rows={[]}
        emptyMessage="No experts added yet. Upload expert data or add experts manually."
      />
      <EmptyState
        icon={Users}
        title="No experts in database"
        description="Upload expert profiles from your networks, or add experts manually to start building your database."
        action={
          <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Upload Expert Data
          </button>
        }
      />
    </div>
  )
}
