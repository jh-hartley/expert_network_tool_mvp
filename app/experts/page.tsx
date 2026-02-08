"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import {
  Plus,
  Download,
  Search,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Info,
  Building2,
  Globe,
} from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import {
  getExpertProfiles,
  saveExpertProfiles,
  type ExpertProfile,
} from "@/lib/expert-profiles"
import { exportToExcel, type ExcelColumnDef } from "@/lib/export-excel"
import MarkdownRenderer from "@/app/components/markdown-renderer"

/* Dynamically import the lens table with SSR disabled so it never
   renders on the server -- this eliminates any localStorage-driven
   hydration mismatches. */
const ExpertLensTable = dynamic(
  () => import("../components/expert-lens-table"),
  { ssr: false },
)

/* ------------------------------------------------------------------ */
/*  Search mode type                                                   */
/* ------------------------------------------------------------------ */

type SearchMode = "external" | "bain"

/* ------------------------------------------------------------------ */
/*  Experts page                                                       */
/*                                                                     */
/*  State is held here so shortlisting, notes, and CID updates are    */
/*  reflected immediately. Every mutation persists to localStorage.    */
/* ------------------------------------------------------------------ */

export default function ExpertsPage() {
  const [experts, setExperts] = useState<ExpertProfile[]>([])
  const [loaded, setLoaded] = useState(false)

  /* -- AI search state -- */
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchMode>("external")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // Hydrate from localStorage after mount
  useEffect(() => {
    setExperts(getExpertProfiles())
    setLoaded(true)
  }, [])

  const handleUpdate = useCallback(
    (index: number, updates: Partial<ExpertProfile>) => {
      setExperts((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], ...updates }
        saveExpertProfiles(next)
        return next
      })
    },
    [],
  )

  const handleExport = useCallback(() => {
    const EXPERT_COLUMNS: ExcelColumnDef[] = [
      { key: "name", header: "Name" },
      { key: "company", header: "Company" },
      { key: "original_role", header: "Role" },
      { key: "role", header: "Anonymised Role" },
      {
        key: "expert_type",
        header: "Type",
        transform: (v) => {
          const labels: Record<string, string> = {
            customer: "Customer",
            competitor: "Competitor",
            target: "Target",
            competitor_customer: "Comp. Customer",
          }
          return labels[String(v)] ?? v
        },
      },
      { key: "network", header: "Network" },
      {
        key: "screening_status",
        header: "Screening Status",
        transform: (v) => {
          const labels: Record<string, string> = {
            pending: "Pending",
            shortlisted: "Shortlisted",
            discarded: "Discarded",
          }
          return labels[String(v)] ?? String(v)
        },
      },
      {
        key: "cid_status",
        header: "CID Status",
        transform: (v) => {
          const labels: Record<string, string> = {
            not_checked: "Not Checked",
            no_conflict: "No Conflict",
            pending: "Pending",
            approved: "Approved",
            declined: "Declined",
          }
          return labels[String(v)] ?? String(v)
        },
      },
      {
        key: "compliance_flags",
        header: "Compliance Flags",
        transform: (v) => {
          const arr = v as string[] | undefined
          return arr && arr.length > 0 ? arr.join(", ") : ""
        },
      },
      { key: "notes", header: "Notes" },
      // Customer screener columns
      {
        key: "screener_vendors_evaluated",
        header: "Vendors Evaluated (24mo)",
      },
      {
        key: "screener_vendor_selection_driver",
        header: "Vendor Selection Driver",
      },
      {
        key: "screener_vendor_satisfaction",
        header: "Vendor Satisfaction (1-10)",
      },
      { key: "screener_switch_trigger", header: "Switch Trigger" },
      // Competitor screener columns
      {
        key: "screener_competitive_landscape",
        header: "Competitive Landscape",
      },
      { key: "screener_losing_deals_to", header: "Losing Deals To" },
      { key: "screener_pricing_comparison", header: "Pricing Comparison" },
      { key: "screener_rd_investment", header: "R&D Investment" },
      { key: "additional_info", header: "Additional Info" },
    ]
    // Add network price columns dynamically
    const networkNames = new Set<string>()
    for (const e of experts) {
      for (const n of Object.keys(e.network_prices ?? {})) networkNames.add(n)
    }
    const networkCols: ExcelColumnDef[] = [...networkNames].sort().map((n) => ({
      key: `_price_${n}`,
      header: `${n} ($/hr)`,
      transform: (_v: unknown, row: Record<string, unknown>) => {
        const prices = row.network_prices as
          | Record<string, number | null>
          | undefined
        const price = prices?.[n]
        return price != null ? price : ""
      },
    }))
    exportToExcel({
      fileName: "Consensus_Experts",
      rows: experts as unknown as Record<string, unknown>[],
      columns: [...EXPERT_COLUMNS, ...networkCols],
    })
  }, [experts])

  /* -- AI search handler -- */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || isSearching) return
    setIsSearching(true)
    setSearchResult("")

    try {
      const res = await fetch("/api/expert-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery.trim(),
          experts: experts.map((e) => ({
            name: e.name,
            role: e.role,
            original_role: e.original_role,
            company: e.company,
            expert_type: e.expert_type,
            former: e.former,
            date_left: e.date_left,
            price: e.price,
            network: e.network,
            industry_guess: e.industry_guess,
            fte_estimate: e.fte_estimate,
            additional_info: e.additional_info,
            screener_vendors_evaluated: e.screener_vendors_evaluated,
            screener_vendor_selection_driver: e.screener_vendor_selection_driver,
            screener_vendor_satisfaction: e.screener_vendor_satisfaction,
            screener_switch_trigger: e.screener_switch_trigger,
            screener_competitive_landscape: e.screener_competitive_landscape,
            screener_losing_deals_to: e.screener_losing_deals_to,
            screener_pricing_comparison: e.screener_pricing_comparison,
            screener_rd_investment: e.screener_rd_investment,
          })),
        }),
      })

      if (!res.ok) {
        setSearchResult("Error: failed to query the AI model.")
        return
      }

      // Read plain text stream
      const reader = res.body?.getReader()
      if (!reader) {
        setSearchResult("Error: no response stream.")
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setSearchResult(accumulated)
      }

      if (!accumulated) setSearchResult("No response received from the model.")
    } catch {
      setSearchResult("Error: failed to connect to the AI service.")
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, isSearching, experts])

  const handleCopy = useCallback(() => {
    if (!searchResult) return
    navigator.clipboard.writeText(searchResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [searchResult])

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading expert profiles...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <PageHeader
        title="Experts"
        description="Browse expert profiles by type, review screening responses, and triage your pool. Use the lens tabs to switch between customer, competitor, and target views with type-specific screening columns. Filter by shortlisted, pending, or discarded status. Data is persisted in your browser."
        actions={
          <>
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors ${
                searchOpen
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Find Expert
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <Link
              href="/upload"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Experts
            </Link>
          </>
        }
      />

      {/* ============================================================ */}
      {/*  AI-powered expert search panel                               */}
      {/* ============================================================ */}
      {searchOpen && (
        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          {/* Header + toggle */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Find an Expert
              </h3>
              <span className="text-xs text-muted-foreground">
                Describe what you need and AI will recommend the best match
              </span>
            </div>

            {/* Source toggle */}
            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setSearchMode("external")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  searchMode === "external"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="h-3 w-3" />
                External Experts
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("bain")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  searchMode === "bain"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-3 w-3" />
                Bain Advisor Network
              </button>
            </div>
          </div>

          {/* Bain mode notice */}
          {searchMode === "bain" && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Bain Advisor Network Integration
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    A full implementation of Bain Advisor Network advisor search
                    requires connection through an internal API that provides
                    access to the firm&apos;s advisor database. This would enable
                    searching across Bain&apos;s network of vetted industry advisors
                    with pre-existing compliance clearances, existing
                    relationships, and historical engagement data.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-amber-800">
                    In production, this integration would surface advisors who
                    have previously consulted on similar projects, reducing
                    sourcing time and compliance overhead.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* External experts search */}
          {searchMode === "external" && (
            <>
              {/* Query input */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <textarea
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSearch()
                        }
                      }}
                      placeholder="e.g. &quot;I need someone with deep experience in food & beverage automation who has evaluated multiple vendors recently&quot;"
                      rows={2}
                      className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    className="inline-flex h-auto items-center gap-1.5 self-end rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isSearching ? "Searching..." : "Find Match"}
                  </button>
                </div>

                {/* Suggested queries */}
                {!searchResult && !isSearching && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "Who has the most experience with vendor evaluations?",
                      "I need a competitor insider who understands pricing strategy",
                      "Find experts with harsh environment / heavy industry experience",
                      "Who would be best for understanding Zephyr's product roadmap?",
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          setSearchQuery(q)
                        }}
                        className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Scope indicator */}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Info className="h-3 w-3 shrink-0" />
                <span>
                  Searching across{" "}
                  <span className="font-medium text-foreground">
                    {experts.length} experts
                  </span>{" "}
                  in the database. All profile data and screening responses are
                  included in the search context.
                </span>
              </div>

              {/* Results */}
              {(searchResult || isSearching) && (
                <div className="mt-4 rounded-md border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        Recommendation
                      </span>
                      {isSearching && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analysing profiles...
                        </span>
                      )}
                    </div>
                    {searchResult && !isSearching && (
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                  <div
                    ref={resultRef}
                    className="mt-3 max-h-[400px] overflow-y-auto"
                  >
                    <MarkdownRenderer content={searchResult} />
                    {isSearching && (
                      <span className="inline-block h-4 w-1.5 animate-pulse bg-primary/60 align-middle" />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Scalability note */}
          <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Scalability note:
              </span>{" "}
              This demo sends all expert profiles directly to the LLM for
              matching. A production implementation would generate context vector
              embeddings for each expert profile and perform similarity search
              (e.g. via pgvector or Pinecone) to scale to hundreds or thousands
              of advisors without exceeding token limits.
            </p>
          </div>
        </div>
      )}

      {/* Lens table */}
      <div className="mt-6">
        <ExpertLensTable experts={experts} onUpdateExpert={handleUpdate} />
      </div>
    </div>
  )
}
