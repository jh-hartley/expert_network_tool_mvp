"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { ArrowUp, ArrowDown, ArrowUpDown, Columns3, ChevronLeft, ChevronRight } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Column definition                                                 */
/* ------------------------------------------------------------------ */
export interface Column<T = Record<string, unknown>> {
  key: string
  label: string
  className?: string
  /** If true the column can be sorted (default: true) */
  sortable?: boolean
  /** Custom sort value extractor (for badges, JSX, etc.) */
  sortValue?: (row: T) => string | number
  /** If true, the column is hidden by default */
  defaultHidden?: boolean
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  rows: T[]
  emptyMessage?: string
  /** Page size. Default 10 */
  pageSize?: number
  /** Whether to show column visibility toggle. Default true */
  showColumnToggle?: boolean
  /** Whether to show pagination. Default true if rows > pageSize */
  showPagination?: boolean
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "No records to display.",
  pageSize = 10,
  showColumnToggle = true,
  showPagination,
}: DataTableProps<T>) {
  // --- Sorting state ---
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  // --- Column visibility ---
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(() => {
    const hidden = new Set<string>()
    columns.forEach((c) => {
      if (c.defaultHidden) hidden.add(c.key)
    })
    return hidden
  })
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const colMenuRef = useRef<HTMLDivElement>(null)

  // Close column menu on outside click
  useEffect(() => {
    if (!colMenuOpen) return
    function handleClick(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [colMenuOpen])

  // --- Pagination ---
  const [page, setPage] = useState(0)

  // Reset page when rows change
  useEffect(() => {
    setPage(0)
  }, [rows.length])

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.has(c.key)),
    [columns, hiddenCols],
  )

  // --- Sort logic ---
  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return rows
    return [...rows].sort((a, b) => {
      const aVal = col.sortValue ? col.sortValue(a) : a[sortKey]
      const bVal = col.sortValue ? col.sortValue(b) : b[sortKey]
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
  }, [rows, sortKey, sortDir, columns])

  // --- Pagination ---
  const shouldPaginate = showPagination ?? rows.length > pageSize
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginatedRows = shouldPaginate
    ? sorted.slice(page * pageSize, (page + 1) * pageSize)
    : sorted

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

  const toggleCol = useCallback((key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const startRow = page * pageSize + 1
  const endRow = Math.min((page + 1) * pageSize, sorted.length)

  return (
    <div>
      {/* Toolbar */}
      {showColumnToggle && (
        <div className="mb-2 flex items-center justify-end">
          <div className="relative" ref={colMenuRef}>
            <button
              type="button"
              onClick={() => setColMenuOpen((v) => !v)}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Toggle columns"
            >
              <Columns3 className="h-3 w-3" />
              Columns
            </button>
            {colMenuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-accent/60"
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenCols.has(col.key)}
                      onChange={() => toggleCol(col.key)}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {visibleColumns.map((col) => {
                  const isSortable = col.sortable !== false
                  const isActive = sortKey === col.key
                  return (
                    <th
                      key={col.key}
                      className={[
                        "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                        isSortable ? "cursor-pointer select-none hover:text-foreground" : "",
                        col.className ?? "",
                      ].join(" ")}
                      onClick={isSortable ? () => handleSort(col.key) : undefined}
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
                        {isSortable && (
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
                        )}
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
                    colSpan={visibleColumns.length}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, i) => (
                  <tr
                    key={i}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          "px-4 py-2.5 text-sm text-foreground",
                          col.className ?? "",
                        ].join(" ")}
                      >
                        {row[col.key] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {shouldPaginate && sorted.length > 0 && (
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
    </div>
  )
}
