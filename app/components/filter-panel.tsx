import { SlidersHorizontal } from "lucide-react"

interface FilterGroup {
  label: string
  options: string[]
}

interface FilterPanelProps {
  filters: FilterGroup[]
  searchPlaceholder?: string
}

export default function FilterPanel({
  filters,
  searchPlaceholder = "Search...",
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters</span>
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {filters.map((group) => (
          <select
            key={group.label}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            defaultValue=""
            aria-label={group.label}
          >
            <option value="" disabled>
              {group.label}
            </option>
            {group.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
      </div>
      <input
        type="search"
        placeholder={searchPlaceholder}
        className="h-8 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring sm:w-52"
        aria-label="Search"
      />
    </div>
  )
}
