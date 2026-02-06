"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import type { ExtractedExpert } from "@/lib/llm"

/* ------------------------------------------------------------------ */
/*  Expert type lenses                                                 */
/* ------------------------------------------------------------------ */

export type ExpertLens =
  | "all"
  | "customer"
  | "competitor"
  | "target"
  | "competitor_customer"

interface LensMeta {
  key: ExpertLens
  label: string
  shortLabel: string
}

const LENSES: LensMeta[] = [
  { key: "all", label: "All Experts", shortLabel: "All" },
  { key: "customer", label: "Customers", shortLabel: "Customers" },
  { key: "competitor", label: "Competitors", shortLabel: "Competitors" },
  { key: "target", label: "Target", shortLabel: "Target" },
  { key: "competitor_customer", label: "Competitor Customers", shortLabel: "Comp. Customers" },
]

/* ------------------------------------------------------------------ */
/*  Column definitions per lens                                        */
/* ------------------------------------------------------------------ */

interface ColDef {
  key: string
  label: string
  /** accessor function -- extracts a cell value from an expert */
  accessor: (e: ExtractedExpert) => string | number | null
  className?: string
  minWidth?: string
}

/* -- Shared columns (appear in every lens) ------------------------- */
const SHARED_COLS: ColDef[] = [
  { key: "name", label: "Name", accessor: (e) => e.name, minWidth: "140px" },
  { key: "role", label: "Anonymised Role", accessor: (e) => e.role, minWidth: "160px" },
  { key: "company", label: "Company", accessor: (e) => e.company, minWidth: "140px" },
  {
    key: "former",
    label: "Former?",
    accessor: (e) => (e.former ? "Yes" : "No"),
    minWidth: "70px",
  },
  { key: "date_left", label: "Date Left", accessor: (e) => e.date_left, minWidth: "90px" },
  {
    key: "price",
    label: "Rate ($/hr)",
    accessor: (e) => e.price,
    className: "text-right",
    minWidth: "90px",
  },
  { key: "network", label: "Network", accessor: (e) => e.network, minWidth: "110px" },
  { key: "industry_guess", label: "Industry", accessor: (e) => e.industry_guess, minWidth: "140px" },
  { key: "fte_estimate", label: "Est. FTEs", accessor: (e) => e.fte_estimate, minWidth: "100px" },
]

/* -- Customer screening columns ------------------------------------ */
const CUSTOMER_SCREENER_COLS: ColDef[] = [
  {
    key: "screener_vendors_evaluated",
    label: "Vendors Evaluated",
    accessor: (e) => e.screener_vendors_evaluated,
    minWidth: "220px",
  },
  {
    key: "screener_vendor_selection_driver",
    label: "Selection Driver",
    accessor: (e) => e.screener_vendor_selection_driver,
    minWidth: "220px",
  },
  {
    key: "screener_vendor_satisfaction",
    label: "Vendor Satisfaction",
    accessor: (e) => e.screener_vendor_satisfaction,
    minWidth: "200px",
  },
  {
    key: "screener_switch_trigger",
    label: "Switch Trigger",
    accessor: (e) => e.screener_switch_trigger,
    minWidth: "220px",
  },
]

/* -- Competitor / Target screening columns ------------------------- */
const COMPETITOR_SCREENER_COLS: ColDef[] = [
  {
    key: "screener_competitive_landscape",
    label: "Competitive Landscape",
    accessor: (e) => e.screener_competitive_landscape,
    minWidth: "240px",
  },
  {
    key: "screener_losing_deals_to",
    label: "Losing Deals To",
    accessor: (e) => e.screener_losing_deals_to,
    minWidth: "220px",
  },
  {
    key: "screener_pricing_comparison",
    label: "Pricing Comparison",
    accessor: (e) => e.screener_pricing_comparison,
    minWidth: "220px",
  },
  {
    key: "screener_rd_investment",
    label: "R&D Investment",
    accessor: (e) => e.screener_rd_investment,
    minWidth: "220px",
  },
]

const ADDITIONAL_COL: ColDef = {
  key: "additional_info",
  label: "Additional Info",
  accessor: (e) => e.additional_info,
  minWidth: "220px",
}

function getColumnsForLens(lens: ExpertLens): ColDef[] {
  switch (lens) {
    case "customer":
    case "competitor_customer":
      return [...SHARED_COLS, ...CUSTOMER_SCREENER_COLS, ADDITIONAL_COL]
    case "competitor":
    case "target":
      return [...SHARED_COLS, ...COMPETITOR_SCREENER_COLS, ADDITIONAL_COL]
    case "all":
    default:
      // Show shared + expert_type column, no screener columns (too wide)
      return [
        ...SHARED_COLS.slice(0, 3), // Name, Role, Company
        {
          key: "expert_type",
          label: "Type",
          accessor: (e) => TYPE_LABELS[e.expert_type] ?? e.expert_type,
          minWidth: "120px",
        },
        ...SHARED_COLS.slice(3), // Former, Date Left, Rate, Network, Industry, FTEs
        ADDITIONAL_COL,
      ]
  }
}

const TYPE_LABELS: Record<string, string> = {
  customer: "Customer",
  competitor: "Competitor",
  target: "Target",
  competitor_customer: "Comp. Customer",
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ExpertLensTableProps {
  experts: ExtractedExpert[]
  pageSize?: number
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ExpertLensTable({
  experts,
  pageSize = 10,
}: ExpertLensTableProps) {
  const [lens, setLens] = useState<ExpertLens>("all")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")

  // Reset page & sort when lens changes
  useEffect(() => {
    setPage(0)
    setSortKey(null)
  }, [lens])

  // Columns for the current lens
  const columns = useMemo(() => getColumnsForLens(lens), [lens])

  // Count per type (for badges)
  const counts = useMemo(() => {
    const map: Record<ExpertLens, number> = {
      all: experts.length,
      customer: 0,
      competitor: 0,
      target: 0,
      competitor_customer: 0,
    }
    experts.forEach((e) => {
      if (e.expert_type in map) {
        map[e.expert_type as ExpertLens]++
      }
    })
    return map
  }, [experts])

  // Filter by lens + search
  const filtered = useMemo(() => {
    let list = lens === "all" ? experts : experts.filter((e) => e.expert_type === lens)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.company.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.network.toLowerCase().includes(q) ||
          e.industry_guess.toLowerCase().includes(q),
      )
    }
    return list
  }, [experts, lens, search])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = col.accessor(a)
      const bVal = col.accessor(b)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [filtered, sortKey, sortDir, columns])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginatedRows = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const startRow = page * pageSize + 1
  const endRow = Math.min((page + 1) * pageSize, sorted.length)

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      } else {
        setSortKey(key)
        setSortDir("asc")
      }
      setPage(0)
    },
    [sortKey],
  )

  return (
    <div>
      {/* ---- Lens tabs ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Expert type filter">
          {LENSES.map((l) => {
            const isActive = lens === l.key
            const count = counts[l.key]
            // Hide the tab if 0 experts for non-all lenses
            if (l.key !== "all" && count === 0) return null
            return (
              <button
                key={l.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setLens(l.key)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {l.shortLabel}
                <span
                  className={[
                    "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="Search name, company, role..."
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring sm:w-56"
            aria-label="Search experts"
          />
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {columns.map((col) => {
                  const isActive = sortKey === col.key
                  return (
                    <th
                      key={col.key}
                      className={[
                        "cursor-pointer select-none px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground",
                        col.className ?? "",
                      ].join(" ")}
                      style={{ minWidth: col.minWidth }}
                      onClick={() => handleSort(col.key)}
                      aria-sort={
                        isActive
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <span className="inline-flex w-3.5">
                          {isActive ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </span>
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {search
                      ? "No experts match your search."
                      : "No experts in this category."}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((expert, i) => (
                  <tr key={`${expert.name}-${expert.company}-${i}`} className="transition-colors hover:bg-muted/30">
                    {columns.map((col) => {
                      const value = col.accessor(expert)
                      return (
                        <td
                          key={col.key}
                          className={[
                            "px-4 py-2.5 text-sm text-foreground",
                            col.className ?? "",
                          ].join(" ")}
                          style={{ minWidth: col.minWidth }}
                        >
                          <CellRenderer value={value} colKey={col.key} />
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {sorted.length > pageSize && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <p className="text-[11px] text-muted-foreground">
              {startRow}&#8211;{endRow} of {sorted.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[3rem] text-center text-[11px] text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      {filtered.length > 0 && filtered.length !== experts.length && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {experts.length} experts
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cell renderer                                                      */
/* ------------------------------------------------------------------ */

function CellRenderer({ value, colKey }: { value: string | number | null; colKey: string }) {
  if (value == null) {
    return <span className="text-muted-foreground/50">--</span>
  }

  // Format price
  if (colKey === "price" && typeof value === "number") {
    return <span className="tabular-nums">${value.toLocaleString()}</span>
  }

  // For "Former?" column
  if (colKey === "former") {
    const isFormer = value === "Yes"
    return (
      <span
        className={[
          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
          isFormer ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
        ].join(" ")}
      >
        {String(value)}
      </span>
    )
  }

  // For expert type badges (All view)
  if (colKey === "expert_type") {
    const styles: Record<string, string> = {
      Customer: "bg-sky-50 text-sky-700",
      Competitor: "bg-rose-50 text-rose-700",
      Target: "bg-violet-50 text-violet-700",
      "Comp. Customer": "bg-orange-50 text-orange-700",
    }
    return (
      <span
        className={[
          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
          styles[String(value)] ?? "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {String(value)}
      </span>
    )
  }

  // Long text cells -- screener answers / additional info
  const isScreener = colKey.startsWith("screener_") || colKey === "additional_info"
  if (isScreener && typeof value === "string" && value.length > 120) {
    return (
      <span className="line-clamp-3 text-xs leading-relaxed" title={value}>
        {value}
      </span>
    )
  }

  return <span>{String(value)}</span>
}
