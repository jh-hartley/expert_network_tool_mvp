"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Phone,
  PhoneOff,
  CalendarCheck,
  SendHorizonal,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Download,
  Euro,
} from "lucide-react"
import PageHeader from "../components/page-header"
import StatCard from "../components/stat-card"
import { getExpertProfiles, type ExpertProfile } from "@/lib/expert-profiles"
import {
  getCalls,
  getSurveys,
  computeStats,
  type EngagementRecord,
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

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    )
  }

  /* -- Expert stats -- */
  const totalExperts = experts.length
  const cidCleared = experts.filter((e) =>
    e.compliance_flags?.includes("cid_cleared"),
  ).length
  const cidPending = experts.filter(
    (e) => e.cid_clearance_requested && !e.compliance_flags?.includes("cid_cleared"),
  ).length
  const complianceFlagged = experts.filter((e) =>
    (e.compliance_flags ?? []).some(
      (f) => f === "ben_advisor" || f === "compliance_flagged" || f === "client_advisor",
    ),
  ).length
  const shortlisted = experts.filter((e) => e.shortlisted).length

  const expertsByType = experts.reduce<Record<string, number>>((acc, e) => {
    acc[e.expert_type] = (acc[e.expert_type] ?? 0) + 1
    return acc
  }, {})
  const expertTypeStr = Object.entries(expertsByType)
    .map(([k, v]) => `${v} ${TYPE_LABELS[k] ?? k}`)
    .join(", ")

  /* -- Call stats -- */
  const callStats = computeStats(calls)
  const callSpendTotal = Object.values(callStats.totalSpendByStatus).reduce(
    (a, b) => a + b,
    0,
  )

  /* -- Survey stats -- */
  const surveyStats = computeStats(surveys)
  const surveySpendTotal = Object.values(surveyStats.totalSpendByStatus).reduce(
    (a, b) => a + b,
    0,
  )

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <PageHeader
        title="Dashboard"
        description="Key metrics across experts, calls, and AI surveys. All data is drawn from localStorage -- the same source as the individual pages."
        actions={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent opacity-50 cursor-not-allowed"
            disabled
            title="Export coming soon"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        }
      />

      {/* ---- Expert Overview ---- */}
      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Experts
      </h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Experts"
          value={totalExperts}
          change={expertTypeStr}
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          label="Shortlisted"
          value={shortlisted}
          change={totalExperts > 0 ? `${Math.round((shortlisted / totalExperts) * 100)}% of total` : "--"}
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          label="CID Cleared"
          value={cidCleared}
          change={cidPending > 0 ? `${cidPending} pending` : "none pending"}
          changeType="positive"
          icon={ShieldCheck}
        />
        <StatCard
          label="Compliance Flags"
          value={complianceFlagged}
          change={complianceFlagged > 0 ? "requires attention" : "all clear"}
          changeType={complianceFlagged > 0 ? "negative" : "positive"}
          icon={ShieldAlert}
        />
        <StatCard
          label="CID Pending"
          value={cidPending}
          change={cidPending > 0 ? "awaiting clearance" : "none"}
          changeType={cidPending > 0 ? "neutral" : "positive"}
          icon={CalendarCheck}
        />
      </div>

      {/* ---- Calls Overview ---- */}
      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Calls
      </h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Experts Called"
          value={callStats.uniqueExperts}
          change={`${calls.length} total call${calls.length === 1 ? "" : "s"}`}
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          label="Completed"
          value={callStats.byStatus.completed}
          change={fmtUSD(callStats.totalSpendByStatus.completed)}
          changeType="positive"
          icon={Phone}
        />
        <StatCard
          label="Scheduled"
          value={callStats.byStatus.scheduled}
          change={fmtUSD(callStats.totalSpendByStatus.scheduled)}
          changeType="neutral"
          icon={CalendarCheck}
        />
        <StatCard
          label="Invited"
          value={callStats.byStatus.invited}
          change={fmtUSD(callStats.totalSpendByStatus.invited)}
          changeType="neutral"
          icon={SendHorizonal}
        />
        <StatCard
          label="Cancelled"
          value={callStats.byStatus.cancelled}
          change={fmtUSD(callStats.totalSpendByStatus.cancelled)}
          changeType={callStats.byStatus.cancelled > 0 ? "negative" : "neutral"}
          icon={PhoneOff}
        />
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            Total call spend: {fmtUSD(callSpendTotal)}
          </span>
          {" -- "}
          Completed {fmtUSD(callStats.totalSpendByStatus.completed)} / Scheduled{" "}
          {fmtUSD(callStats.totalSpendByStatus.scheduled)} / Invited{" "}
          {fmtUSD(callStats.totalSpendByStatus.invited)}
        </p>
      </div>

      {/* ---- Surveys Overview ---- */}
      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        AI Surveys
      </h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Experts Surveyed"
          value={surveyStats.uniqueExperts}
          change={`${surveys.length} total survey${surveys.length === 1 ? "" : "s"}`}
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          label="Completed"
          value={surveyStats.byStatus.completed}
          change={fmtEUR(surveyStats.totalSpendByStatus.completed)}
          changeType="positive"
          icon={ClipboardList}
        />
        <StatCard
          label="Scheduled"
          value={surveyStats.byStatus.scheduled}
          change={fmtEUR(surveyStats.totalSpendByStatus.scheduled)}
          changeType="neutral"
          icon={CalendarCheck}
        />
        <StatCard
          label="Invited"
          value={surveyStats.byStatus.invited}
          change={fmtEUR(surveyStats.totalSpendByStatus.invited)}
          changeType="neutral"
          icon={SendHorizonal}
        />
        <StatCard
          label="Cancelled"
          value={surveyStats.byStatus.cancelled}
          change={fmtEUR(surveyStats.totalSpendByStatus.cancelled)}
          changeType={surveyStats.byStatus.cancelled > 0 ? "negative" : "neutral"}
          icon={PhoneOff}
        />
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2">
        <Euro className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            Total survey spend: {fmtEUR(surveySpendTotal)}
          </span>
          {" -- "}
          Completed {fmtEUR(surveyStats.totalSpendByStatus.completed)} / Scheduled{" "}
          {fmtEUR(surveyStats.totalSpendByStatus.scheduled)} / Invited{" "}
          {fmtEUR(surveyStats.totalSpendByStatus.invited)}
        </p>
      </div>

      {/* ---- Combined spend ---- */}
      <div className="mt-8 rounded-lg border border-border bg-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Combined Spend Summary
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Total Calls (USD)
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {fmtUSD(callSpendTotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Total Surveys (EUR)
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {fmtEUR(surveySpendTotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Total Engagements
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {calls.length + surveys.length}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {calls.length} calls + {surveys.length} surveys
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
