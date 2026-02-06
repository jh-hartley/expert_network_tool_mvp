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
  Trash2,
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

const DATE_COL_CALL: ColDef = { key: "date", label: "Call Date", accessor: (r) => r.date, minWidth: "125px" }
const DATE_COL_SURVEY: ColDef = { key: "date", label: "Invite Sent", accessor: (r) => r.date, minWidth: "125px" }
const DURATION_COL: ColDef = {
  key: "duration",
  label: "Length (min)",
  accessor: (r) => r.duration_minutes || null,
  className: "text-right",
  minWidth: "100px",
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
/*  Draft row -- a new row being filled in                             */
/* ------------------------------------------------------------------ */

interface DraftRow {
  id: string
  /** Name typed so far */
  nameQuery: string
  /** Selected expert (once autocomplete is picked) */
  expert: ExpertProfile | null
  /** User-editable fields */
  date: string
  durationMinutes: string
  status: EngagementStatus
}

function emptyDraft(): DraftRow {
  return {
    id: generateId(),
    nameQuery: "",
    expert: null,
    date: new Date().toISOString().slice(0, 10),
    durationMinutes: "",
    status: "invited",
  }
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface EngagementTableProps {
  records: EngagementRecord[]
  engagementType: EngagementType
  onUpdateRecord: (index: number, updates: Partial<EngagementRecord>) => void
  onAddRecord: (record: EngagementRecord) => void
  onRemoveRecord?: (index: number) => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EngagementTable({
  records,
  engagementType,
  onUpdateRecord,
  onAddRecord,
  onRemoveRecord,
}: EngagementTableProps) {
  const [lens, setLens] = useState<Lens>("all")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")

  // Inline notes editing
  const [editingNotes, setEditingNotes] = useState<number | null>(null)
  const [draftNotes, setDraftNotes] = useState("")

  // Draft rows (new rows being composed inline)
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [acOpenId, setAcOpenId] = useState<string | null>(null)
  const [acResults, setAcResults] = useState<ExpertProfile[]>([])
  const acRef = useRef<HTMLDivElement>(null)

  // Inline date / duration editing for committed rows
  const [editingDate, setEditingDate] = useState<number | null>(null)
  const [editingDuration, setEditingDuration] = useState<number | null>(null)

  useEffect(() => {
    setSortKey(null)
  }, [lens])

  // Close autocomplete on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setAcOpenId(null)
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

  /* --- Draft row management --- */

  function addDraftRow() {
    setDrafts((prev) => [...prev, emptyDraft()])
  }

  function updateDraft(id: string, updates: Partial<DraftRow>) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    if (acOpenId === id) setAcOpenId(null)
  }

  function handleDraftNameChange(draft: DraftRow, value: string) {
    updateDraft(draft.id, { nameQuery: value, expert: null })
    if (value.length >= 2) {
      setAcResults(searchExperts(value))
      setAcOpenId(draft.id)
    } else {
      setAcResults([])
      setAcOpenId(null)
    }
  }

  function handleDraftSelectExpert(draft: DraftRow, expert: ExpertProfile) {
    updateDraft(draft.id, {
      nameQuery: expert.name,
      expert,
    })
    setAcOpenId(null)
  }

  function commitDraft(draft: DraftRow) {
    if (!draft.expert) return
    const record = createEngagementFromExpert(draft.expert, engagementType, {
      id: draft.id,
      status: draft.status,
      date: draft.date,
      duration_minutes: engagementType === "call" ? (parseInt(draft.durationMinutes) || 0) : 0,
      network_prices: engagementType === "survey"
        ? Object.fromEntries(
            Object.keys(draft.expert.network_prices).map((n) => [n, draft.expert!.network_prices[n] != null ? 300 : null]),
          )
        : { ...draft.expert.network_prices },
    })
    onAddRecord(record)
    removeDraft(draft.id)
  }

  const lensCount = (l: Lens) => l === "all" ? records.length : records.filter((r) => r.expert_type === l).length

  /* --- Rendering helpers --- */

  function formatDate(iso: string) {
    if (!iso) return "--"
    const d = new Date(iso)
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  function renderCell(col: ColDef, r: EngagementRecord) {
    const v = col.accessor(r)
    const globalIdx = findOriginalIndex(r)

    // Inline-editable date
    if (col.key === "date") {
      if (editingDate === globalIdx) {
        return (
          <input
            type="date"
            defaultValue={r.date}
            autoFocus
            className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onBlur={(e) => {
              if (e.target.value) onUpdateRecord(globalIdx, { date: e.target.value })
              setEditingDate(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value
                if (val) onUpdateRecord(globalIdx, { date: val })
                setEditingDate(null)
              }
              if (e.key === "Escape") setEditingDate(null)
            }}
          />
        )
      }
      return (
        <button
          type="button"
          onClick={() => setEditingDate(globalIdx)}
          className="text-left underline-offset-2 hover:underline"
          title="Click to edit date"
        >
          {formatDate(String(v ?? ""))}
        </button>
      )
    }

    // Inline-editable duration
    if (col.key === "duration") {
      if (editingDuration === globalIdx) {
        return (
          <input
            type="number"
            min={0}
            defaultValue={r.duration_minutes || ""}
            autoFocus
            placeholder="min"
            className="h-7 w-16 rounded-md border border-border bg-card px-2 text-right text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onBlur={(e) => {
              onUpdateRecord(globalIdx, { duration_minutes: parseInt(e.target.value) || 0 })
              setEditingDuration(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdateRecord(globalIdx, { duration_minutes: parseInt((e.target as HTMLInputElement).value) || 0 })
                setEditingDuration(null)
              }
              if (e.key === "Escape") setEditingDuration(null)
            }}
          />
        )
      }
      return (
        <button
          type="button"
          onClick={() => setEditingDuration(globalIdx)}
          className="text-right underline-offset-2 hover:underline"
          title="Click to edit duration"
        >
          {v && Number(v) > 0 ? `${v}` : "--"}
        </button>
      )
    }

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
        <span className="tabular-nums">{engagementType === "survey" ? `\u20AC${v}` : `$${v}`}</span>
      ) : (
        <span className="text-muted-foreground/40">--</span>
      )
    }
    if (v == null) return <span className="text-muted-foreground/40">--</span>
    const s = String(v)
    return s.length > 60 ? <span title={s}>{s.slice(0, 57)}...</span> : s
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pb-3">
        {/* Lens tabs */}
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

        <div className="ml-auto flex items-center gap-2">
          {/* Add button */}
          <button
            type="button"
            onClick={addDraftRow}
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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {/* Status column */}
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
              {/* Actions */}
              <th className="px-2 py-2.5" style={{ minWidth: "40px" }} />
            </tr>
          </thead>
          <tbody>
            {/* === Draft rows at the top === */}
            {drafts.map((draft) => {
              const expert = draft.expert
              const showAc = acOpenId === draft.id && acResults.length > 0
              const showNoResults = acOpenId === draft.id && draft.nameQuery.length >= 2 && acResults.length === 0
              return (
                <tr key={draft.id} className="border-b border-primary/20 bg-primary/5">
                  {/* Status -- editable */}
                  <td className="sticky left-0 z-10 bg-primary/5 px-3 py-2">
                    <select
                      value={draft.status}
                      onChange={(e) => updateDraft(draft.id, { status: e.target.value as EngagementStatus })}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring ${STATUS_COLORS[draft.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>

                  {columns.map((col) => {
                    // Name column -- autocomplete input
                    if (col.key === "expert_name") {
                      return (
                        <td key={col.key} className="px-3 py-2">
                          <div className="relative" ref={acOpenId === draft.id ? acRef : undefined}>
                            <input
                              type="text"
                              value={draft.nameQuery}
                              onChange={(e) => handleDraftNameChange(draft, e.target.value)}
                              placeholder="Type expert name..."
                              autoFocus
                              className="h-7 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            {showAc && (
                              <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-72 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                                {acResults.map((exp) => (
                                  <button
                                    key={`${exp.name}-${exp.company}`}
                                    type="button"
                                    onClick={() => handleDraftSelectExpert(draft, exp)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent"
                                  >
                                    <span className="font-medium text-foreground">{exp.name}</span>
                                    <span className="truncate text-muted-foreground">{exp.company}</span>
                                    <span className={`ml-auto shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[exp.expert_type] ?? ""}`}>
                                      {TYPE_LABELS[exp.expert_type] ?? exp.expert_type}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {showNoResults && (
                              <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-md border border-border bg-card p-3 shadow-lg">
                                <p className="text-xs text-muted-foreground">No experts found</p>
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    }

                    // Date column -- editable
                    if (col.key === "date") {
                      return (
                        <td key={col.key} className="px-3 py-2">
                          <input
                            type="date"
                            value={draft.date}
                            onChange={(e) => updateDraft(draft.id, { date: e.target.value })}
                            className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </td>
                      )
                    }

                    // Duration column -- editable (calls only)
                    if (col.key === "duration") {
                      return (
                        <td key={col.key} className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            value={draft.durationMinutes}
                            onChange={(e) => updateDraft(draft.id, { durationMinutes: e.target.value })}
                            placeholder="min"
                            className="h-7 w-16 rounded-md border border-border bg-card px-2 text-right text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </td>
                      )
                    }

                    // Auto-filled from expert
                    if (col.key === "expert_type" && expert) {
                      const label = TYPE_LABELS[expert.expert_type] ?? expert.expert_type
                      const color = TYPE_COLORS[expert.expert_type] ?? "bg-muted text-muted-foreground"
                      return (
                        <td key={col.key} className="px-3 py-2">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>{label}</span>
                        </td>
                      )
                    }

                    if (col.key === "expert_role") {
                      return <td key={col.key} className="px-3 py-2 text-muted-foreground">{expert ? (expert.original_role ?? expert.role) : "--"}</td>
                    }
                    if (col.key === "anonymised_role") {
                      return <td key={col.key} className="px-3 py-2 text-muted-foreground">{expert?.role ?? "--"}</td>
                    }
                    if (col.key === "expert_company") {
                      return <td key={col.key} className="px-3 py-2 text-muted-foreground">{expert?.company ?? "--"}</td>
                    }
                    if (col.key.startsWith("price_")) {
                      const netName = col.key.replace("price_", "")
                      const price = expert?.network_prices[netName]
                      const val = engagementType === "survey" ? (price != null ? 300 : null) : (price ?? null)
                      return (
                        <td key={col.key} className={`px-3 py-2 ${col.className ?? ""}`}>
                          {val != null ? (
                            <span className="tabular-nums text-muted-foreground">{engagementType === "survey" ? `\u20AC${val}` : `$${val}`}</span>
                          ) : (
                            <span className="text-muted-foreground/40">--</span>
                          )}
                        </td>
                      )
                    }

                    return <td key={col.key} className="px-3 py-2 text-muted-foreground/40">--</td>
                  })}

                  {/* Notes -- blank for draft */}
                  <td className="px-3 py-2 text-muted-foreground/40 italic">--</td>

                  {/* Actions: confirm + cancel */}
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => commitDraft(draft)}
                        disabled={!draft.expert}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:pointer-events-none"
                        title="Confirm"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDraft(draft.id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
                        title="Cancel"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* === Committed rows === */}
            {sorted.length === 0 && drafts.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {records.length === 0
                    ? `No ${engagementType === "call" ? "calls" : "surveys"} recorded yet. Click "${engagementType === "call" ? "Add Call" : "Add Survey"}" to get started.`
                    : "No results match the current filters."}
                </td>
              </tr>
            ) : (
              sorted.map((r) => {
                const globalIdx = findOriginalIndex(r)
                const isEditingN = editingNotes === globalIdx
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
                      {isEditingN ? (
                        <div className="flex items-start gap-1">
                          <textarea
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
                    {/* Delete action */}
                    <td className="px-2 py-2">
                      {onRemoveRecord && (
                        <button
                          type="button"
                          onClick={() => onRemoveRecord(globalIdx)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive"
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
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
            {drafts.length > 0 && ` + ${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
    </div>
  )
}
