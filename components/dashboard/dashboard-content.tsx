"use client"

import {
  Users,
  Phone,
  DollarSign,
  ShieldCheck,
  ClipboardList,
  Activity,
  TrendingUp,
} from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { PlaceholderSection } from "@/components/placeholder-section"

const stats = [
  { label: "Total Experts", value: "--", sub: "Across all networks", icon: Users },
  { label: "Calls This Week", value: "--", sub: "Scheduled + completed", icon: Phone },
  { label: "Total Spend", value: "--", sub: "Forecast pending", icon: DollarSign },
  { label: "Compliance", value: "--", sub: "Cleared / pending / flagged", icon: ShieldCheck },
  { label: "AI Surveys", value: "--", sub: "Complete / in progress", icon: ClipboardList },
]

export function DashboardContent() {
  return (
    <div className="mt-6 space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Chart and activity placeholders */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PlaceholderSection
          icon={TrendingUp}
          title="Spend Breakdown"
          description="Weekly/monthly spend charts by network and case code will render here."
        />
        <PlaceholderSection
          icon={Activity}
          title="Recent Activity"
          description="Activity feed showing uploads, status changes, call logs, and compliance updates."
        />
      </div>
    </div>
  )
}
