"use client"

import {
  Users,
  UserPlus,
  Copy,
  Phone,
  PhoneOff,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Clock,
  Upload,
  UserCheck,
} from "lucide-react"
import PageHeader from "../components/page-header"
import StatCard from "../components/stat-card"
import { useStore } from "@/lib/use-store"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Upload, UserCheck, Phone, Copy, ClipboardList, ShieldAlert,
}

export default function DashboardPage() {
  const { items: experts } = useStore("experts")
  const { items: calls } = useStore("calls")
  const { items: surveys } = useStore("surveys")

  // Computed stats
  const totalExperts = experts.length
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const newThisWeek = experts.filter((e) => e.createdAt >= oneWeekAgo).length
  const duplicatesFlagged = 0 // placeholder -- dedup logic not yet wired
  const clearedCount = experts.filter((e) => e.compliance === "cleared").length
  const clearedRate = totalExperts > 0 ? Math.round((clearedCount / totalExperts) * 100) : 0

  const weekCalls = calls.filter((c) => c.date >= oneWeekAgo)
  const completedCalls = weekCalls.filter((c) => c.status === "completed").length
  const cancelledCalls = weekCalls.filter((c) => c.status === "cancelled").length
  const scheduledCalls = weekCalls.filter((c) => c.status === "scheduled").length

  const monthCalls = calls.filter((c) => {
    const d = new Date(c.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const actualSpend = monthCalls.filter((c) => c.status === "completed").reduce((s, c) => s + c.cost, 0)
  const forecastSpend = monthCalls.reduce((s, c) => s + c.cost, 0)

  const complianceBlocked = experts.filter((e) => e.compliance === "blocked").length
  const completedSurveys = surveys.filter((s) => s.status === "completed").length
  const pendingSurveys = surveys.filter((s) => s.status === "in-progress").length
  const avgNps = surveys.filter((s) => s.avgNps !== null).length > 0
    ? Math.round(surveys.filter((s) => s.avgNps !== null).reduce((s, sv) => s + (sv.avgNps ?? 0), 0) / surveys.filter((s) => s.avgNps !== null).length)
    : 0

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`

  // Activity feed derived from recent data
  const recentActivity = [
    { icon: "Upload", text: `${newThisWeek} new expert${newThisWeek === 1 ? "" : "s"} added this week`, time: "This week" },
    { icon: "UserCheck", text: `${clearedCount} expert${clearedCount === 1 ? "" : "s"} cleared for calls`, time: "Current" },
    { icon: "Phone", text: `${completedCalls} call${completedCalls === 1 ? "" : "s"} completed this week`, time: "This week" },
    { icon: "ClipboardList", text: `${completedSurveys} survey${completedSurveys === 1 ? "" : "s"} completed, ${pendingSurveys} in progress`, time: "Current" },
    ...(complianceBlocked > 0 ? [{ icon: "ShieldAlert", text: `${complianceBlocked} expert${complianceBlocked === 1 ? "" : "s"} compliance-blocked -- requires review`, time: "Action needed" }] : []),
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Overview"
        description="High-level metrics and recent activity across the expert network."
      />

      {/* Expert stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Experts" value={totalExperts} change={`+${newThisWeek} this week`} changeType="positive" icon={Users} />
        <StatCard label="New This Week" value={newThisWeek} change="from uploads" changeType="neutral" icon={UserPlus} />
        <StatCard label="Duplicates Flagged" value={duplicatesFlagged} changeType="neutral" icon={Copy} />
        <StatCard label="Cleared" value={clearedCount} change={`${clearedRate}% rate`} changeType="positive" icon={ShieldCheck} />
      </div>

      {/* Calls + Spend */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Calls This Week" value={weekCalls.length} change={`${scheduledCalls} scheduled`} changeType="neutral" icon={Phone} />
        <StatCard label="Cancelled" value={cancelledCalls} changeType={cancelledCalls > 0 ? "negative" : "neutral"} icon={PhoneOff} />
        <StatCard label="Spend (Actual)" value={fmt(actualSpend)} change={forecastSpend > 0 ? `${Math.round((actualSpend / forecastSpend) * 100)}% of forecast` : "--"} changeType="positive" icon={DollarSign} />
        <StatCard label="Spend (Forecast)" value={fmt(forecastSpend)} change={`${fmt(forecastSpend - actualSpend)} remaining`} changeType="neutral" icon={TrendingUp} />
      </div>

      {/* Compliance + Surveys */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <StatCard label="Compliance Blocked" value={complianceBlocked} change={complianceBlocked > 0 ? "requires attention" : "all clear"} changeType={complianceBlocked > 0 ? "negative" : "positive"} icon={ShieldAlert} />
        <StatCard label="Surveys Completed" value={completedSurveys} change={`avg NPS: ${avgNps}`} changeType="positive" icon={ClipboardList} />
        <StatCard label="Surveys Pending" value={pendingSurveys} changeType="neutral" icon={Clock} />
      </div>

      {/* Activity feed */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Recent Activity
        </h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {recentActivity.map((item, i) => {
            const Icon = iconMap[item.icon] || Users
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="flex-1 text-sm text-foreground">{item.text}</p>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
