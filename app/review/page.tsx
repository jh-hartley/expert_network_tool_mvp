"use client"

import { useState, useEffect, useCallback } from "react"
import {
  User,
  Building2,
  Briefcase,
  DollarSign,
  Factory,
  Users,
  ShieldCheck,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Linkedin,
  Info,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Filter,
} from "lucide-react"
import {
  getExpertProfiles,
  saveExpertProfiles,
  type ExpertProfile,
  type ComplianceFlag,
} from "@/lib/expert-profiles"

/* ------------------------------------------------------------------ */
/*  Review-status persistence (separate from expert profiles)          */
/* ------------------------------------------------------------------ */

type ReviewStatus = "shortlisted" | "discarded" | "later"
type ReviewMap = Record<string, ReviewStatus>

const LS_REVIEW_KEY = "consensus_review_status"

function getReviewMap(): ReviewMap {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(LS_REVIEW_KEY) || "{}")
  } catch {
    return {}
  }
}

function saveReviewMap(map: ReviewMap) {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_REVIEW_KEY, JSON.stringify(map))
}

function expertKey(e: ExpertProfile): string {
  return `${e.name}::${e.company}`
}

/* ------------------------------------------------------------------ */
/*  Expert-type colour helpers                                         */
/* ------------------------------------------------------------------ */

const TYPE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  customer:            { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200" },
  competitor:          { bg: "bg-rose-100",    text: "text-rose-800",    ring: "ring-rose-200" },
  target:              { bg: "bg-amber-100",   text: "text-amber-800",   ring: "ring-amber-200" },
  competitor_customer: { bg: "bg-violet-100",  text: "text-violet-800",  ring: "ring-violet-200" },
}

const FLAG_META: Record<ComplianceFlag, { label: string; color: string }> = {
  ben_advisor:        { label: "BAN Advisor",         color: "bg-sky-100 text-sky-800" },
  compliance_flagged: { label: "Compliance Flagged",  color: "bg-red-100 text-red-800" },
  client_advisor:     { label: "Client Advisor",      color: "bg-amber-100 text-amber-800" },
}

const CID_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_checked: { label: "Not Checked",  color: "bg-gray-100 text-gray-700" },
  no_conflict: { label: "No Conflict",  color: "bg-emerald-100 text-emerald-800" },
  pending:     { label: "CID Pending",  color: "bg-sky-100 text-sky-800" },
  approved:    { label: "CID Approved", color: "bg-emerald-100 text-emerald-800" },
  declined:    { label: "CID Declined", color: "bg-red-100 text-red-800" },
}

/* ------------------------------------------------------------------ */
/*  Initials helper                                                    */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/* ------------------------------------------------------------------ */
/*  Avatar colours by expert type                                      */
/* ------------------------------------------------------------------ */

const AVATAR_GRADIENT: Record<string, string> = {
  customer:            "from-emerald-400 to-teal-500",
  competitor:          "from-rose-400 to-pink-500",
  target:              "from-amber-400 to-orange-500",
  competitor_customer: "from-violet-400 to-purple-500",
}

/* ------------------------------------------------------------------ */
/*  Swipe animation direction                                          */
/* ------------------------------------------------------------------ */

type SwipeDir = "left" | "right" | "down" | null

type TypeFilter = "all" | "customer" | "competitor" | "target" | "competitor_customer"

const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all",                 label: "All Experts" },
  { value: "customer",            label: "Customer" },
  { value: "competitor",          label: "Competitor" },
  { value: "target",              label: "Target" },
  { value: "competitor_customer", label: "Comp. Customer" },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReviewPage() {
  const [profiles, setProfiles] = useState<ExpertProfile[]>([])
  const [reviewMap, setReviewMap] = useState<ReviewMap>({})
  const [loaded, setLoaded] = useState(false)
  const [swipe, setSwipe] = useState<SwipeDir>(null)
  const [showStats, setShowStats] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")

  /* Load data */
  useEffect(() => {
    setProfiles(getExpertProfiles())
    setReviewMap(getReviewMap())
    setLoaded(true)
  }, [])

  /* Apply type filter */
  const filtered = typeFilter === "all"
    ? profiles
    : profiles.filter((p) => p.expert_type === typeFilter)

  /* Build ordered queue: unreviewed first (FIFO), then "later" pile */
  const queue = filtered.filter((p) => !reviewMap[expertKey(p)])
  const laterPile = filtered.filter((p) => reviewMap[expertKey(p)] === "later")
  const orderedQueue = [...queue, ...laterPile]

  const current = orderedQueue[0] ?? null
  const remaining = orderedQueue.length

  /* Counters -- scoped to current filter */
  const total = filtered.length
  const shortlistedCount = filtered.filter((p) => reviewMap[expertKey(p)] === "shortlisted").length
  const discardedCount = filtered.filter((p) => reviewMap[expertKey(p)] === "discarded").length
  const laterCount = laterPile.length
  const unreviewedCount = queue.length

  /* Counts per type (for toggle badges) */
  const typeCounts: Record<string, { total: number; unreviewed: number }> = {}
  for (const opt of TYPE_FILTER_OPTIONS) {
    const subset = opt.value === "all" ? profiles : profiles.filter((p) => p.expert_type === opt.value)
    typeCounts[opt.value] = {
      total: subset.length,
      unreviewed: subset.filter((p) => !reviewMap[expertKey(p)]).length,
    }
  }

  /* Action handler */
  const handleAction = useCallback(
    (status: ReviewStatus, dir: SwipeDir) => {
      if (!current) return
      setSwipe(dir)

      // Wait for animation, then update
      setTimeout(() => {
        const key = expertKey(current)
        const next = { ...reviewMap, [key]: status }

        // Also update shortlisted on the ExpertProfile itself
        if (status === "shortlisted") {
          const updated = profiles.map((p) =>
            expertKey(p) === key ? { ...p, shortlisted: true } : p
          )
          setProfiles(updated)
          saveExpertProfiles(updated)
        } else if (status === "discarded") {
          const updated = profiles.map((p) =>
            expertKey(p) === key ? { ...p, shortlisted: false } : p
          )
          setProfiles(updated)
          saveExpertProfiles(updated)
        }

        setReviewMap(next)
        saveReviewMap(next)
        setSwipe(null)
      }, 350)
    },
    [current, reviewMap, profiles]
  )

  /* Reset all reviews */
  const handleReset = useCallback(() => {
    setReviewMap({})
    saveReviewMap({})
    setExpandedSection(null)
    // Reset shortlisted flag on all profiles
    const updated = profiles.map((p) => ({ ...p, shortlisted: false }))
    setProfiles(updated)
    saveExpertProfiles(updated)
  }, [profiles])

  /* Keyboard shortcuts */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "ArrowLeft" || e.key === "d") handleAction("discarded", "left")
      if (e.key === "ArrowRight" || e.key === "s") handleAction("shortlisted", "right")
      if (e.key === "ArrowDown" || e.key === "l") handleAction("later", "down")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleAction])

  if (!loaded) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-center py-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  /* Swipe animation classes */
  const swipeClass =
    swipe === "left"
      ? "-translate-x-[120%] -rotate-12 opacity-0"
      : swipe === "right"
        ? "translate-x-[120%] rotate-12 opacity-0"
        : swipe === "down"
          ? "translate-y-[120%] opacity-0"
          : "translate-x-0 translate-y-0 rotate-0 opacity-100"

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Integration banner */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
        <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <div>
          <p className="text-sm font-medium text-sky-900">
            Profile photos and enrichment
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-sky-700">
            Profile photos are not currently available. With expert network API
            integration, we can connect LinkedIn profiles, pull headshots, and
            enrich expert data with employment history, education, and
            publication records.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Review
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Expert Review
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Swipe through experts to shortlist, discard, or review later.
            Keyboard:{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              {"<-"}
            </kbd>{" "}
            discard,{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              {"->"}
            </kbd>{" "}
            shortlist,{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              {"v"}
            </kbd>{" "}
            later
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Info className="h-3.5 w-3.5" />
            Stats
          </button>
          {Object.keys(reviewMap).length > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Type filter toggle */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {TYPE_FILTER_OPTIONS.map((opt) => {
          const active = typeFilter === opt.value
          const count = typeCounts[opt.value]
          /* Skip types with 0 experts */
          if (count.total === 0 && opt.value !== "all") return null
          return (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {opt.label}
              <span
                className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold leading-none ${
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {count.unreviewed > 0 ? count.unreviewed : count.total}
              </span>
            </button>
          )
        })}
      </div>

      {/* Stats panel */}
      {showStats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Unreviewed
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{unreviewedCount}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              Shortlisted
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{shortlistedCount}</p>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">
              Discarded
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-800">{discardedCount}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Review Later
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-800">{laterCount}</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>
            {total - remaining} of {total} reviewed
          </span>
          <span>
            {remaining} remaining
            {laterPile.length > 0 && unreviewedCount === 0
              ? " (review later pile)"
              : ""}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${total > 0 ? ((total - remaining) / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      {current ? (
        <div className="flex flex-col items-center">
          {/* Pile indicator */}
          {reviewMap[expertKey(current)] === "later" && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              <Clock className="h-3 w-3" />
              From the review later pile
            </div>
          )}

          {/* The swipe card -- landscape */}
          <div
            className={`w-full transition-all duration-300 ease-out ${swipeClass}`}
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="flex flex-col lg:flex-row">
                {/* ---- LEFT: Profile panel ---- */}
                <div className="flex flex-col lg:w-[340px] shrink-0 border-b lg:border-b-0 lg:border-r border-border">
                  {/* Avatar header */}
                  <div className={`relative flex flex-col items-center px-6 pt-7 pb-5 bg-gradient-to-br ${AVATAR_GRADIENT[current.expert_type] ?? "from-gray-400 to-gray-500"} bg-opacity-10`}>
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENT[current.expert_type] ?? "from-gray-400 to-gray-500"} text-xl font-bold text-white shadow-md`}
                    >
                      {getInitials(current.name)}
                    </div>
                    <h2 className="mt-3 text-base font-semibold text-foreground text-center">
                      {current.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground text-center">
                      {current.role}
                    </p>
                    {current.original_role !== current.role && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70 text-center italic">
                        {current.original_role}
                      </p>
                    )}
                    {/* Badges */}
                    <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                      {(() => {
                        const c = TYPE_COLORS[current.expert_type] ?? TYPE_COLORS.customer
                        return (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}>
                            {current.expert_type === "competitor_customer"
                              ? "Competitor Customer"
                              : current.expert_type.charAt(0).toUpperCase() + current.expert_type.slice(1)}
                          </span>
                        )
                      })()}
                      {current.former && (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 ring-1 ring-gray-200">
                          Former{current.date_left !== "N/A" && current.date_left !== "Unknown" ? ` (left ${current.date_left})` : ""}
                        </span>
                      )}
                      {current.compliance_flags.map((f) => (
                        <span key={f} className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${FLAG_META[f]?.color ?? "bg-gray-100 text-gray-700"}`}>
                          {FLAG_META[f]?.label ?? f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key info grid */}
                  <div className="grid grid-cols-2 gap-px bg-border flex-1">
                    <InfoCell icon={Building2} label="Company" value={current.company} />
                    <InfoCell icon={Factory} label="Industry" value={current.industry_guess} />
                    <InfoCell icon={Users} label="Employees" value={current.fte_estimate} />
                    <InfoCell icon={DollarSign} label="Price" value={current.price ? `$${current.price}/hr` : "Not specified"} />
                    <InfoCell icon={Briefcase} label="Network" value={current.network} />
                    <InfoCell icon={ShieldCheck} label="CID Status" value={CID_STATUS_LABELS[current.cid_status ?? "not_checked"]?.label ?? "Not Checked"} />
                  </div>

                  {/* Network prices */}
                  {Object.keys(current.network_prices).length > 0 && (
                    <div className="border-t border-border px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Network Prices
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(current.network_prices).map(([net, price]) => (
                          <span
                            key={net}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                              price != null
                                ? "bg-primary/8 text-foreground ring-1 ring-primary/15"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {net}: {price != null ? `$${price}` : "--"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ---- RIGHT: Screeners, additional info, compliance ---- */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Screener responses -- always visible */}
                  {current.expert_type === "customer" && (
                    <div className="border-b border-border px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Screener Responses
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ScreenerRow label="Vendors Evaluated" value={current.screener_vendors_evaluated} />
                        <ScreenerRow label="Selection Driver" value={current.screener_vendor_selection_driver} />
                        <ScreenerRow label="Satisfaction" value={current.screener_vendor_satisfaction} />
                        <ScreenerRow label="Switch Trigger" value={current.screener_switch_trigger} />
                      </div>
                    </div>
                  )}

                  {(current.expert_type === "competitor" || current.expert_type === "competitor_customer") && (
                    <div className="border-b border-border px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Competitor Screener
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ScreenerRow label="Competitive Landscape" value={current.screener_competitive_landscape} />
                        <ScreenerRow label="Losing Deals To" value={current.screener_losing_deals_to} />
                        <ScreenerRow label="Pricing Comparison" value={current.screener_pricing_comparison} />
                        <ScreenerRow label="R&D Investment" value={current.screener_rd_investment} />
                      </div>
                    </div>
                  )}

                  {current.expert_type === "target" && (
                    <div className="border-b border-border px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Insider Insights
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ScreenerRow label="Competitive Landscape" value={current.screener_competitive_landscape} />
                        <ScreenerRow label="Losing Deals To" value={current.screener_losing_deals_to} />
                        <ScreenerRow label="Pricing Comparison" value={current.screener_pricing_comparison} />
                        <ScreenerRow label="R&D Investment" value={current.screener_rd_investment} />
                      </div>
                    </div>
                  )}

                  {/* Additional info -- always visible */}
                  {current.additional_info && (
                    <div className="border-b border-border px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Additional Info
                      </p>
                      <p className="text-xs leading-relaxed text-foreground/80">
                        {current.additional_info}
                      </p>
                    </div>
                  )}

                  {/* Compliance warnings inline */}
                  <ComplianceWarningsInline expert={current} />

                  {/* No screeners / no additional info fallback */}
                  {!current.additional_info &&
                    current.expert_type !== "customer" &&
                    current.expert_type !== "competitor" &&
                    current.expert_type !== "competitor_customer" &&
                    current.expert_type !== "target" && (
                    <div className="flex flex-1 items-center justify-center px-5 py-8">
                      <p className="text-sm text-muted-foreground">
                        No screener data or additional info available for this expert.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => handleAction("discarded", "left")}
              className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-rose-200 bg-card text-rose-500 shadow-sm transition-all hover:border-rose-400 hover:bg-rose-50 hover:shadow-md hover:scale-110 active:scale-95"
              aria-label="Discard expert"
            >
              <ThumbsDown className="h-6 w-6 transition-transform group-hover:scale-110" />
            </button>

            <button
              onClick={() => handleAction("later", "down")}
              className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-200 bg-card text-amber-500 shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50 hover:shadow-md hover:scale-110 active:scale-95"
              aria-label="Review later"
            >
              <Clock className="h-5 w-5 transition-transform group-hover:scale-110" />
            </button>

            <button
              onClick={() => handleAction("shortlisted", "right")}
              className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-card text-emerald-500 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md hover:scale-110 active:scale-95"
              aria-label="Shortlist expert"
            >
              <ThumbsUp className="h-6 w-6 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Legend under buttons */}
          <div className="mt-3 flex items-center gap-6 text-[10px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-rose-400" />
              Discard
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" />
              Later
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Shortlist
            </span>
          </div>
        </div>
      ) : (
        /* Empty / all reviewed */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/8">
            <User className="h-8 w-8 text-primary/60" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            All experts reviewed
          </h2>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            You{"'"}ve reviewed all {total} experts.{" "}
            {shortlistedCount > 0 && (
              <>
                <span className="font-medium text-emerald-700">
                  {shortlistedCount} shortlisted
                </span>
                {" -- "}
              </>
            )}
            head to the Experts page to manage your selections, or reset to
            start over.
          </p>
          <button
            onClick={handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Reset all reviews
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5 bg-card px-4 py-3">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

function ScreenerRow({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  if (!value || value === "Not answered") return null
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">
        {value}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Compliance Warnings                                                */
/* ------------------------------------------------------------------ */

type WarningLevel = "critical" | "warning" | "info"

interface ComplianceWarning {
  level: WarningLevel
  title: string
  detail: string
}

function buildWarnings(expert: ExpertProfile): ComplianceWarning[] {
  const warnings: ComplianceWarning[] = []

  /* Client advisor -- cannot contact */
  if (expert.compliance_flags.includes("client_advisor")) {
    warnings.push({
      level: "critical",
      title: "Client Advisor",
      detail:
        "This expert is a current client advisor. Contact is restricted -- do not book calls without explicit clearance from the engagement manager.",
    })
  }

  /* Compliance flagged (e.g. fraud) */
  if (expert.compliance_flags.includes("compliance_flagged")) {
    warnings.push({
      level: "critical",
      title: "Compliance Flagged",
      detail:
        "This expert has been flagged by Compliance (e.g. potential fraud or policy violation). Do not proceed without Compliance approval.",
    })
  }

  /* BAN advisor */
  if (expert.compliance_flags.includes("ben_advisor")) {
    warnings.push({
      level: "warning",
      title: "BAN Advisor",
      detail:
        "This expert is a Bain Advisor Network (BAN) member. Ensure the project engagement terms allow BAN advisor participation before scheduling.",
    })
  }

  /* Target-company expert who left less than 12 months ago */
  if (
    expert.expert_type === "target" &&
    expert.former &&
    expert.date_left &&
    expert.date_left !== "N/A" &&
    expert.date_left !== "Unknown"
  ) {
    const [yearStr, monthStr] = expert.date_left.split("-")
    const leftDate = new Date(Number(yearStr), Number(monthStr) - 1, 1)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    if (leftDate > twelveMonthsAgo) {
      warnings.push({
        level: "warning",
        title: "Recent Departure (Target)",
        detail: `This expert left ${expert.company} in ${expert.date_left}, which is less than 12 months ago. Recent departures from target companies may carry non-compete or NDA restrictions -- confirm eligibility before booking.`,
      })
    }
  }

  /* Target-company expert without CID clearance */
  if (
    expert.expert_type === "target" &&
    (expert.cid_status ?? "not_checked") === "not_checked"
  ) {
    warnings.push({
      level: "info",
      title: "CID Not Checked",
      detail:
        "This is a target-company expert with no CID check on file. Consider running a CID check before scheduling a call.",
    })
  }

  /* CID declined */
  if ((expert.cid_status ?? "not_checked") === "declined") {
    warnings.push({
      level: "warning",
      title: "CID Declined",
      detail:
        "The account head has declined CID clearance for this expert. Do not proceed with engagement.",
    })
  }

  /* Currently employed at the target company (not former) */
  if (expert.expert_type === "target" && !expert.former) {
    warnings.push({
      level: "warning",
      title: "Current Employee (Target)",
      detail:
        "This expert is currently employed at the target company. Extra diligence is required -- ensure there are no insider-trading, confidentiality, or anti-tipping concerns before proceeding.",
    })
  }

  return warnings
}

const LEVEL_STYLES: Record<
  WarningLevel,
  { border: string; bg: string; icon: string; title: string; badge: string }
> = {
  critical: {
    border: "border-red-300",
    bg: "bg-red-50",
    icon: "text-red-600",
    title: "text-red-900",
    badge: "bg-red-100 text-red-700",
  },
  warning: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    icon: "text-amber-600",
    title: "text-amber-900",
    badge: "bg-amber-100 text-amber-700",
  },
  info: {
    border: "border-sky-200",
    bg: "bg-sky-50",
    icon: "text-sky-600",
    title: "text-sky-900",
    badge: "bg-sky-100 text-sky-700",
  },
}

function ComplianceWarningsInline({ expert }: { expert: ExpertProfile }) {
  const warnings = buildWarnings(expert)
  if (warnings.length === 0) {
    return (
      <div className="flex-1 flex items-center px-5 py-4">
        <div className="flex items-center gap-2 text-xs text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="font-medium">No compliance concerns detected</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 flex-1">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
          Compliance Concerns
        </p>
        <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-700">
          {warnings.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {warnings.map((w, i) => {
          const s = LEVEL_STYLES[w.level]
          return (
            <div
              key={i}
              className={`flex items-start gap-2.5 rounded-md border ${s.border} ${s.bg} px-3 py-2`}
            >
              <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${s.icon}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${s.title}`}>
                    {w.title}
                  </span>
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none ${s.badge}`}>
                    {w.level}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/70">
                  {w.detail}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
