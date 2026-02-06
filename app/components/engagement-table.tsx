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
  AlertTriangle,
  ShieldAlert,
  Briefcase,
  RotateCcw,
  FileText,
  Upload,
} from "lucide-react"
import type { EngagementRecord, EngagementStatus, EngagementType } from "@/lib/engagements"
import { getNetworks, type ExpertProfile, type ComplianceFlag } from "@/lib/expert-profiles"
import {
  searchExperts,
  createEngagementFromExpert,
  generateId,
  computeCallPrice,
  DURATION_OPTIONS,
} from "@/lib/engagements"
import { getTranscript, saveTranscript, getTranscriptMap, type Transcript } from "@/lib/transcripts"
import Modal from "./modal"

/* ------------------------------------------------------------------ */
/*  Compliance flag warnings                                           */
/* ------------------------------------------------------------------ */

const WARNING_FLAGS: ComplianceFlag[] = ["ben_advisor", "compliance_flagged", "client_advisor"]

const FLAG_META: Record<
  string,
  { label: string; description: string; severity: "warning" | "danger"; Icon: typeof AlertTriangle }
> = {
  ben_advisor: {
    label: "BEN Advisor",
    description: "This expert is registered as a BEN (Business Ethics Network) advisor. Additional compliance review may be required before engagement.",
    severity: "warning",
    Icon: AlertTriangle,
  },
  compliance_flagged: {
    label: "Potentially Fraudulent",
    description: "Compliance has flagged this expert as potentially fraudulent. Do not proceed without explicit compliance team approval.",
    severity: "danger",
    Icon: ShieldAlert,
  },
  client_advisor: {
    label: "Current Client Advisor",
    description: "This expert is a current client advisor. Engaging may create a conflict of interest. Check with the engagement manager before proceeding.",
    severity: "warning",
    Icon: Briefcase,
  },
}

/* ------------------------------------------------------------------ */
/*  Lens tabs                                                          */
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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  if (!iso) return "--"
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function formatCallCost(r: EngagementRecord): string {
  const hourlyRate = r.network_prices?.[r.network] ?? 0
  if (hourlyRate <= 0) return "--"
  const cost = computeCallPrice(hourlyRate, r.duration_minutes, r.is_follow_up ?? false)
  return cost > 0 ? `$${cost.toLocaleString()}` : "--"
}

function formatSurveyCost(r: EngagementRecord): string {
  const price = r.network_prices?.[r.network] ?? 0
  return price > 0 ? `\u20AC${price.toLocaleString()}` : "--"
}

/* ------------------------------------------------------------------ */
/*  Draft row                                                          */
/* ------------------------------------------------------------------ */

interface DraftRow {
  id: string
  nameQuery: string
  expert: ExpertProfile | null
  date: string
  durationMinutes: number
  status: EngagementStatus
  network: string
  isFollowUp: boolean
}

function emptyDraft(): DraftRow {
  return {
    id: generateId(),
    nameQuery: "",
    expert: null,
    date: new Date().toISOString().slice(0, 10),
    durationMinutes: 60,
    status: "invited",
    network: "",
    isFollowUp: false,
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
  const networks = useMemo(() => getNetworks(), [])

  const [lens, setLens] = useState<Lens>("all")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")

  // Inline notes editing
  const [editingNotes, setEditingNotes] = useState<number | null>(null)
  const [draftNotes, setDraftNotes] = useState("")

  // Draft rows
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [acOpenId, setAcOpenId] = useState<string | null>(null)
  const [acResults, setAcResults] = useState<ExpertProfile[]>([])
  const acRef = useRef<HTMLDivElement>(null)

  // Inline editing for committed rows
  const [editingDate, setEditingDate] = useState<number | null>(null)

  // Compliance warning modal
  const [warningDraft, setWarningDraft] = useState<DraftRow | null>(null)
  const [warningFlags, setWarningFlags] = useState<ComplianceFlag[]>([])

  // Transcript modal
  const [transcriptModal, setTranscriptModal] = useState<{
    mode: "upload" | "view"
    record: EngagementRecord
  } | null>(null)
  const [transcriptText, setTranscriptText] = useState("")
  const [transcriptIds, setTranscriptIds] = useState<Set<string>>(new Set())

  // Load transcript map on mount and when records change
  useEffect(() => {
    setTranscriptIds(getTranscriptMap())
  }, [records])

  useEffect(() => { setSortKey(null) }, [lens])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node)) setAcOpenId(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  /* ---- Column definitions ---- */

  const COLUMNS = useMemo(() => {
    const cols: { key: string; label: string; minWidth: string; align?: "right" | "center" }[] = [
      { key: "expert_name", label: "Name", minWidth: "140px" },
      { key: "expert_role", label: "Role", minWidth: "160px" },
      { key: "anonymised_role", label: "Anon. Role", minWidth: "150px" },
      { key: "expert_company", label: "Company", minWidth: "130px" },
    ]
    if (lens === "all") cols.push({ key: "expert_type", label: "Type", minWidth: "110px" })
    cols.push({ key: "network", label: "Network", minWidth: "120px" })
    cols.push({ key: "date", label: engagementType === "call" ? "Call Date" : "Invite Sent", minWidth: "125px" })
    if (engagementType === "call") {
      cols.push({ key: "duration", label: "Length", minWidth: "90px", align: "center" })
      cols.push({ key: "follow_up", label: "Follow-up", minWidth: "80px", align: "center" })
    }
    cols.push({ key: "hourly_rate", label: engagementType === "call" ? "Rate ($/hr)" : "Rate (EUR)", minWidth: "100px", align: "right" })
    cols.push({ key: "cost", label: engagementType === "call" ? "Cost" : "Cost (EUR)", minWidth: "90px", align: "right" })
    return cols
  }, [lens, engagementType])

  /* ---- Sorting ---- */

  function accessor(r: EngagementRecord, key: string): string | number | null {
    switch (key) {
      case "expert_name": return r.expert_name
      case "expert_role": return r.expert_role
      case "anonymised_role": return r.anonymised_role
      case "expert_company": return r.expert_company
      case "expert_type": return TYPE_LABELS[r.expert_type] ?? r.expert_type
      case "network": return r.network
      case "date": return r.date
      case "duration": return r.duration_minutes || null
      case "follow_up": return r.is_follow_up ? 1 : 0
      case "hourly_rate": return r.network_prices?.[r.network] ?? null
      case "cost": {
        if (engagementType === "call") {
          const rate = r.network_prices?.[r.network] ?? 0
          return rate > 0 ? computeCallPrice(rate, r.duration_minutes, r.is_follow_up ?? false) : null
        }
        return r.network_prices?.[r.network] ?? null
      }
      default: return null
    }
  }

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

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = accessor(a, sortKey)
      const bv = accessor(b, sortKey)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortKey, sortDir])

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }, [sortKey])

  function findOriginalIndex(r: EngagementRecord): number {
    return records.findIndex((rec) => rec.id === r.id)
  }

  /* ---- Committed row handlers ---- */

  function handleStatusChange(r: EngagementRecord, s: EngagementStatus) {
    const idx = findOriginalIndex(r)
    if (idx >= 0) onUpdateRecord(idx, { status: s })
  }

  function handleNetworkChange(r: EngagementRecord, net: string) {
    const idx = findOriginalIndex(r)
    if (idx >= 0) onUpdateRecord(idx, { network: net })
  }

  function handleDurationChange(r: EngagementRecord, mins: number) {
    const idx = findOriginalIndex(r)
    if (idx >= 0) onUpdateRecord(idx, { duration_minutes: mins })
  }

  function handleFollowUpToggle(r: EngagementRecord) {
    const idx = findOriginalIndex(r)
    if (idx >= 0) onUpdateRecord(idx, { is_follow_up: !r.is_follow_up })
  }

  function handleNotesCommit(r: EngagementRecord) {
    const idx = findOriginalIndex(r)
    if (idx >= 0) onUpdateRecord(idx, { notes: draftNotes })
    setEditingNotes(null)
  }

  /* ---- Draft row management ---- */

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
    updateDraft(draft.id, { nameQuery: value, expert: null, network: "" })
    if (value.length >= 2) {
      setAcResults(searchExperts(value))
      setAcOpenId(draft.id)
    } else {
      setAcResults([])
      setAcOpenId(null)
    }
  }

  function handleDraftSelectExpert(draft: DraftRow, expert: ExpertProfile) {
    // Pick the first available network for this expert
    const availableNets = Object.entries(expert.network_prices ?? {})
      .filter(([, v]) => v != null)
      .map(([k]) => k)
    updateDraft(draft.id, {
      nameQuery: expert.name,
      expert,
      network: availableNets[0] ?? "",
    })
    setAcOpenId(null)
  }

  function commitDraft(draft: DraftRow, bypassWarning = false) {
    if (!draft.expert) return

    if (!bypassWarning) {
      const flags = (draft.expert.compliance_flags ?? []).filter((f) => WARNING_FLAGS.includes(f))
      if (flags.length > 0) {
        setWarningDraft(draft)
        setWarningFlags(flags)
        return
      }
    }

    const record = createEngagementFromExpert(draft.expert, engagementType, {
      id: draft.id,
      status: draft.status,
      date: draft.date,
      duration_minutes: engagementType === "call" ? draft.durationMinutes : 0,
      network: draft.network,
      is_follow_up: draft.isFollowUp,
      network_prices: engagementType === "survey"
        ? Object.fromEntries(
            Object.keys(draft.expert.network_prices ?? {}).map((n) => [
              n,
              (draft.expert!.network_prices ?? {})[n] != null ? 300 : null,
            ]),
          )
        : { ...(draft.expert.network_prices ?? {}) },
    })
    onAddRecord(record)
    removeDraft(draft.id)
  }

  function dismissWarning() {
    if (warningDraft) removeDraft(warningDraft.id)
    setWarningDraft(null)
    setWarningFlags([])
  }

  function overrideWarning() {
    if (warningDraft) commitDraft(warningDraft, true)
    setWarningDraft(null)
    setWarningFlags([])
  }

  /* ---- Transcript handlers ---- */

  function openTranscriptUpload(r: EngagementRecord) {
    setTranscriptText("")
    setTranscriptModal({ mode: "upload", record: r })
  }

  function openTranscriptView(r: EngagementRecord) {
    const t = getTranscript(r.id)
    setTranscriptText(t?.text ?? "")
    setTranscriptModal({ mode: "view", record: r })
  }

  function handleTranscriptSave() {
    if (!transcriptModal || !transcriptText.trim()) return
    const r = transcriptModal.record
    const t: Transcript = {
      engagement_id: r.id,
      expert_name: r.expert_name,
      expert_company: r.expert_company,
      expert_type: r.expert_type,
      engagement_type: r.type,
      text: transcriptText.trim(),
      uploaded_at: new Date().toISOString(),
    }
    saveTranscript(t)
    setTranscriptIds((prev) => new Set(prev).add(r.id))
    setTranscriptModal(null)
    setTranscriptText("")
  }

  const lensCount = (l: Lens) => l === "all" ? records.length : records.filter((r) => r.expert_type === l).length

  /* ---- Draft row: compute preview cost ---- */

  function draftCostPreview(draft: DraftRow): string {
    if (!draft.expert || !draft.network) return "--"
    const rate = draft.expert.network_prices?.[draft.network]
    if (rate == null || rate <= 0) return "--"
    if (engagementType === "survey") return `\u20AC${rate}`
    const cost = computeCallPrice(rate, draft.durationMinutes, draft.isFollowUp)
    return cost > 0 ? `$${cost.toLocaleString()}` : "--"
  }

  function draftRatePreview(draft: DraftRow): string {
    if (!draft.expert || !draft.network) return "--"
    const rate = draft.expert.network_prices?.[draft.network]
    if (rate == null) return "--"
    return engagementType === "survey" ? `\u20AC${rate}` : `$${rate}`
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pb-3">
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
          <button
            type="button"
            onClick={addDraftRow}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            {engagementType === "call" ? "Add Call" : "Add Survey"}
          </button>
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
              {/* Status */}
              <th className="sticky left-0 z-10 bg-muted/30 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ minWidth: "110px" }}>
                <button type="button" onClick={() => handleSort("status")} className="inline-flex items-center gap-1">
                  Status
                  {sortKey === "status" ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
                  style={{ minWidth: col.minWidth }}
                >
                  <button type="button" onClick={() => handleSort(col.key)} className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ minWidth: "160px" }}>Notes</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ minWidth: "100px" }}>Transcript</th>
              <th className="px-2 py-2.5" style={{ minWidth: "40px" }} />
            </tr>
          </thead>
          <tbody>
            {/* === Draft rows === */}
            {drafts.map((draft) => {
              const expert = draft.expert
              const showAc = acOpenId === draft.id && acResults.length > 0
              const showNoResults = acOpenId === draft.id && draft.nameQuery.length >= 2 && acResults.length === 0
              const availableNets = expert
                ? Object.entries(expert.network_prices ?? {}).filter(([, v]) => v != null).map(([k]) => k)
                : []
              return (
                <tr key={draft.id} className="border-b border-primary/20 bg-primary/5">
                  {/* Status */}
                  <td className="sticky left-0 z-10 bg-primary/5 px-3 py-2">
                    <select
                      value={draft.status}
                      onChange={(e) => updateDraft(draft.id, { status: e.target.value as EngagementStatus })}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring ${STATUS_COLORS[draft.status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>

                  {COLUMNS.map((col) => {
                    /* Name -- autocomplete */
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
                                {acResults.map((exp) => {
                                  const hasWarnings = (exp.compliance_flags ?? []).some((f) => WARNING_FLAGS.includes(f))
                                  return (
                                    <button
                                      key={`${exp.name}-${exp.company}`}
                                      type="button"
                                      onClick={() => handleDraftSelectExpert(draft, exp)}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent"
                                    >
                                      <span className="font-medium text-foreground">{exp.name}</span>
                                      <span className="truncate text-muted-foreground">{exp.company}</span>
                                      {hasWarnings && <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" title="Compliance warning" />}
                                      {(exp.compliance_flags ?? []).includes("cid_cleared") && (
                                        <span className="shrink-0 text-[9px] font-semibold text-emerald-600" title="CID Cleared">CID</span>
                                      )}
                                      <span className={`ml-auto shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[exp.expert_type] ?? ""}`}>
                                        {TYPE_LABELS[exp.expert_type] ?? exp.expert_type}
                                      </span>
                                    </button>
                                  )
                                })}
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

                    /* Network selector */
                    if (col.key === "network") {
                      return (
                        <td key={col.key} className="px-3 py-2">
                          {expert && availableNets.length > 0 ? (
                            <select
                              value={draft.network}
                              onChange={(e) => updateDraft(draft.id, { network: e.target.value })}
                              className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              {availableNets.map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                          ) : (
                            <span className="text-muted-foreground/40">--</span>
                          )}
                        </td>
                      )
                    }

                    /* Date */
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

                    /* Duration -- 15-min interval dropdown */
                    if (col.key === "duration") {
                      return (
                        <td key={col.key} className="px-3 py-2 text-center">
                          <select
                            value={draft.durationMinutes}
                            onChange={(e) => updateDraft(draft.id, { durationMinutes: parseInt(e.target.value) })}
                            className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {DURATION_OPTIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
                          </select>
                        </td>
                      )
                    }

                    /* Follow-up toggle */
                    if (col.key === "follow_up") {
                      return (
                        <td key={col.key} className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => updateDraft(draft.id, { isFollowUp: !draft.isFollowUp })}
                            className={[
                              "inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors",
                              draft.isFollowUp
                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                : "border-border bg-card text-muted-foreground hover:bg-accent",
                            ].join(" ")}
                            title={draft.isFollowUp ? "Follow-up (25% discount)" : "Mark as follow-up"}
                          >
                            <RotateCcw className="h-3 w-3" />
                            {draft.isFollowUp ? "Yes" : "No"}
                          </button>
                        </td>
                      )
                    }

                    /* Hourly rate preview */
                    if (col.key === "hourly_rate") {
                      return (
                        <td key={col.key} className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {draftRatePreview(draft)}
                        </td>
                      )
                    }

                    /* Cost preview */
                    if (col.key === "cost") {
                      return (
                        <td key={col.key} className="px-3 py-2 text-right">
                          <span className="font-medium tabular-nums">{draftCostPreview(draft)}</span>
                        </td>
                      )
                    }

                    /* Type badge */
                    if (col.key === "expert_type" && expert) {
                      const label = TYPE_LABELS[expert.expert_type] ?? expert.expert_type
                      const color = TYPE_COLORS[expert.expert_type] ?? "bg-muted text-muted-foreground"
                      return <td key={col.key} className="px-3 py-2"><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>{label}</span></td>
                    }

                    /* Auto-filled text fields */
                    if (col.key === "expert_role") return <td key={col.key} className="px-3 py-2 text-muted-foreground">{expert ? (expert.original_role ?? expert.role) : "--"}</td>
                    if (col.key === "anonymised_role") return <td key={col.key} className="px-3 py-2 text-muted-foreground">{expert?.role ?? "--"}</td>
                    if (col.key === "expert_company") return <td key={col.key} className="px-3 py-2 text-muted-foreground">{expert?.company ?? "--"}</td>

                    return <td key={col.key} className="px-3 py-2 text-muted-foreground/40">--</td>
                  })}

                  {/* Notes -- blank */}
                  <td className="px-3 py-2 text-muted-foreground/40 italic">--</td>
                  {/* Transcript -- not available for drafts */}
                  <td className="px-3 py-2 text-center text-muted-foreground/40 italic">--</td>
                  {/* Actions */}
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => commitDraft(draft)} disabled={!draft.expert || !draft.network} className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:pointer-events-none" title="Confirm">
                        <Check className="h-3 w-3" />
                      </button>
                      <button type="button" onClick={() => removeDraft(draft.id)} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent" title="Cancel">
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
                <td colSpan={COLUMNS.length + 4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {records.length === 0
                    ? `No ${engagementType === "call" ? "calls" : "surveys"} recorded yet. Click "${engagementType === "call" ? "Add Call" : "Add Survey"}" to get started.`
                    : "No results match the current filters."}
                </td>
              </tr>
            ) : (
              sorted.map((r) => {
                const globalIdx = findOriginalIndex(r)
                const isEditingN = editingNotes === globalIdx
                const availableNets = Object.entries(r.network_prices ?? {}).filter(([, v]) => v != null).map(([k]) => k)
                return (
                  <tr key={r.id} className="border-b border-border last:border-0 transition-colors hover:bg-accent/30">
                    {/* Status */}
                    <td className="sticky left-0 z-10 bg-card px-3 py-2">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r, e.target.value as EngagementStatus)}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-ring ${STATUS_COLORS[r.status]}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>

                    {COLUMNS.map((col) => {
                      /* Network selector */
                      if (col.key === "network") {
                        return (
                          <td key={col.key} className="px-3 py-2">
                            {availableNets.length > 1 ? (
                              <select
                                value={r.network}
                                onChange={(e) => handleNetworkChange(r, e.target.value)}
                                className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              >
                                {availableNets.map((n) => <option key={n} value={n}>{n}</option>)}
                              </select>
                            ) : (
                              <span className="text-xs">{r.network || "--"}</span>
                            )}
                          </td>
                        )
                      }

                      /* Date -- click to edit */
                      if (col.key === "date") {
                        if (editingDate === globalIdx) {
                          return (
                            <td key={col.key} className="px-3 py-2">
                              <input
                                type="date"
                                defaultValue={r.date}
                                autoFocus
                                className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                onBlur={(e) => { if (e.target.value) onUpdateRecord(globalIdx, { date: e.target.value }); setEditingDate(null) }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value; if (v) onUpdateRecord(globalIdx, { date: v }); setEditingDate(null) }
                                  if (e.key === "Escape") setEditingDate(null)
                                }}
                              />
                            </td>
                          )
                        }
                        return (
                          <td key={col.key} className="px-3 py-2">
                            <button type="button" onClick={() => setEditingDate(globalIdx)} className="text-left underline-offset-2 hover:underline" title="Click to edit date">
                              {formatDate(r.date)}
                            </button>
                          </td>
                        )
                      }

                      /* Duration -- 15-min dropdown */
                      if (col.key === "duration") {
                        return (
                          <td key={col.key} className="px-3 py-2 text-center">
                            <select
                              value={r.duration_minutes || 60}
                              onChange={(e) => handleDurationChange(r, parseInt(e.target.value))}
                              className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              {DURATION_OPTIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
                            </select>
                          </td>
                        )
                      }

                      /* Follow-up toggle */
                      if (col.key === "follow_up") {
                        return (
                          <td key={col.key} className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleFollowUpToggle(r)}
                              className={[
                                "inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors",
                                r.is_follow_up
                                  ? "border-blue-300 bg-blue-50 text-blue-700"
                                  : "border-border bg-card text-muted-foreground hover:bg-accent",
                              ].join(" ")}
                              title={r.is_follow_up ? "Follow-up (25% discount)" : "Mark as follow-up"}
                            >
                              <RotateCcw className="h-3 w-3" />
                              {r.is_follow_up ? "Yes" : "No"}
                            </button>
                          </td>
                        )
                      }

                      /* Hourly rate */
                      if (col.key === "hourly_rate") {
                        const rate = r.network_prices?.[r.network]
                        return (
                          <td key={col.key} className="px-3 py-2 text-right tabular-nums">
                            {rate != null ? (engagementType === "survey" ? `\u20AC${rate}` : `$${rate}`) : <span className="text-muted-foreground/40">--</span>}
                          </td>
                        )
                      }

                      /* Computed cost */
                      if (col.key === "cost") {
                        const costStr = engagementType === "call" ? formatCallCost(r) : formatSurveyCost(r)
                        return (
                          <td key={col.key} className="px-3 py-2 text-right">
                            <span className="font-medium tabular-nums">{costStr}</span>
                          </td>
                        )
                      }

                      /* Type badge */
                      if (col.key === "expert_type") {
                        const label = TYPE_LABELS[r.expert_type] ?? r.expert_type
                        const color = TYPE_COLORS[r.expert_type] ?? "bg-muted text-muted-foreground"
                        return <td key={col.key} className="px-3 py-2"><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>{label}</span></td>
                      }

                      /* Text fields */
                      const v = accessor(r, col.key)
                      if (v == null) return <td key={col.key} className="px-3 py-2"><span className="text-muted-foreground/40">--</span></td>
                      const s = String(v)
                      return <td key={col.key} className="px-3 py-2">{s.length > 60 ? <span title={s}>{s.slice(0, 57)}...</span> : s}</td>
                    })}

                    {/* Notes */}
                    <td className="px-3 py-2">
                      {isEditingN ? (
                        <div className="flex items-start gap-1">
                          <textarea value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} rows={2} className="flex-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" autoFocus />
                          <button type="button" onClick={() => handleNotesCommit(r)} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"><Check className="h-3 w-3" /></button>
                          <button type="button" onClick={() => setEditingNotes(null)} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => { setEditingNotes(globalIdx); setDraftNotes(r.notes) }} className="group flex items-center gap-1 text-left">
                          {r.notes ? <span className="max-w-[200px] truncate" title={r.notes}>{r.notes}</span> : <span className="text-muted-foreground/40 italic">Add note</span>}
                          <StickyNote className="h-3 w-3 shrink-0 text-muted-foreground/40 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                    </td>

                    {/* Transcript */}
                    <td className="px-3 py-2 text-center">
                      {transcriptIds.has(r.id) ? (
                        <button
                          type="button"
                          onClick={() => openTranscriptView(r)}
                          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <FileText className="h-3 w-3" />
                          View
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openTranscriptUpload(r)}
                          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Upload className="h-3 w-3" />
                          Upload
                        </button>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="px-2 py-2">
                      {onRemoveRecord && (
                        <button type="button" onClick={() => onRemoveRecord(globalIdx)} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive" title="Remove">
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

      {/* ---- Compliance Warning Modal ---- */}
      <Modal
        open={warningDraft !== null}
        onClose={dismissWarning}
        title="Compliance Warning"
        description={
          warningDraft?.expert
            ? `${warningDraft.expert.name} -- ${warningDraft.expert.original_role ?? warningDraft.expert.role} at ${warningDraft.expert.company}`
            : undefined
        }
        maxWidth="max-w-md"
      >
        {warningDraft && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {warningFlags.map((flag) => {
                const meta = FLAG_META[flag]
                if (!meta) return null
                const IconComp = meta.Icon
                const borderColor = meta.severity === "danger" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                const textColor = meta.severity === "danger" ? "text-red-800" : "text-amber-800"
                const iconColor = meta.severity === "danger" ? "text-red-600" : "text-amber-600"
                return (
                  <div key={flag} className={`flex items-start gap-3 rounded-md border p-3 ${borderColor}`}>
                    <IconComp className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                    <div>
                      <p className={`text-xs font-semibold ${textColor}`}>{meta.label}</p>
                      <p className={`mt-0.5 text-xs leading-relaxed ${textColor} opacity-80`}>{meta.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Do you want to override this warning and proceed with adding the{" "}
              {engagementType === "call" ? "call" : "survey"}, or discard it?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={dismissWarning} className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">Discard</button>
              <button type="button" onClick={overrideWarning} className="h-8 rounded-md bg-amber-600 px-3 text-xs font-medium text-card transition-colors hover:bg-amber-700">Override & Add</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---- Transcript Modal ---- */}
      <Modal
        open={transcriptModal !== null}
        onClose={() => { setTranscriptModal(null); setTranscriptText("") }}
        title={
          transcriptModal?.mode === "view"
            ? "View Transcript"
            : "Upload Transcript"
        }
        description={
          transcriptModal
            ? `${transcriptModal.record.expert_name} -- ${transcriptModal.record.expert_role} at ${transcriptModal.record.expert_company}`
            : undefined
        }
        maxWidth="max-w-2xl"
      >
        {transcriptModal && transcriptModal.mode === "upload" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Paste the transcript text below. This will be stored and linked to{" "}
              <span className="font-medium text-foreground">{transcriptModal.record.expert_name}</span>{" "}
              ({TYPE_LABELS[transcriptModal.record.expert_type] ?? transcriptModal.record.expert_type}).
            </p>
            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              rows={12}
              placeholder="Paste transcript text here..."
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setTranscriptModal(null); setTranscriptText("") }}
                className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTranscriptSave}
                disabled={!transcriptText.trim()}
                className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none"
              >
                Save Transcript
              </button>
            </div>
          </div>
        )}

        {transcriptModal && transcriptModal.mode === "view" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[transcriptModal.record.expert_type] ?? ""}`}>
                {TYPE_LABELS[transcriptModal.record.expert_type] ?? transcriptModal.record.expert_type}
              </span>
              <span>{formatDate(transcriptModal.record.date)}</span>
              {transcriptModal.record.duration_minutes > 0 && (
                <span>{transcriptModal.record.duration_minutes} min</span>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border bg-muted/30 px-4 py-3">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">
                {transcriptText}
              </pre>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTranscriptModal({ mode: "upload", record: transcriptModal.record })
                }}
                className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Replace Transcript
              </button>
              <button
                type="button"
                onClick={() => { setTranscriptModal(null); setTranscriptText("") }}
                className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
