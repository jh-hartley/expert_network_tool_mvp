"use client"

import { Phone } from "lucide-react"
import { FilterPanel } from "@/components/filter-panel"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"

const columns = [
  { key: "expert", label: "Expert" },
  { key: "company", label: "Company" },
  { key: "type", label: "Type" },
  { key: "date", label: "Date / Time" },
  { key: "status", label: "Status" },
  { key: "rate", label: "Rate" },
  { key: "cost", label: "Cost" },
  { key: "network", label: "Network" },
]

export function CallsContent() {
  return (
    <div className="mt-6 space-y-4">
      <FilterPanel
        filters={["All", "Scheduled", "Completed", "Cancelled", "This Week", "This Month"]}
      />
      <DataTable
        columns={columns}
        rows={[]}
        emptyMessage="No calls scheduled yet."
      />
      <EmptyState
        icon={Phone}
        title="No calls tracked"
        description="Schedule expert calls to start tracking costs, compliance, and transcript linkage."
        action={
          <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Schedule First Call
          </button>
        }
      />
    </div>
  )
}
