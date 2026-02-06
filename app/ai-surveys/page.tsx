"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  ClipboardList,
  CalendarCheck,
  SendHorizonal,
  XCircle,
  Users,
  Euro,
  Download,
} from "lucide-react"
import PageHeader from "../components/page-header"
import StatCard from "../components/stat-card"
import {
  getSurveys,
  saveSurveys,
  computeStats,
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

function formatEur(v: number) {
  return v === 0 ? "€0" : `€${v.toLocaleString("en-US")}`
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function AiSurveysPage() {
  const [records, setRecords] = useState<EngagementRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setRecords(getSurveys())
    setLoaded(true)
  }, [])

  const handleUpdate = useCallback(
    (index: number, updates: Partial<EngagementRecord>) => {
      setRecords((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], ...updates }
        saveSurveys(next)
        return next
      })
    },
    [],
  )

  const handleAdd = useCallback(
    (record: EngagementRecord) => {
      setRecords((prev) => {
        const next = [record, ...prev]
        saveSurveys(next)
        return next
      })
    },
    [],
  )

  const handleRemove = useCallback(
    (index: number) => {
      setRecords((prev) => {
        const next = prev.filter((_, i) => i !== index)
        saveSurveys(next)
        return next
      })
    },
    [],
  )

  const handleExport = useCallback(() => {
    const SURVEY_COLUMNS: ExcelColumnDef[] = [
      { key: "expert_name", header: "Name" },
      { key: "expert_company", header: "Company" },
      { key: "expert_role", header: "Role" },
      { key: "anonymised_role", header: "Anonymised Role" },
      { key: "expert_type", header: "Type", transform: (v) => {
        const labels: Record<string, string> = { customer: "Customer", competitor: "Competitor", target: "Target", competitor_customer: "Comp. Customer" }
        return labels[String(v)] ?? v
      }},
      { key: "status", header: "Status", transform: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
      { key: "date", header: "Invite Sent" },
      { key: "network", header: "Network" },
      { key: "_cost", header: "Cost (EUR)", transform: (_v, row) => {
        const prices = row.network_prices as Record<string, number | null>
        return prices?.[row.network as string] ?? ""
      }},
      { key: "notes", header: "Notes" },
    ]
    exportToExcel({
      fileName: "Helmsman_AI_Surveys",
      rows: records as unknown as Record<string, unknown>[],
      columns: SURVEY_COLUMNS,
    })
  }, [records])

  // Compute dashboard stats
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

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading surveys...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <PageHeader
        title="AI Surveys"
        description="Track AI survey invitations sent to experts. Prices are in EUR. Add new surveys by searching the expert database."
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

      {/* Dashboard cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
          change={formatEur(completedSpend)}
          changeType="positive"
          icon={ClipboardList}
        />
        <StatCard
          label="Scheduled"
          value={stats.byStatus.scheduled}
          change={formatEur(stats.totalSpendByStatus.scheduled)}
          changeType="neutral"
          icon={CalendarCheck}
        />
        <StatCard
          label="Invited"
          value={stats.byStatus.invited}
          change={formatEur(stats.totalSpendByStatus.invited)}
          changeType="neutral"
          icon={SendHorizonal}
        />
        <StatCard
          label="Cancelled"
          value={stats.byStatus.cancelled}
          change={formatEur(stats.totalSpendByStatus.cancelled)}
          changeType={stats.byStatus.cancelled > 0 ? "negative" : "neutral"}
          icon={XCircle}
        />
      </div>

      {/* Total spend summary */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2">
        <Euro className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Total projected spend: {formatEur(totalSpend)}</span>
          {" -- "}
          Completed {formatEur(completedSpend)} / Scheduled {formatEur(stats.totalSpendByStatus.scheduled)} / Invited {formatEur(stats.totalSpendByStatus.invited)}
        </p>
      </div>

      {/* Engagement table */}
      <div className="mt-6">
        <EngagementTable
          records={records}
          engagementType="survey"
          onUpdateRecord={handleUpdate}
          onAddRecord={handleAdd}
          onRemoveRecord={handleRemove}
        />
      </div>
    </div>
  )
}
