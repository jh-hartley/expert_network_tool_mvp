"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Star,
  ShieldCheck,
  ShieldAlert,
  StickyNote,
  Check,
  X,
  AlertTriangle,
  Briefcase,
} from "lucide-react"
import type { ExpertProfile, ExpertLens, ComplianceFlag } from "@/lib/expert-profiles"
import { getNetworks, PROJECT_CONTEXT } from "@/lib/expert-profiles"
import Modal from "./modal"

/* ------------------------------------------------------------------ */
/*  Lens definitions                                                   */
/* ------------------------------------------------------------------ */

export type { ExpertLens }

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
  {
    key: "competitor_customer",
    label: "Competitor Customers",
    shortLabel: "Comp. Customers",
  },
]

/* ------------------------------------------------------------------ */
/*  Column definitions                                                 */
/* ------------------------------------------------------------------ */

interface ColDef {
  key: string
  label: string
  accessor: (e: ExpertProfile) => string | number | null
  className?: string
  minWidth?: string
}

/* -- Shared columns (appear in every lens, before screeners) ------- */
const SHARED_COLS: ColDef[] = [
  { key: "name", label: "Name", accessor: (e) => e.name, minWidth: "140px" },
  {
    key: "original_role",
    label: "Role",
    accessor: (e) => e.original_role,
    minWidth: "180px",
  },
  {
    key: "role",
    label: "Anonymised Role",
    accessor: (e) => e.role,
    minWidth: "170px",
  },
  {
    key: "company",
    label: "Company",
    accessor: (e) => e.company,
    minWidth: "140px",
  },
  {
    key: "former",
    label: "Former?",
    accessor: (e) => (e.former ? "Yes" : "No"),
    minWidth: "70px",
  },
  {
    key: "date_left",
    label: "Date Left",
    accessor: (e) => e.date_left,
    minWidth: "90px",
  },
  {
    key: "industry_guess",
    label: "Industry",
    accessor: (e) => e.industry_guess,
    minWidth: "140px",
  },
  {
    key: "fte_estimate",
    label: "Est. FTEs",
    accessor: (e) => e.fte_estimate,
    minWidth: "100px",
  },
]

/* -- Customer screener columns ------------------------------------- */
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

/* -- Competitor / Target screener columns -------------------------- */
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

/** Per-network price columns (rendered on the far right) */
function networkPriceCols(experts: ExpertProfile[]): ColDef[] {
  return getNetworks(experts).map((n) => ({
    key: `price_${n}`,
    label: `${n} ($/hr)`,
    accessor: (e: ExpertProfile) => e.network_prices?.[n] ?? null,
    className: "text-right",
    minWidth: "110px",
  }))
}

function getColumnsForLens(lens: ExpertLens, experts: ExpertProfile[]): ColDef[] {
  const net = networkPriceCols(experts)
  switch (lens) {
    case "customer":
    case "competitor_customer":
      return [...SHARED_COLS, ...CUSTOMER_SCREENER_COLS, ADDITIONAL_COL, ...net]
    case "competitor":
    case "target":
      return [
        ...SHARED_COLS,
        ...COMPETITOR_SCREENER_COLS,
        ADDITIONAL_COL,
        ...net,
      ]
    case "all":
    default:
      return [
        ...SHARED_COLS.slice(0, 4), // Name, Role, Anon Role, Company
        {
          key: "expert_type",
          label: "Type",
          accessor: (e) => TYPE_LABELS[e.expert_type] ?? e.expert_type,
          minWidth: "120px",
        },
        ...SHARED_COLS.slice(4), // Former, Date Left, Industry, FTEs
        ADDITIONAL_COL,
        ...net,
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
/*  Compliance flag display config                                     */
/* ------------------------------------------------------------------ */

const COMPLIANCE_FLAG_CONFIG: Record<
  ComplianceFlag,
  { label: string; description: string; color: string; Icon: typeof AlertTriangle }
> = {
  cid_cleared: {
    label: "CID Cleared",
    description: "CID clearance has been granted for this expert.",
    color: "border-emerald-300 bg-emerald-50 text-emerald-700",
    Icon: ShieldCheck,
  },
  ben_advisor: {
    label: "BAN Advisor",
    description: "This expert is registered as a BAN (Bain Advisor Network) advisor. Additional compliance review may be required before engagement.",
    color: "border-amber-300 bg-amber-50 text-amber-700",
    Icon: AlertTriangle,
  },
  compliance_flagged: {
    label: "Compliance Flag",
    description: "Compliance has flagged this expert as potentially fraudulent. Do not proceed without explicit compliance team approval.",
    color: "border-red-300 bg-red-50 text-red-700",
    Icon: ShieldAlert,
  },
  client_advisor: {
    label: "Client Advisor",
    description: "This expert is a current client advisor. Engaging may create a conflict of interest. Check with the engagement manager.",
    color: "border-orange-300 bg-orange-50 text-orange-700",
    Icon: Briefcase,
  },
}

/* ------------------------------------------------------------------ */
/*  CID justification generator                                        */
/* ------------------------------------------------------------------ */

function generateCidJustification(expert: ExpertProfile): string {
  const ctx = PROJECT_CONTEXT
  const typeLabel = TYPE_LABELS[expert.expert_type] ?? expert.expert_type

  let purposeClause: string
  switch (expert.expert_type) {
    case "customer":
      purposeClause = `survey customers of ${expert.industry_guess.toLowerCase()} companies to understand vendor evaluation criteria, satisfaction levels, and switching dynamics in the industrial controls market`
      break
    case "competitor":
      purposeClause = `better understand the competitive landscape, pricing dynamics, and strategic direction within the industrial controls and automation sector`
      break
    case "target":
      purposeClause = `gather perspectives from former employees of the target company on operational capabilities, product roadmap, and market positioning, subject to compliance review`
      break
    case "competitor_customer":
      purposeClause = `assess customer sentiment toward competing vendors in the industrial controls space to benchmark service quality and switching behaviour`
      break
    default:
      purposeClause = `conduct expert consultations to support the commercial due diligence workstream`
  }

  return [
    `CASE INFORMATION`,
    `Case Leader: ${ctx.caseLeader}`,
    `Senior Manager: ${ctx.seniorManager}`,
    `Project: ${ctx.projectName}`,
    ``,
    `PROJECT DESCRIPTION`,
    ctx.projectDescription,
    ``,
    `EXPERT DETAILS`,
    `Name: ${expert.name}`,
    `Role: ${expert.original_role}`,
    `Company: ${expert.company}`,
    `Expert Type: ${typeLabel}`,
    `Former Employee: ${expert.former ? "Yes" : "No"}${expert.former && expert.date_left !== "N/A" ? ` (departed ${expert.date_left})` : ""}`,
    ``,
    `JUSTIFICATION FOR SPEAKING`,
    `The team is seeking to ${purposeClause}. ${expert.name}, ${expert.former ? "formerly" : "currently"} serving as ${expert.original_role} at ${expert.company}, has relevant experience that can inform the due diligence analysis.${
      expert.expert_type === "target"
        ? " Note: this individual is a former employee of the target company. CID clearance is required before any contact is made."
        : ""
    }`,
  ].join("\n")
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ExpertLensTableProps {
  experts: ExpertProfile[]
  onUpdateExpert: (index: number, updates: Partial<ExpertProfile>) => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ExpertLensTable({
  experts,
  onUpdateExpert,
}: ExpertLensTableProps) {
  const [lens, setLens] = useState<ExpertLens>("all")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false)

  // CID modal state
  const [cidModalOpen, setCidModalOpen] = useState(false)
  const [cidExpert, setCidExpert] = useState<ExpertProfile | null>(null)
  const cidJustification = useMemo(
    () => (cidExpert ? generateCidJustification(cidExpert) : ""),
    [cidExpert],
  )

  // Notes editing state
  const [editingNotesIdx, setEditingNotesIdx] = useState<number | null>(null)
  const [notesDraft, setNotesDraft] = useState("")
  const notesInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setSortKey(null)
  }, [lens])

  useEffect(() => {
    if (editingNotesIdx !== null) {
      notesInputRef.current?.focus()
    }
  }, [editingNotesIdx])

  const columns = useMemo(() => getColumnsForLens(lens, experts), [lens, experts])

  const counts = useMemo(() => {
    const map: Record<ExpertLens, number> = {
      all: experts.length,
      customer: 0,
      competitor: 0,
      target: 0,
      competitor_customer: 0,
    }
    experts.forEach((e) => {
      if (e.expert_type in map) map[e.expert_type as ExpertLens]++
    })
    return map
  }, [experts])

  const shortlistedCount = useMemo(
    () => experts.filter((e) => e.shortlisted).length,
    [experts],
  )

  // Filter
  const filtered = useMemo(() => {
    let list =
      lens === "all"
        ? experts
        : experts.filter((e) => e.expert_type === lens)
    if (showShortlistedOnly) list = list.filter((e) => e.shortlisted)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.company.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.original_role.toLowerCase().includes(q) ||
          e.industry_guess.toLowerCase().includes(q),
      )
    }
    return list
  }, [experts, lens, search, showShortlistedOnly])

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
      if (typeof aVal === "number" && typeof bVal === "number")
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
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

  /** Find the original index in the full `experts` array */
  const findOriginalIndex = useCallback(
    (expert: ExpertProfile) =>
      experts.findIndex(
        (e) => e.name === expert.name && e.company === expert.company,
      ),
    [experts],
  )

  const toggleShortlist = useCallback(
    (expert: ExpertProfile) => {
      const idx = findOriginalIndex(expert)
      if (idx >= 0) onUpdateExpert(idx, { shortlisted: !expert.shortlisted })
    },
    [findOriginalIndex, onUpdateExpert],
  )

  const openCidModal = useCallback((expert: ExpertProfile) => {
    setCidExpert(expert)
    setCidModalOpen(true)
  }, [])

  const confirmCid = useCallback(() => {
    if (!cidExpert) return
    const idx = findOriginalIndex(cidExpert)
    if (idx >= 0) onUpdateExpert(idx, { cid_clearance_requested: true })
    setCidModalOpen(false)
    setCidExpert(null)
  }, [cidExpert, findOriginalIndex, onUpdateExpert])

  const startEditingNotes = useCallback(
    (expert: ExpertProfile) => {
      const idx = findOriginalIndex(expert)
      setEditingNotesIdx(idx)
      setNotesDraft(expert.notes)
    },
    [findOriginalIndex],
  )

  const saveNotes = useCallback(() => {
    if (editingNotesIdx !== null) {
      onUpdateExpert(editingNotesIdx, { notes: notesDraft })
    }
    setEditingNotesIdx(null)
    setNotesDraft("")
  }, [editingNotesIdx, notesDraft, onUpdateExpert])

  const cancelNotes = useCallback(() => {
    setEditingNotesIdx(null)
    setNotesDraft("")
  }, [])

  return (
    <div>
      {/* ---- Top bar: lens tabs + shortlist toggle + search ---- */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Lens tabs */}
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Expert type filter"
          >
            {LENSES.map((l) => {
              const isActive = lens === l.key
              const count = counts[l.key]
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

          {/* Right side: shortlist toggle + search */}
          <div className="flex items-center gap-3">
            {/* Shortlist toggle */}
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                role="switch"
                aria-checked={showShortlistedOnly}
                  onClick={() => {
                    setShowShortlistedOnly((v) => !v)
                  }}
                className={[
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                  showShortlistedOnly ? "bg-primary" : "bg-muted",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-3.5 w-3.5 rounded-full bg-card shadow-sm transition-transform",
                    showShortlistedOnly ? "translate-x-[18px]" : "translate-x-[3px]",
                  ].join(" ")}
                />
              </button>
              <span>
                Shortlisted only
                {shortlistedCount > 0 && (
                  <span className="ml-1 text-[10px] font-semibold text-primary">
                    ({shortlistedCount})
                  </span>
                )}
              </span>
            </label>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                  }}
                placeholder="Search name, company, role..."
                className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring sm:w-56"
                aria-label="Search experts"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {/* Actions header */}
                <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ minWidth: "130px" }}>
                  Actions
                </th>
                {/* Notes header */}
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ minWidth: "160px" }}>
                  Notes
                </th>
                {/* Data columns */}
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
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {showShortlistedOnly
                      ? "No shortlisted experts in this view."
                      : search
                        ? "No experts match your search."
                        : "No experts in this category."}
                  </td>
                </tr>
              ) : (
                sorted.map((expert) => {
                  const origIdx = findOriginalIndex(expert)
                  const isEditingNotes = editingNotesIdx === origIdx
                  return (
                    <tr
                      key={`${expert.name}-${expert.company}`}
                      className={[
                        "transition-colors hover:bg-muted/30",
                        expert.shortlisted ? "bg-primary/[0.03]" : "",
                      ].join(" ")}
                    >
                      {/* ---- Actions cell ---- */}
                      <td className="sticky left-0 z-10 bg-card px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          {/* Shortlist button */}
                          <button
                            type="button"
                            onClick={() => toggleShortlist(expert)}
                            title={
                              expert.shortlisted
                                ? "Remove from shortlist"
                                : "Add to shortlist"
                            }
                            className={[
                              "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors",
                              expert.shortlisted
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                            ].join(" ")}
                          >
                            <Star
                              className={[
                                "h-3 w-3",
                                expert.shortlisted ? "fill-primary" : "",
                              ].join(" ")}
                            />
                            <span className="sr-only sm:not-sr-only">
                              {expert.shortlisted ? "Listed" : "Shortlist"}
                            </span>
                          </button>

                          {/* CID clearance button */}
                          {expert.compliance_flags?.includes("cid_cleared") ? (
                            <span
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 text-[11px] font-medium text-emerald-700"
                              title="CID clearance granted"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span className="sr-only sm:not-sr-only">Cleared</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openCidModal(expert)}
                              title={
                                expert.cid_clearance_requested
                                  ? "CID clearance requested (pending)"
                                  : "Request CID clearance"
                              }
                              className={[
                                "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors",
                                expert.cid_clearance_requested
                                  ? "border-sky-300 bg-sky-50 text-sky-700"
                                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                              ].join(" ")}
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span className="sr-only sm:not-sr-only">
                                {expert.cid_clearance_requested ? "Pending" : "CID"}
                              </span>
                            </button>
                          )}

                          {/* Compliance warning badges */}
                          {(expert.compliance_flags ?? [])
                            .filter((f) => f !== "cid_cleared")
                            .map((flag) => {
                              const cfg = COMPLIANCE_FLAG_CONFIG[flag]
                              if (!cfg) return null
                              const IconComp = cfg.Icon
                              return (
                                <span
                                  key={flag}
                                  title={`${cfg.label}: ${cfg.description}`}
                                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium ${cfg.color}`}
                                >
                                  <IconComp className="h-3 w-3 shrink-0" />
                                  <span className="sr-only sm:not-sr-only">{cfg.label}</span>
                                </span>
                              )
                            })}
                        </div>
                      </td>

                      {/* ---- Notes cell ---- */}
                      <td className="px-3 py-2" style={{ minWidth: "160px" }}>
                        {isEditingNotes ? (
                          <div className="flex flex-col gap-1">
                            <textarea
                              ref={notesInputRef}
                              value={notesDraft}
                              onChange={(e) => setNotesDraft(e.target.value)}
                              rows={2}
                              className="w-full resize-none rounded border border-ring bg-background px-2 py-1 text-xs text-foreground outline-none"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNotes()
                                if (e.key === "Escape") cancelNotes()
                              }}
                            />
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={saveNotes}
                                className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground"
                                aria-label="Save note"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelNotes}
                                className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-muted-foreground"
                                aria-label="Cancel editing"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditingNotes(expert)}
                            className="group flex w-full items-start gap-1.5 rounded px-1 py-0.5 text-left text-xs transition-colors hover:bg-muted/50"
                            title="Click to edit notes"
                          >
                            <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
                            {expert.notes ? (
                              <span className="line-clamp-2 text-foreground">
                                {expert.notes}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40 italic">
                                Add note...
                              </span>
                            )}
                          </button>
                        )}
                      </td>

                      {/* ---- Data cells ---- */}
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
                            <CellRenderer
                              value={value}
                              colKey={col.key}
                              expert={expert}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Row count footer */}
        <div className="border-t border-border px-4 py-2">
          <p className="text-[11px] text-muted-foreground">
            {sorted.length} expert{sorted.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Footer stats */}
      {filtered.length > 0 && filtered.length !== experts.length && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Showing {filtered.length} of {experts.length} experts
        </p>
      )}

      {/* ---- CID Clearance Modal ---- */}
      <Modal
        open={cidModalOpen}
        onClose={() => {
          setCidModalOpen(false)
          setCidExpert(null)
        }}
        title="Request CID Clearance"
        description={
          cidExpert
            ? `${cidExpert.name} -- ${cidExpert.original_role} at ${cidExpert.company}`
            : undefined
        }
        maxWidth="max-w-lg"
      >
        {cidExpert && (
          <div className="flex flex-col gap-4">
            <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-4 text-xs leading-relaxed text-foreground">
              {cidJustification}
            </pre>

            {cidExpert.cid_clearance_requested && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                CID clearance has already been requested for this expert.
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCidModalOpen(false)
                  setCidExpert(null)
                }}
                className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
              {!cidExpert.cid_clearance_requested && (
                <button
                  type="button"
                  onClick={confirmCid}
                  className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Confirm CID Request
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cell renderer                                                      */
/* ------------------------------------------------------------------ */

function CellRenderer({
  value,
  colKey,
  expert,
}: {
  value: string | number | null
  colKey: string
  expert: ExpertProfile
}) {
  if (value == null) {
    return <span className="text-muted-foreground/50">--</span>
  }

  // Network price columns
  if (colKey.startsWith("price_") && typeof value === "number") {
    return <span className="tabular-nums">${value.toLocaleString()}</span>
  }

  // Former? badge
  if (colKey === "former") {
    const isFormer = value === "Yes"
    return (
      <span
        className={[
          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
          isFormer
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700",
        ].join(" ")}
      >
        {String(value)}
      </span>
    )
  }

  // Expert type badges (All view)
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

  // Long text cells
  const isScreener =
    colKey.startsWith("screener_") || colKey === "additional_info"
  if (isScreener && typeof value === "string" && value.length > 120) {
    return (
      <span className="line-clamp-3 text-xs leading-relaxed" title={value}>
        {value}
      </span>
    )
  }

  // Shortlisted name highlight
  if (colKey === "name" && expert.shortlisted) {
    return (
      <span className="flex items-center gap-1.5 font-medium">
        <Star className="h-3 w-3 fill-primary text-primary" />
        {String(value)}
      </span>
    )
  }

  return <span>{String(value)}</span>
}
