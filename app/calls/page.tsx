"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  Phone,
  CalendarCheck,
  SendHorizonal,
  XCircle,
  DollarSign,
  Users,
  Download,
  Sparkles,
} from "lucide-react"
import PageHeader from "../components/page-header"
import StatCard from "../components/stat-card"
import {
  getCalls,
  saveCalls,
  computeStats,
  computeCallPrice,
  detectFollowUps,
  type EngagementRecord,
} from "@/lib/engagements"
import { exportToExcel, type ExcelColumnDef } from "@/lib/export-excel"

/* SSR-disabled to avoid localStorage hydration mismatch */
const EngagementTable = dynamic(
  () => import("../components/engagement-table"),
  { ssr: false },
)

/* ------------------------------------------------------------------ */
/*  Helper                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(v: number) {
  return v === 0 ? "$0" : `$${v.toLocaleString("en-US")}`
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function CallsPage() {
  const [records, setRecords] = useState<EngagementRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setRecords(getCalls())
    setLoaded(true)
  }, [])

  const handleUpdate = useCallback(
    (index: number, updates: Partial<EngagementRecord>) => {
      setRecords((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], ...updates }
        saveCalls(next)
        return next
      })
    },
    [],
  )

  const handleAdd = useCallback(
    (record: EngagementRecord) => {
      setRecords((prev) => {
        const next = [record, ...prev]
        saveCalls(next)
        return next
      })
    },
    [],
  )

  const handleRemove = useCallback(
    (index: number) => {
      setRecords((prev) => {
        const next = prev.filter((_, i) => i !== index)
        saveCalls(next)
        return next
      })
    },
    [],
  )

  const handleExport = useCallback(() => {
    const followUps = detectFollowUps(records)
    const CALL_COLUMNS: ExcelColumnDef[] = [
      { key: "expert_name", header: "Name" },
      { key: "expert_company", header: "Company" },
      { key: "expert_role", header: "Role" },
      { key: "anonymised_role", header: "Anonymised Role" },
      { key: "expert_type", header: "Type", transform: (v) => {
        const labels: Record<string, string> = { customer: "Customer", competitor: "Competitor", target: "Target", competitor_customer: "Comp. Customer" }
        return labels[String(v)] ?? v
      }},
      { key: "status", header: "Status", transform: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
      { key: "date", header: "Call Date" },
      { key: "call_time", header: "Call Time" },
      { key: "duration_minutes", header: "Duration (min)" },
      { key: "_follow_up", header: "Follow-up", transform: (_v, row) => followUps.has(row.id as string) ? "Yes" : "No" },
      { key: "network", header: "Network" },
      { key: "_cost", header: "Cost ($)", transform: (_v, row) => {
        const prices = row.network_prices as Record<string, number | null>
        const rate = prices?.[row.network as string] ?? 0
        const dur = (row.duration_minutes as number) > 0 ? (row.duration_minutes as number) : 60
        const isfu = followUps.has(row.id as string)
        return computeCallPrice(rate ?? 0, dur, isfu)
      }},
      { key: "nps", header: "NPS", transform: (v) => v != null ? v : "" },
      { key: "notes", header: "Notes" },
    ]
    exportToExcel({
      fileName: "Consensus_Calls",
      rows: records as unknown as Record<string, unknown>[],
      columns: CALL_COLUMNS,
    })
  }, [records])

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading calls...
        </div>
      </div>
    )
  }

  // Compute dashboard stats (only after data is loaded)
  const stats = computeStats(records)
  const totalSpend = Object.values(stats.totalSpendByStatus).reduce((a, b) => a + b, 0)
  const completedSpend = stats.totalSpendByStatus.completed

  // Expert type breakdown (unique experts)
  const typeBreakdown = Object.entries(stats.uniqueByType)
    .map(([k, v]) => {
      const labels: Record<string, string> = {
        customer: "Cust",
        competitor: "Comp",
        target: "Target",
        competitor_customer: "C.Cust",
      }
      return `${v} ${labels[k] ?? k}`
    })
    .join(", ")

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <PageHeader
        title="Calls"
        description="Track expert calls from invitation through completion. Add new calls by searching the expert database. Status, notes, and spend persist in your browser."
        actions={
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        }
      />

      {/* KPI extraction banner */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
        <div>
          <p className="text-xs leading-relaxed text-violet-800">
            <span className="font-semibold text-violet-900">Automatic KPI extraction: </span>
            When a transcript is uploaded against a completed call, the system
            uses an LLM call to extract KPIs (e.g. NPS scores for customer
            calls). Extracted values update the Dashboard averages and
            reporting in real time.
          </p>
        </div>
      </div>

      {/* Dashboard cards */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Experts Contacted"
          value={stats.uniqueExperts}
          change={typeBreakdown}
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          label="Completed"
          value={stats.byStatus.completed}
          change={formatCurrency(completedSpend)}
          changeType="positive"
          icon={Phone}
        />
        <StatCard
          label="Scheduled"
          value={stats.byStatus.scheduled}
          change={formatCurrency(stats.totalSpendByStatus.scheduled)}
          changeType="neutral"
          icon={CalendarCheck}
        />
        <StatCard
          label="Invited"
          value={stats.byStatus.invited}
          change={formatCurrency(stats.totalSpendByStatus.invited)}
          changeType="neutral"
          icon={SendHorizonal}
        />
        <StatCard
          label="Cancelled"
          value={stats.byStatus.cancelled}
          change={formatCurrency(stats.totalSpendByStatus.cancelled)}
          changeType={stats.byStatus.cancelled > 0 ? "negative" : "neutral"}
          icon={XCircle}
        />
      </div>

      {/* Total spend summary */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Total projected spend: {formatCurrency(totalSpend)}</span>
          {" -- "}
          Completed {formatCurrency(completedSpend)} / Scheduled {formatCurrency(stats.totalSpendByStatus.scheduled)} / Invited {formatCurrency(stats.totalSpendByStatus.invited)}
        </p>
      </div>

      {/* Engagement table */}
      <div className="mt-6">
        <EngagementTable
          records={records}
          engagementType="call"
          onUpdateRecord={handleUpdate}
          onAddRecord={handleAdd}
          onRemoveRecord={handleRemove}
        />
      </div>
    </div>
  )
}
