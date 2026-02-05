"use client"

import { SlidersHorizontal, X } from "lucide-react"

export interface FilterGroup {
  key: string
  label: string
  options: string[]
}

interface FilterPanelProps {
  filters: FilterGroup[]
  /** Currently active filter values keyed by filter key */
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearAll?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export default function FilterPanel({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}: FilterPanelProps) {
  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== "") || searchValue.length > 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters</span>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {filters.map((group) => (
          <select
            key={group.key}
            value={activeFilters[group.key] ?? ""}
            onChange={(e) => onFilterChange(group.key, e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            aria-label={group.label}
          >
            <option value="">
              {group.label}
            </option>
            {group.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
        {hasActiveFilters && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      {onSearchChange && (
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-8 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring sm:w-52"
          aria-label="Search"
        />
      )}
    </div>
  )
}
