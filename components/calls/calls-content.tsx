"use client"

import { Phone } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

export function CallsContent() {
  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Filters:
        </span>
        {["Status", "Date Range", "Network", "Type"].map((f) => (
          <span
            key={f}
            className="rounded-md bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
          >
            {f}
          </span>
        ))}
      </div>

      <PlaceholderSection
        icon={Phone}
        title="Calls Table"
        description="Sortable table with columns: Expert, Company, Type, Date/Time, Status, Rate, Cost, Network, Owner. Row actions: View/Edit call details."
      />
    </div>
  )
}
