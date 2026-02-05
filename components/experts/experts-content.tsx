"use client"

import { Users } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

export function ExpertsContent() {
  return (
    <div className="space-y-6">
      {/* Filters bar placeholder */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Filters:
        </span>
        {["Network", "Segment", "Status", "Conflict Flag", "Date Added"].map(
          (f) => (
            <span
              key={f}
              className="rounded-md bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
            >
              {f}
            </span>
          )
        )}
      </div>

      {/* Table placeholder */}
      <PlaceholderSection
        icon={Users}
        title="Experts Table"
        description="Sortable, filterable table with columns: Name, Network, Company, Title, Segment, Status, Risk Flag, Last Updated. Row actions: View, Edit, Shortlist, Mark Conflicted."
      />
    </div>
  )
}
