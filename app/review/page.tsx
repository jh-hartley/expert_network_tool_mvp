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
  ChevronDown,
  ChevronUp,
  Linkedin,
  Info,
  CheckCircle2,
  XCircle,
  RotateCcw,
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

const LS_REVIEW_KEY = "helmsman_review_status"

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
  cid_cleared:        { label: "CID Cleared",        color: "bg-emerald-100 text-emerald-800" },
  ben_advisor:        { label: "BAN Advisor",         color: "bg-sky-100 text-sky-800" },
  compliance_flagged: { label: "Compliance Flagged",  color: "bg-red-100 text-red-800" },
  client_advisor:     { label: "Client Advisor",      color: "bg-amber-100 text-amber-800" },
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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReviewPage() {
  const [profiles, setProfiles] = useState<ExpertProfile[]>([])
  const [reviewMap, setReviewMap] = useState<ReviewMap>({})
  const [loaded, setLoaded] = useState(false)
  const [swipe, setSwipe] = useState<SwipeDir>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)

  /* Load data */
  useEffect(() => {
    setProfiles(getExpertProfiles())
    setReviewMap(getReviewMap())
    setLoaded(true)
  }, [])

  /* Build ordered queue: unreviewed first (FIFO), then "later" pile */
  const queue = profiles.filter((p) => !reviewMap[expertKey(p)])
  const laterPile = profiles.filter((p) => reviewMap[expertKey(p)] === "later")
  const orderedQueue = [...queue, ...laterPile]

  const current = orderedQueue[0] ?? null
  const remaining = orderedQueue.length

  /* Counters */
  const total = profiles.length
  const shortlistedCount = Object.values(reviewMap).filter((s) => s === "shortlisted").length
  const discardedCount = Object.values(reviewMap).filter((s) => s === "discarded").length
  const laterCount = laterPile.length
  const unreviewedCount = queue.length

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
        setExpandedSection(null)
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
    <div className="mx-auto max-w-5xl px-6 py-10">
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

          {/* The swipe card */}
          <div
            className={`w-full max-w-lg transition-all duration-300 ease-out ${swipeClass}`}
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {/* Card header with avatar */}
              <div className={`relative flex flex-col items-center px-6 pt-8 pb-5 bg-gradient-to-br ${AVATAR_GRADIENT[current.expert_type] ?? "from-gray-400 to-gray-500"} bg-opacity-10`}>
                {/* Avatar */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENT[current.expert_type] ?? "from-gray-400 to-gray-500"} text-2xl font-bold text-white shadow-md`}
                >
                  {getInitials(current.name)}
                </div>

                {/* Name & role */}
                <h2 className="mt-4 text-lg font-semibold text-foreground text-center">
                  {current.name}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground text-center">
                  {current.role}
                </p>
                {current.original_role !== current.role && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70 text-center italic">
                    {current.original_role}
                  </p>
                )}

                {/* Type badge */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                  {(() => {
                    const c = TYPE_COLORS[current.expert_type] ?? TYPE_COLORS.customer
                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}
                      >
                        {current.expert_type === "competitor_customer"
                          ? "Competitor Customer"
                          : current.expert_type.charAt(0).toUpperCase() +
                            current.expert_type.slice(1)}
                      </span>
                    )
                  })()}
                  {current.former && (
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 ring-1 ring-gray-200">
                      Former
                      {current.date_left !== "N/A" && current.date_left !== "Unknown"
                        ? ` (left ${current.date_left})`
                        : ""}
                    </span>
                  )}
                  {current.compliance_flags.map((f) => (
                    <span
                      key={f}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${FLAG_META[f]?.color ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {FLAG_META[f]?.label ?? f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
                <InfoCell
                  icon={Building2}
                  label="Company"
                  value={current.company}
                />
                <InfoCell
                  icon={Factory}
                  label="Industry"
                  value={current.industry_guess}
                />
                <InfoCell
                  icon={Users}
                  label="Employees"
                  value={current.fte_estimate}
                />
                <InfoCell
                  icon={DollarSign}
                  label="Price"
                  value={
                    current.price
                      ? `$${current.price}/hr`
                      : "Not specified"
                  }
                />
                <InfoCell
                  icon={Briefcase}
                  label="Network"
                  value={current.network}
                />
                <InfoCell
                  icon={ShieldCheck}
                  label="CID Status"
                  value={
                    current.compliance_flags.includes("cid_cleared")
                      ? "Cleared"
                      : current.cid_clearance_requested
                        ? "Requested"
                        : "Not requested"
                  }
                />
              </div>

              {/* Network prices */}
              {Object.keys(current.network_prices).length > 0 && (
                <div className="border-t border-border px-5 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Network Prices
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(current.network_prices).map(([net, price]) => (
                      <span
                        key={net}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
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

              {/* Expandable screener sections */}
              <div className="border-t border-border">
                {/* Customer screener */}
                {current.expert_type === "customer" && (
                  <ExpandableSection
                    id="screener"
                    title="Screener Responses"
                    expanded={expandedSection === "screener"}
                    onToggle={() =>
                      setExpandedSection(
                        expandedSection === "screener" ? null : "screener"
                      )
                    }
                  >
                    <ScreenerRow
                      label="Vendors Evaluated"
                      value={current.screener_vendors_evaluated}
                    />
                    <ScreenerRow
                      label="Selection Driver"
                      value={current.screener_vendor_selection_driver}
                    />
                    <ScreenerRow
                      label="Satisfaction"
                      value={current.screener_vendor_satisfaction}
                    />
                    <ScreenerRow
                      label="Switch Trigger"
                      value={current.screener_switch_trigger}
                    />
                  </ExpandableSection>
                )}

                {/* Competitor screener */}
                {(current.expert_type === "competitor" ||
                  current.expert_type === "competitor_customer") && (
                  <ExpandableSection
                    id="comp-screener"
                    title="Competitor Screener"
                    expanded={expandedSection === "comp-screener"}
                    onToggle={() =>
                      setExpandedSection(
                        expandedSection === "comp-screener"
                          ? null
                          : "comp-screener"
                      )
                    }
                  >
                    <ScreenerRow
                      label="Competitive Landscape"
                      value={current.screener_competitive_landscape}
                    />
                    <ScreenerRow
                      label="Losing Deals To"
                      value={current.screener_losing_deals_to}
                    />
                    <ScreenerRow
                      label="Pricing Comparison"
                      value={current.screener_pricing_comparison}
                    />
                    <ScreenerRow
                      label="R&D Investment"
                      value={current.screener_rd_investment}
                    />
                  </ExpandableSection>
                )}

                {/* Target screener -- show both sets if present */}
                {current.expert_type === "target" && (
                  <ExpandableSection
                    id="target-screener"
                    title="Insider Insights"
                    expanded={expandedSection === "target-screener"}
                    onToggle={() =>
                      setExpandedSection(
                        expandedSection === "target-screener"
                          ? null
                          : "target-screener"
                      )
                    }
                  >
                    <ScreenerRow
                      label="Competitive Landscape"
                      value={current.screener_competitive_landscape}
                    />
                    <ScreenerRow
                      label="Losing Deals To"
                      value={current.screener_losing_deals_to}
                    />
                    <ScreenerRow
                      label="Pricing Comparison"
                      value={current.screener_pricing_comparison}
                    />
                    <ScreenerRow
                      label="R&D Investment"
                      value={current.screener_rd_investment}
                    />
                  </ExpandableSection>
                )}

                {/* Additional info */}
                {current.additional_info && (
                  <ExpandableSection
                    id="additional"
                    title="Additional Info"
                    expanded={expandedSection === "additional"}
                    onToggle={() =>
                      setExpandedSection(
                        expandedSection === "additional" ? null : "additional"
                      )
                    }
                  >
                    <p className="text-xs leading-relaxed text-foreground/80">
                      {current.additional_info}
                    </p>
                  </ExpandableSection>
                )}
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

function ExpandableSection({
  id,
  title,
  expanded,
  onToggle,
  children,
}: {
  id: string
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent/50"
        aria-expanded={expanded}
        aria-controls={`section-${id}`}
      >
        {title}
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div id={`section-${id}`} className="px-5 pb-4 flex flex-col gap-3">
          {children}
        </div>
      )}
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
