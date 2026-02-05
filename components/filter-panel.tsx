"use client"

import { SlidersHorizontal } from "lucide-react"

interface FilterPanelProps {
  filters: string[]
  activeFilter?: string
  onFilterChange?: (filter: string) => void
}

export function FilterPanel({ filters, activeFilter, onFilterChange }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
      <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="mr-1 text-xs font-medium text-muted-foreground">Filters:</span>
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange?.(f)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            activeFilter === f
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
