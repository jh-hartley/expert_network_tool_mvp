"use client"

import {
  Users,
  Phone,
  DollarSign,
  ShieldCheck,
  ClipboardList,
  Activity,
} from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

const statCards = [
  { label: "Total Experts", value: "7", sub: "+2 this week", icon: Users },
  { label: "Calls Scheduled", value: "2", sub: "This week", icon: Phone },
  { label: "Total Spend", value: "$2,712", sub: "Forecast: $3,350", icon: DollarSign },
  { label: "Compliance", value: "1 pending", sub: "5 cleared, 1 declined", icon: ShieldCheck },
  { label: "AI Surveys", value: "2 done", sub: "1 pending", icon: ClipboardList },
]

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PlaceholderSection
          icon={DollarSign}
          title="Spend Breakdown"
          description="Spend charts and forecasts will be rendered here."
        />
        <PlaceholderSection
          icon={Activity}
          title="Recent Activity"
          description="Activity feed showing uploads, status changes, and call logs will appear here."
        />
      </div>
    </div>
  )
}
