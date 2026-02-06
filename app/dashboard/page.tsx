"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  Phone,
  ClipboardList,
  Users,
  Clock,
  DollarSign,
  Download,
  TrendingUp,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import PageHeader from "../components/page-header"
import { getExpertProfiles, type ExpertProfile } from "@/lib/expert-profiles"
import {
  getCalls,
  getSurveys,
  computeStats,
  computeCallPrice,
  type EngagementRecord,
  type EngagementStatus,
} from "@/lib/engagements"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtUSD(v: number) {
  return v === 0 ? "$0" : `$${v.toLocaleString("en-US")}`
}
function fmtEUR(v: number) {
  return v === 0 ? "\u20AC0" : `\u20AC${v.toLocaleString("en-US")}`
}

const TYPE_LABELS: Record<string, string> = {
  customer: "Customer",
  competitor: "Competitor",
  target: "Target",
  competitor_customer: "Comp. Customer",
}

const STATUS_ORDER: EngagementStatus[] = ["completed", "scheduled", "invited", "cancelled"]
const STATUS_COLORS: Record<EngagementStatus, string> = {
  completed: "bg-emerald-500",
  scheduled: "bg-sky-500",
  invited: "bg-amber-500",
  cancelled: "bg-red-400",
}
const STATUS_LABELS: Record<EngagementStatus, string> = {
  completed: "Completed",
  scheduled: "Scheduled",
  invited: "Invited",
  cancelled: "Cancelled",
}

function formatDate(iso: string) {
  if (!iso) return "--"
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function isUpcoming(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date + "T00:00:00")
  return d >= today
}

/* ------------------------------------------------------------------ */
/*  Hardcoded KPIs                                                     */
/* ------------------------------------------------------------------ */

const NPS_DATA = {
  target: { label: "Meridian Controls", nps: 72, responses: 14, trend: "+5 vs Q3" },
  competitors: [
    { label: "Beckhoff Automation", nps: 65, responses: 11, trend: "+2 vs Q3" },
    { label: "Rockwell Automation", nps: 58, responses: 18, trend: "-3 vs Q3" },
    { label: "Omron Industrial", nps: 51, responses: 9, trend: "+1 vs Q3" },
  ],
}

/* ------------------------------------------------------------------ */
/*  Mini components                                                    */
/* ------------------------------------------------------------------ */

function SectionHeader({ icon: Icon, title }: { icon: typeof Calendar; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-8 pb-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
    </div>
  )
}

function MetricBox({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function StatusBar({ counts }: { counts: Record<EngagementStatus, number> }) {
  const total = STATUS_ORDER.reduce((a, s) => a + counts[s], 0)
  if (total === 0) return <div className="h-2 rounded-full bg-muted" />
  return (
    <div className="flex h-2 overflow-hidden rounded-full">
      {STATUS_ORDER.map((s) => {
        const pct = (counts[s] / total) * 100
        if (pct === 0) return null
        return <div key={s} className={`${STATUS_COLORS[s]}`} style={{ width: `${pct}%` }} />
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [experts, setExperts] = useState<ExpertProfile[]>([])
  const [calls, setCalls] = useState<EngagementRecord[]>([])
  const [surveys, setSurveys] = useState<EngagementRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setExperts(getExpertProfiles())
    setCalls(getCalls())
    setSurveys(getSurveys())
    setLoaded(true)
  }, [])

  /* derived stats */
  const callStats = useMemo(() => computeStats(calls), [calls])
  const surveyStats = useMemo(() => computeStats(surveys), [surveys])

  /* total call hours (completed only) */
  const completedMinutes = useMemo(
    () => calls.filter((c) => c.status === "completed").reduce((a, c) => a + c.duration_minutes, 0),
    [calls],
  )

  /* upcoming events (calls: scheduled/invited; surveys: scheduled/invited) */
  const upcomingCalls = useMemo(
    () =>
      calls
        .filter((c) => (c.status === "scheduled" || c.status === "invited") && isUpcoming(c.date))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [calls],
  )
  const upcomingSurveys = useMemo(
    () =>
      surveys
        .filter((s) => (s.status === "scheduled" || s.status === "invited") && isUpcoming(s.date))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [surveys],
  )

  /* cancelled counts for the reminder */
  const cancelledCalls = calls.filter((c) => c.status === "cancelled")
  const cancelledSurveys = surveys.filter((s) => s.status === "cancelled")

  /* budget breakdowns -- calls use computeCallPrice, surveys use flat rate */
  const callSpendByStatus = useMemo(() => {
    const out: Record<EngagementStatus, number> = { completed: 0, scheduled: 0, invited: 0, cancelled: 0 }
    for (const c of calls) {
      const rate = c.network_prices[c.network] ?? 0
      const cost = computeCallPrice(rate, c.duration_minutes, c.is_follow_up ?? false)
      out[c.status] += cost
    }
    return out
  }, [calls])

  const surveySpendByStatus = useMemo(() => {
    const out: Record<EngagementStatus, number> = { completed: 0, scheduled: 0, invited: 0, cancelled: 0 }
    for (const s of surveys) {
      const price = s.network_prices[s.network] ?? 0
      out[s.status] += price
    }
    return out
  }, [surveys])

  const activeCallSpend = callSpendByStatus.completed + callSpendByStatus.scheduled + callSpendByStatus.invited
  const activeSurveySpend = surveySpendByStatus.completed + surveySpendByStatus.scheduled + surveySpendByStatus.invited

  /* expert-level aggregation */
  const expertsByType = useMemo(() => {
    const m: Record<string, number> = {}
    for (const e of experts) m[e.expert_type] = (m[e.expert_type] ?? 0) + 1
    return m
  }, [experts])

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <PageHeader
        title="Dashboard"
        description="Project overview across experts, calls, AI surveys, and budget. Cancelled engagements are excluded from active totals but shown as reminders."
        actions={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground opacity-50 cursor-not-allowed"
            disabled
            title="Export coming soon"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        }
      />

      {/* ================================================================ */}
      {/*  1. CALENDAR / UPCOMING SCHEDULE                                 */}
      {/* ================================================================ */}
      <SectionHeader icon={Calendar} title="Upcoming Schedule" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming calls */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-foreground">
              Upcoming Calls
              <span className="ml-1.5 text-muted-foreground font-normal">({upcomingCalls.length})</span>
            </h3>
          </div>
          {upcomingCalls.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No upcoming calls</p>
          ) : (
            <div className="divide-y divide-border">
              {upcomingCalls.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-center">
                    <div>
                      <p className="text-[10px] font-semibold leading-none text-foreground">
                        {new Date(c.date + "T00:00:00").getDate()}
                      </p>
                      <p className="text-[9px] uppercase text-muted-foreground">
                        {new Date(c.date + "T00:00:00").toLocaleDateString("en-GB", { month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{c.expert_name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{c.expert_company} &middot; {c.network}</p>
                  </div>
                  <span className={`shrink-0 inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${c.status === "scheduled" ? "border border-sky-200 bg-sky-50 text-sky-700" : "border border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming / pending surveys */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-foreground">
              Pending Surveys
              <span className="ml-1.5 text-muted-foreground font-normal">({upcomingSurveys.length})</span>
            </h3>
          </div>
          {upcomingSurveys.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No pending surveys</p>
          ) : (
            <div className="divide-y divide-border">
              {upcomingSurveys.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-center">
                    <div>
                      <p className="text-[10px] font-semibold leading-none text-foreground">
                        {new Date(s.date + "T00:00:00").getDate()}
                      </p>
                      <p className="text-[9px] uppercase text-muted-foreground">
                        {new Date(s.date + "T00:00:00").toLocaleDateString("en-GB", { month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{s.expert_name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{s.expert_company} &middot; {s.network}</p>
                  </div>
                  <span className={`shrink-0 inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${s.status === "scheduled" ? "border border-sky-200 bg-sky-50 text-sky-700" : "border border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancelled reminders */}
      {(cancelledCalls.length > 0 || cancelledSurveys.length > 0) && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Cancelled engagements to chase: </span>
            {cancelledCalls.length > 0 && (
              <span>
                {cancelledCalls.length} call{cancelledCalls.length > 1 ? "s" : ""} ({cancelledCalls.map((c) => c.expert_name).join(", ")})
              </span>
            )}
            {cancelledCalls.length > 0 && cancelledSurveys.length > 0 && <span> &middot; </span>}
            {cancelledSurveys.length > 0 && (
              <span>
                {cancelledSurveys.length} survey{cancelledSurveys.length > 1 ? "s" : ""} ({cancelledSurveys.map((s) => s.expert_name).join(", ")})
              </span>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  2. STATUS OVERVIEW                                              */}
      {/* ================================================================ */}
      <SectionHeader icon={BarChart3} title="Status Overview" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Calls overview */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground">Calls</h3>
            <span className="text-[11px] text-muted-foreground">{callStats.uniqueExperts} expert{callStats.uniqueExperts !== 1 ? "s" : ""} contacted</span>
          </div>
          <StatusBar counts={callStats.byStatus} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="text-center">
                <p className="text-lg font-semibold text-foreground">{callStats.byStatus[s]}</p>
                <p className="text-[10px] text-muted-foreground">{STATUS_LABELS[s]}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-md bg-muted/30 px-3 py-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">
                {Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m
              </span>
              <span className="text-muted-foreground"> of calls completed</span>
            </div>
          </div>
          {/* Type breakdown */}
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(callStats.uniqueByType).map(([type, count]) => (
              <span key={type} className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {count} {TYPE_LABELS[type] ?? type}
              </span>
            ))}
          </div>
        </div>

        {/* Surveys overview */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground">AI Surveys</h3>
            <span className="text-[11px] text-muted-foreground">{surveyStats.uniqueExperts} expert{surveyStats.uniqueExperts !== 1 ? "s" : ""} contacted</span>
          </div>
          <StatusBar counts={surveyStats.byStatus} />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="text-center">
                <p className="text-lg font-semibold text-foreground">{surveyStats.byStatus[s]}</p>
                <p className="text-[10px] text-muted-foreground">{STATUS_LABELS[s]}</p>
              </div>
            ))}
          </div>
          {/* Type breakdown */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(surveyStats.uniqueByType).map(([type, count]) => (
              <span key={type} className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {count} {TYPE_LABELS[type] ?? type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expert pool summary */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBox
          label="Expert Pool"
          value={experts.length}
          sub={Object.entries(expertsByType).map(([k, v]) => `${v} ${TYPE_LABELS[k] ?? k}`).join(", ")}
        />
        <MetricBox
          label="Shortlisted"
          value={experts.filter((e) => e.shortlisted).length}
          sub={`${Math.round((experts.filter((e) => e.shortlisted).length / Math.max(experts.length, 1)) * 100)}% of pool`}
        />
        <MetricBox
          label="Total Calls"
          value={calls.filter((c) => c.status !== "cancelled").length}
          sub={`${cancelledCalls.length} cancelled`}
        />
        <MetricBox
          label="Total Surveys"
          value={surveys.filter((s) => s.status !== "cancelled").length}
          sub={`${cancelledSurveys.length} cancelled`}
        />
      </div>

      {/* ================================================================ */}
      {/*  3. CUSTOMER INTERVIEW KPIs                                      */}
      {/* ================================================================ */}
      <SectionHeader icon={TrendingUp} title="Customer Interview KPIs" />

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Target NPS */}
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">Target</p>
          <p className="mt-1 text-sm font-medium text-foreground">{NPS_DATA.target.label}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-primary">{NPS_DATA.target.nps}</span>
            <span className="text-xs text-muted-foreground">NPS</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{NPS_DATA.target.responses} responses &middot; {NPS_DATA.target.trend}</p>
          {/* NPS gauge bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, (NPS_DATA.target.nps + 100) / 2))}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            <span>-100</span><span>0</span><span>+100</span>
          </div>
        </div>

        {/* Competitor NPS cards */}
        {NPS_DATA.competitors.map((comp) => (
          <div key={comp.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Competitor</p>
            <p className="mt-1 text-sm font-medium text-foreground">{comp.label}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{comp.nps}</span>
              <span className="text-xs text-muted-foreground">NPS</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{comp.responses} responses &middot; {comp.trend}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground/20 transition-all" style={{ width: `${Math.max(0, Math.min(100, (comp.nps + 100) / 2))}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
              <span>-100</span><span>0</span><span>+100</span>
            </div>
          </div>
        ))}
      </div>

      {/* NPS disclaimer */}
      <p className="mt-2 text-[11px] italic text-muted-foreground">
        NPS scores are illustrative / hardcoded for demo purposes. Integration with live survey data is planned.
      </p>

      {/* ================================================================ */}
      {/*  4. BUDGET                                                       */}
      {/* ================================================================ */}
      <SectionHeader icon={DollarSign} title="Budget" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Call budget */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground">Call Spend (USD)</h3>
            <span className="text-lg font-bold tracking-tight text-foreground">{fmtUSD(activeCallSpend)}</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {(["completed", "scheduled", "invited"] as const).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[s]}`} />
                  <span className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</span>
                  <span className="text-xs text-muted-foreground/60">({callStats.byStatus[s]} call{callStats.byStatus[s] !== 1 ? "s" : ""})</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{fmtUSD(callSpendByStatus[s])}</span>
              </div>
            ))}
            {callSpendByStatus.cancelled > 0 && (
              <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${STATUS_COLORS.cancelled}`} />
                  <span className="text-xs text-muted-foreground line-through">Cancelled</span>
                  <span className="text-xs text-muted-foreground/60">({callStats.byStatus.cancelled})</span>
                </div>
                <span className="text-xs text-muted-foreground line-through">{fmtUSD(callSpendByStatus.cancelled)}</span>
              </div>
            )}
          </div>
          {/* Stacked bar for call spend */}
          <div className="mt-4">
            {activeCallSpend > 0 && (
              <div className="flex h-3 overflow-hidden rounded-full">
                {(["completed", "scheduled", "invited"] as const).map((s) => {
                  const pct = (callSpendByStatus[s] / activeCallSpend) * 100
                  if (pct === 0) return null
                  return <div key={s} className={`${STATUS_COLORS[s]}`} style={{ width: `${pct}%` }} />
                })}
              </div>
            )}
          </div>
        </div>

        {/* Survey budget */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground">Survey Spend (EUR)</h3>
            <span className="text-lg font-bold tracking-tight text-foreground">{fmtEUR(activeSurveySpend)}</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {(["completed", "scheduled", "invited"] as const).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[s]}`} />
                  <span className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</span>
                  <span className="text-xs text-muted-foreground/60">({surveyStats.byStatus[s]} survey{surveyStats.byStatus[s] !== 1 ? "s" : ""})</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{fmtEUR(surveySpendByStatus[s])}</span>
              </div>
            ))}
            {surveySpendByStatus.cancelled > 0 && (
              <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${STATUS_COLORS.cancelled}`} />
                  <span className="text-xs text-muted-foreground line-through">Cancelled</span>
                  <span className="text-xs text-muted-foreground/60">({surveyStats.byStatus.cancelled})</span>
                </div>
                <span className="text-xs text-muted-foreground line-through">{fmtEUR(surveySpendByStatus.cancelled)}</span>
              </div>
            )}
          </div>
          {/* Stacked bar for survey spend */}
          <div className="mt-4">
            {activeSurveySpend > 0 && (
              <div className="flex h-3 overflow-hidden rounded-full">
                {(["completed", "scheduled", "invited"] as const).map((s) => {
                  const pct = (surveySpendByStatus[s] / activeSurveySpend) * 100
                  if (pct === 0) return null
                  return <div key={s} className={`${STATUS_COLORS[s]}`} style={{ width: `${pct}%` }} />
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Combined total */}
      <div className="mt-4 rounded-lg border border-border bg-card p-5">
        <div className="grid gap-6 sm:grid-cols-3">
          <MetricBox label="Active Call Spend" value={fmtUSD(activeCallSpend)} sub={`excl. ${fmtUSD(callSpendByStatus.cancelled)} cancelled`} accent />
          <MetricBox label="Active Survey Spend" value={fmtEUR(activeSurveySpend)} sub={`excl. ${fmtEUR(surveySpendByStatus.cancelled)} cancelled`} accent />
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary/70">Total Active Engagements</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-primary">
              {calls.filter((c) => c.status !== "cancelled").length + surveys.filter((s) => s.status !== "cancelled").length}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {calls.filter((c) => c.status !== "cancelled").length} calls + {surveys.filter((s) => s.status !== "cancelled").length} surveys
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 pb-4">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[s]}`} />
            <span className="text-[11px] text-muted-foreground">{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
