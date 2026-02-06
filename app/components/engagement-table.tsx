"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Plus,
  Check,
  X,
  StickyNote,
} from "lucide-react"
import type { EngagementRecord, EngagementStatus, EngagementType } from "@/lib/engagements"
import { getNetworks, type ExpertProfile } from "@/lib/expert-profiles"
import { searchExperts, createEngagementFromExpert, generateId } from "@/lib/engagements"

/* ------------------------------------------------------------------ */
/*  Lens tabs (same as experts page)                                   */
/* ------------------------------------------------------------------ */

type Lens = "all" | "customer" | "competitor" | "target" | "competitor_customer"

interface LensMeta { key: Lens; label: string; shortLabel: string }

const LENSES: LensMeta[] = [
  { key: "all", label: "All", shortLabel: "All" },
  { key: "customer", label: "Customers", shortLabel: "Customers" },
  { key: "competitor", label: "Competitors", shortLabel: "Competitors" },
  { key: "target", label: "Target", shortLabel: "Target" },
  { key: "competitor_customer", label: "Comp. Customers", shortLabel: "Comp. Cust." },
]

const TYPE_LABELS: Record<string, string> = {
  customer: "Customer",
  competitor: "Competitor",
  target: "Target",
  competitor_customer: "Comp. Customer",
}
const TYPE_COLORS: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700 border-blue-200",
  competitor: "bg-rose-50 text-rose-700 border-rose-200",
  target: "bg-amber-50 text-amber-700 border-amber-200",
  competitor_customer: "bg-violet-50 text-violet-700 border-violet-200",
}

/* ------------------------------------------------------------------ */
/*  Status                                                             */
/* ------------------------------------------------------------------ */

const STATUSES: EngagementStatus[] = ["invited", "scheduled", "completed", "cancelled"]

const STATUS_LABELS: Record<EngagementStatus, string> = {
  invited: "Invited",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
}
const STATUS_COLORS: Record<EngagementStatus, string> = {
  invited: "bg-sky-50 text-sky-700 border-sky-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

/* ------------------------------------------------------------------ */
/*  Column definitions                                                 */
/* ------------------------------------------------------------------ */

interface ColDef {
  key: string
  label: string
  accessor: (r: EngagementRecord) => string | number | null
  className?: string
  minWidth?: string
}

const SHARED_COLS: ColDef[] = [
  { key: "expert_name", label: "Name", accessor: (r) => r.expert_name, minWidth: "140px" },
  { key: "expert_role", label: "Role", accessor: (r) => r.expert_role, minWidth: "160px" },
  { key: "anonymised_role", label: "Anonymised Role", accessor: (r) => r.anonymised_role, minWidth: "160px" },
  { key: "expert_company", label: "Company", accessor: (r) => r.expert_company, minWidth: "130px" },
]

const DATE_COL_CALL: ColDef = { key: "date", label: "Call Date", accessor: (r) => r.date, minWidth: "110px" }
const DATE_COL_SURVEY: ColDef = { key: "date", label: "Invite Sent", accessor: (r) => r.date, minWidth: "110px" }
const DURATION_COL: ColDef = {
  key: "duration",
  label: "Length (min)",
  accessor: (r) => r.duration_minutes || null,
  className: "text-right",
  minWidth: "90px",
}

function getColumns(engType: EngagementType, lens: Lens, records: EngagementRecord[]): ColDef[] {
  const nets = getNetworks()
  const netCols: ColDef[] = nets.map((n) => ({
    key: `price_${n}`,
    label: engType === "call" ? `${n} ($/hr)` : `${n} (EUR)`,
    accessor: (r: EngagementRecord) => r.network_prices[n] ?? null,
    className: "text-right",
    minWidth: "110px",
  }))

  const typeCols: ColDef[] =
    lens === "all"
      ? [{ key: "expert_type", label: "Type", accessor: (r) => TYPE_LABELS[r.expert_type] ?? r.expert_type, minWidth: "120px" }]
      : []

  const dateCols: ColDef[] = engType === "call"
    ? [DATE_COL_CALL, DURATION_COL]
    : [DATE_COL_SURVEY]

  return [...SHARED_COLS, ...typeCols, ...dateCols, ...netCols]
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface EngagementTableProps {
  records: EngagementRecord[]
  engagementType: EngagementType
  onUpdateRecord: (index: number, updates: Partial<EngagementRecord>) => void
  onAddRecord: (record: EngagementRecord) => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EngagementTable({
  records,
  engagementType,
  onUpdateRecord,
  onAddRecord,
}: EngagementTableProps) {
  const [lens, setLens] = useState<Lens>("all")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")

  // Inline notes editing
  const [editingNotes, setEditingNotes] = useState<number | null>(null)
  const [draftNotes, setDraftNotes] = useState("")
  const notesRef = useRef<HTMLTextAreaElement>(null)

  // Add-row autocomplete
  const [showAddRow, setShowAddRow] = useState(false)
  const [acQuery, setAcQuery] = useState("")
  const [acResults, setAcResults] = useState<ExpertProfile[]>([])
  const [acOpen, setAcOpen] = useState(false)
  const acRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSortKey(null)
  }, [lens])

  // Autocomplete search
  useEffect(() => {
    if (acQuery.length >= 2) {
      setAcResults(searchExperts(acQuery))
      setAcOpen(true)
    } else {
      setAcResults([])
      setAcOpen(false)
    }
  }, [acQuery])

  // Close autocomplete on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setAcOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const columns = useMemo(() => getColumns(engagementType, lens, records), [engagementType, lens, records])

  // Filter by lens + search
  const filtered = useMemo(() => {
    let list = records
    if (lens !== "all") list = list.filter((r) => r.expert_type === lens)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.expert_name.toLowerCase().includes(q) ||
          r.expert_company.toLowerCase().includes(q) ||
          r.expert_role.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q),
      )
    }
    return list
  }, [records, lens, search])

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return filtered
    return [...filtered].sort((a, b) => {
      const av = col.accessor(a)
      const bv = col.accessor(b)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortKey, sortDir, columns])

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      else {
        setSortKey(key)
        setSortDir("asc")
      }
    },
    [sortKey],
  )

  // Find the original index of a record in the full records array
  function findOriginalIndex(r: EngagementRecord): number {
    return records.findIndex((rec) => rec.id === r.id)
  }

  function handleStatusChange(r: EngagementRecord, newStatus: EngagementStatus) {
    const idx = findOriginalIndex(r)
    if (idx >= 0) onUpdateRecord(idx, { status: newStatus })
  }

  function handleNotesCommit(r: EngagementRecord) {
    const idx = findOriginalIndex(r)
    if (idx >= 0) onUpdateRecord(idx, { notes: draftNotes })
    setEditingNotes(null)
  }

  function handleAddExpert(expert: ExpertProfile) {
    const record = createEngagementFromExpert(expert, engagementType, {
      id: generateId(),
      network_prices: engagementType === "survey"
        ? Object.fromEntries(Object.keys(expert.network_prices).map((n) => [n, expert.network_prices[n] != null ? 300 : null]))
        : { ...expert.network_prices },
    })
    onAddRecord(record)
    setShowAddRow(false)
    setAcQuery("")
    setAcOpen(false)
  }

  // Count per lens
  const lensCount = (l: Lens) => l === "all" ? records.length : records.filter((r) => r.expert_type === l).length

  /* --- Render --- */

  function formatDate(iso: string) {
    if (!iso) return "--"
    const d = new Date(iso)
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  function renderCell(col: ColDef, r: EngagementRecord) {
    const v = col.accessor(r)
    if (col.key === "date") return formatDate(String(v ?? ""))
    if (col.key === "duration") return v && Number(v) > 0 ? `${v}` : "--"
    if (col.key === "expert_type") {
      const label = TYPE_LABELS[r.expert_type] ?? r.expert_type
      const color = TYPE_COLORS[r.expert_type] ?? "bg-muted text-muted-foreground"
      return (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>
          {label}
        </span>
      )
    }
    if (col.key.startsWith("price_")) {
      return v != null ? (
        <span className="tabular-nums">{engagementType === "survey" ? `€${v}` : `$${v}`}</span>
      ) : (
        <span className="text-muted-foreground/40">--</span>
      )
    }
    if (v == null) return <span className="text-muted-foreground/40">--</span>
    const s = String(v)
    return s.length > 60 ? (
      <span title={s}>{s.slice(0, 57)}...</span>
    ) : (
      s
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pb-3">
        {/* Lens tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Expert type filter">
            {LENSES.map((l) => {
              const isActive = lens === l.key
              const count = lensCount(l.key)
              return (
                <button
                  key={l.key}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setLens(l.key)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {l.shortLabel}
                  <span
                    className={[
                      "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Add button */}
          <button
            type="button"
            onClick={() => setShowAddRow(!showAddRow)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            {engagementType === "call" ? "Add Call" : "Add Survey"}
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 rounded-md border border-border bg-card pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Add row with autocomplete */}
      {showAddRow && (
        <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-foreground">Add expert:</p>
            <div className="relative flex-1" ref={acRef}>
              <input
                type="text"
                placeholder="Start typing expert name or company..."
                value={acQuery}
                onChange={(e) => setAcQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              {acOpen && acResults.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                  {acResults.map((exp) => (
                    <button
                      key={`${exp.name}-${exp.company}`}
                      type="button"
                      onClick={() => handleAddExpert(exp)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-accent"
                    >
                      <span className="font-medium text-foreground">{exp.name}</span>
                      <span className="text-muted-foreground">{exp.original_role ?? exp.role}</span>
                      <span className="text-muted-foreground/60">{exp.company}</span>
                      <span className={`ml-auto inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[exp.expert_type] ?? ""}`}>
                        {TYPE_LABELS[exp.expert_type] ?? exp.expert_type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {acOpen && acQuery.length >= 2 && acResults.length === 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-card p-3 shadow-lg">
                  <p className="text-xs text-muted-foreground">No experts found matching &quot;{acQuery}&quot;</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setShowAddRow(false); setAcQuery(""); setAcOpen(false) }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {/* Status dropdown column */}
              <th className="sticky left-0 z-10 bg-muted/30 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ minWidth: "110px" }}>
                <button type="button" onClick={() => handleSort("status")} className="inline-flex items-center gap-1">
                  Status
                  {sortKey === "status" ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${col.className ?? ""}`}
                  style={{ minWidth: col.minWidth }}
                >
                  <button type="button" onClick={() => handleSort(col.key)} className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </button>
                </th>
              ))}
              {/* Notes column */}
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ minWidth: "160px" }}>
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {records.length === 0
                    ? `No ${engagementType === "call" ? "calls" : "surveys"} recorded yet.`
                    : "No results match the current filters."}
                </td>
              </tr>
            ) : (
              sorted.map((r, localIdx) => {
                const globalIdx = findOriginalIndex(r)
                const isEditingNotes = editingNotes === globalIdx
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    {/* Status dropdown */}
                    <td className="sticky left-0 z-10 bg-card px-3 py-2">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r, e.target.value as EngagementStatus)}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring ${STATUS_COLORS[r.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className={`px-3 py-2 ${col.className ?? ""}`}>
                        {renderCell(col, r)}
                      </td>
                    ))}
                    {/* Notes */}
                    <td className="px-3 py-2">
                      {isEditingNotes ? (
                        <div className="flex items-start gap-1">
                          <textarea
                            ref={notesRef}
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            rows={2}
                            className="flex-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            autoFocus
                          />
                          <button type="button" onClick={() => handleNotesCommit(r)} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                            <Check className="h-3 w-3" />
                          </button>
                          <button type="button" onClick={() => setEditingNotes(null)} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setEditingNotes(globalIdx); setDraftNotes(r.notes) }}
                          className="group flex items-center gap-1 text-left"
                        >
                          {r.notes ? (
                            <span className="max-w-[200px] truncate" title={r.notes}>{r.notes}</span>
                          ) : (
                            <span className="text-muted-foreground/40 italic">Add note</span>
                          )}
                          <StickyNote className="h-3 w-3 shrink-0 text-muted-foreground/40 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2">
          <p className="text-[11px] text-muted-foreground">
            {sorted.length} {engagementType === "call" ? "call" : "survey"}{sorted.length === 1 ? "" : "s"}
            {sorted.length !== records.length && ` (of ${records.length} total)`}
          </p>
        </div>
      </div>
    </div>
  )
}
