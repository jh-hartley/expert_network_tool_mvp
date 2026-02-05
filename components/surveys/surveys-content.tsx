"use client"

import { ClipboardList } from "lucide-react"
import { FilterPanel } from "@/components/filter-panel"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"

const columns = [
  { key: "company", label: "Company" },
  { key: "respondent", label: "Respondent Type" },
  { key: "date", label: "Date" },
  { key: "kpis", label: "KPI Fields" },
  { key: "status", label: "Status" },
  { key: "linked", label: "Linked Expert/Call" },
]

export function SurveysContent() {
  return (
    <div className="mt-6 space-y-4">
      <FilterPanel
        filters={["All", "Complete", "In Progress", "Pending Review"]}
      />
      <DataTable
        columns={columns}
        rows={[]}
        emptyMessage="No AI surveys created yet."
      />
      <EmptyState
        icon={ClipboardList}
        title="No AI surveys"
        description="Create surveys to collect structured KPI data from expert interactions and transcripts."
        action={
          <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Create First Survey
          </button>
        }
      />
    </div>
  )
}
