"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import PageHeader from "@/app/components/page-header"
import {
  ArrowRight,
  Copy,
  Check,
  Download,
  Pencil,
  X,
} from "lucide-react"
import { getCalls, getSurveys } from "@/lib/engagements"
import type { EngagementRecord } from "@/lib/engagements"
import { getExpertProfiles, saveExpertProfiles } from "@/lib/expert-profiles"
import type { ExpertProfile, ExpertLens } from "@/lib/expert-profiles"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AnonymisedSource {
  /** Lowercase key for matching back to ExpertProfile */
  nameKey: string
  /** Original values */
  realName: string
  realRole: string
  realCompany: string
  expertType: string
  /** Whether the role contains "Former" */
  isFormer: boolean
  /** Anonymised values */
  anonRole: string
  anonCompany: string
  /** Full anonymised line for export */
  anonLine: string
  /** Earliest engagement date for this expert (for ordering) */
  firstDate: string
}

/* ------------------------------------------------------------------ */
/*  Anonymisation engine                                               */
/* ------------------------------------------------------------------ */

type CategoryKey = "customer" | "competitor" | "competitor_customer"

function mapTypeToCategory(expertType: string): CategoryKey {
  if (expertType === "target") return "competitor" // target = competitor (too on the nose)
  if (expertType === "competitor_customer") return "competitor_customer"
  if (expertType === "competitor") return "competitor"
  return "customer"
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  customer: "Customer",
  competitor: "Competitor",
  competitor_customer: "Competitor Customer",
}

function buildAnonymisedSources(
  calls: EngagementRecord[],
  surveys: EngagementRecord[],
): AnonymisedSource[] {
  // Combine all engagements and sort by date (earliest first) for numbering
  const all = [...calls, ...surveys].sort(
    (a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at),
  )

  // Assign company numbers per category, first-come-first-served by earliest engagement
  const companyNumbers: Record<CategoryKey, Map<string, number>> = {
    customer: new Map(),
    competitor: new Map(),
    competitor_customer: new Map(),
  }

  for (const eng of all) {
    const cat = mapTypeToCategory(eng.expert_type)
    const companyKey = eng.expert_company.toLowerCase()
    if (!companyNumbers[cat].has(companyKey)) {
      companyNumbers[cat].set(companyKey, companyNumbers[cat].size + 1)
    }
  }

  // Deduplicate by expert name (take the first/earliest engagement per person)
  const seen = new Map<string, EngagementRecord>()
  for (const eng of all) {
    const key = eng.expert_name.toLowerCase()
    if (!seen.has(key)) seen.set(key, eng)
  }

  // Build anonymised entries
  const sources: AnonymisedSource[] = []
  for (const eng of seen.values()) {
    const cat = mapTypeToCategory(eng.expert_type)
    const companyKey = eng.expert_company.toLowerCase()
    const num = companyNumbers[cat].get(companyKey) ?? 1
    const anonCompany = `${CATEGORY_LABELS[cat]} #${num}`

    const isFormer = /\bformer\b/i.test(eng.expert_role)
    // Avoid double "Former" if the anonymised role already starts with it
    const anonRoleBase = eng.anonymised_role.replace(/^Former\s+/i, "")
    const anonRole = isFormer
      ? `Former ${anonRoleBase}`
      : eng.anonymised_role

    sources.push({
      nameKey: eng.expert_name.toLowerCase(),
      realName: eng.expert_name,
      realRole: eng.expert_role,
      realCompany: eng.expert_company,
      expertType: eng.expert_type,
      isFormer,
      anonRole,
      anonCompany,
      anonLine: `${anonRole}, ${anonCompany}`,
      firstDate: eng.date,
    })
  }

  // Sort by date then by category for a logical ordering
  sources.sort((a, b) => a.firstDate.localeCompare(b.firstDate))

  return sources
}

/* ------------------------------------------------------------------ */
/*  Filter tabs                                                        */
/* ------------------------------------------------------------------ */

type FilterLens = "all" | CategoryKey

const FILTER_TABS: { key: FilterLens; label: string }[] = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "competitor", label: "Competitors" },
  { key: "competitor_customer", label: "Comp. Customers" },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SourcesPage() {
  const [filter, setFilter] = useState<FilterLens>("all")
  const [copied, setCopied] = useState<"all" | "filtered" | null>(null)

  // Role editing state
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [roleDraft, setRoleDraft] = useState("")
  const roleInputRef = useRef<HTMLInputElement>(null)
  const [version, setVersion] = useState(0) // bump to force re-derive sources

  useEffect(() => {
    if (editingKey !== null) {
      roleInputRef.current?.focus()
      roleInputRef.current?.select()
    }
  }, [editingKey])

  const startEditing = useCallback((source: AnonymisedSource) => {
    setEditingKey(source.nameKey)
    setRoleDraft(source.anonRole)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingKey(null)
    setRoleDraft("")
  }, [])

  const saveEditing = useCallback(() => {
    if (editingKey === null || !roleDraft.trim()) {
      cancelEditing()
      return
    }
    // Update the ExpertProfile.role in localStorage
    const profiles = getExpertProfiles()
    const idx = profiles.findIndex((p) => p.name.toLowerCase() === editingKey)
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], role: roleDraft.trim() }
      saveExpertProfiles(profiles)
    }
    setEditingKey(null)
    setRoleDraft("")
    setVersion((v) => v + 1) // force re-derive
  }, [editingKey, roleDraft, cancelEditing])

  const sources = useMemo(() => {
    void version // dependency to force re-derive after edits
    const calls = getCalls()
    const surveys = getSurveys()

    // Also pull the latest expert profiles so we pick up role edits
    const profiles = getExpertProfiles()
    const profileRoleMap = new Map<string, string>()
    for (const p of profiles) {
      profileRoleMap.set(p.name.toLowerCase(), p.role)
    }

    const raw = buildAnonymisedSources(calls, surveys)

    // Overlay latest profile roles onto the derived sources
    for (const s of raw) {
      const latestRole = profileRoleMap.get(s.nameKey)
      if (latestRole && latestRole !== s.anonRole) {
        s.anonRole = latestRole
        s.anonLine = `${latestRole}, ${s.anonCompany}`
      }
    }

    return raw
  }, [version])

  const filtered = useMemo(() => {
    if (filter === "all") return sources
    return sources.filter((s) => mapTypeToCategory(s.expertType) === filter)
  }, [sources, filter])

  // Count per category
  const counts = useMemo(() => {
    const c: Record<FilterLens, number> = { all: sources.length, customer: 0, competitor: 0, competitor_customer: 0 }
    for (const s of sources) {
      const cat = mapTypeToCategory(s.expertType)
      c[cat]++
    }
    return c
  }, [sources])

  const buildClipboardText = useCallback(
    (items: AnonymisedSource[]) => {
      // Group by category for structured output
      const grouped: Record<CategoryKey, AnonymisedSource[]> = {
        customer: [],
        competitor: [],
        competitor_customer: [],
      }
      for (const s of items) {
        grouped[mapTypeToCategory(s.expertType)].push(s)
      }

      const sections: string[] = []
      for (const [cat, label] of Object.entries(CATEGORY_LABELS) as [CategoryKey, string][]) {
        const group = grouped[cat]
        if (group.length === 0) continue
        sections.push(`${label}s:`)
        for (const s of group) {
          sections.push(`  - ${s.anonLine}`)
        }
        sections.push("")
      }
      return sections.join("\n").trim()
    },
    [],
  )

  const handleCopy = useCallback(
    async (mode: "all" | "filtered") => {
      const items = mode === "all" ? sources : filtered
      const text = buildClipboardText(items)
      try {
        await navigator.clipboard.writeText(text)
        setCopied(mode)
        setTimeout(() => setCopied(null), 2000)
      } catch {
        /* noop */
      }
    },
    [sources, filtered, buildClipboardText],
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <PageHeader
        title="Sources List"
        description="Anonymised expert titles for sources slides. Company numbers are assigned by earliest engagement date. Target-company experts appear as Competitors."
        actions={
          <div className="flex items-center gap-2">
            {filter !== "all" && (
              <button
                type="button"
                onClick={() => handleCopy("filtered")}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {copied === "filtered" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied === "filtered" ? "Copied" : `Copy ${FILTER_TABS.find((t) => t.key === filter)?.label ?? ""}`}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleCopy("all")}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {copied === "all" ? <Check className="h-3 w-3" /> : <Download className="h-3 w-3" />}
              {copied === "all" ? "Copied" : "Copy All"}
            </button>
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              filter === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
            <span className="ml-1.5 text-muted-foreground">({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2.5 text-left font-semibold text-foreground" colSpan={3}>
                  Real Identity
                </th>
                <th className="w-8 px-1 py-2.5" />
                <th className="px-3 py-2.5 text-left font-semibold text-foreground" colSpan={2}>
                  Anonymised (for slides)
                </th>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Company</th>
                <th className="w-8 px-1 py-2" />
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Anonymised Title</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Anonymised Company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const cat = mapTypeToCategory(s.expertType)
                const typeBadgeColor =
                  cat === "customer"
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : cat === "competitor"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-violet-50 text-violet-700 border-violet-200"

                return (
                  <tr key={s.realName} className="hover:bg-muted/20 transition-colors">
                    {/* Real identity */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{s.realName}</span>
                        <span className={`inline-flex h-4 items-center rounded-full border px-1.5 text-[9px] font-semibold ${typeBadgeColor}`}>
                          {CATEGORY_LABELS[cat]}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground max-w-[200px]">
                      <span className="block truncate" title={s.realRole}>{s.realRole}</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{s.realCompany}</td>

                    {/* Arrow */}
                    <td className="w-8 px-1 py-2.5 text-center">
                      <ArrowRight className="mx-auto h-3.5 w-3.5 text-muted-foreground/50" />
                    </td>

                    {/* Anonymised (editable) */}
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {editingKey === s.nameKey ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={roleInputRef}
                            type="text"
                            value={roleDraft}
                            onChange={(e) => setRoleDraft(e.target.value)}
                            className="h-7 w-full min-w-[160px] rounded border border-ring bg-background px-2 text-xs text-foreground outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditing()
                              if (e.key === "Escape") cancelEditing()
                            }}
                          />
                          <button
                            type="button"
                            onClick={saveEditing}
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground"
                            aria-label="Save"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground"
                            aria-label="Cancel"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(s)}
                          className="group flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-xs transition-colors hover:bg-muted/50"
                          title="Click to edit anonymised title"
                        >
                          <span>{s.anonRole}</span>
                          <Pencil className="h-3 w-3 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${typeBadgeColor}`}>
                        {s.anonCompany}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No experts in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clipboard preview */}
      <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Clipboard Preview ({filter === "all" ? "All" : FILTER_TABS.find((t) => t.key === filter)?.label})
          </p>
          <button
            type="button"
            onClick={() => handleCopy(filter === "all" ? "all" : "filtered")}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
          {buildClipboardText(filtered)}
        </pre>
      </div>
    </div>
  )
}
