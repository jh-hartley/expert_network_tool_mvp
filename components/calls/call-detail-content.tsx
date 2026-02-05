"use client"

import { Phone, FileText, BarChart3, DollarSign, Clock } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"
import { StatCard } from "@/components/stat-card"

export function CallDetailContent({ callId }: { callId: string }) {
  return (
    <div className="mt-6 space-y-6">
      {/* Call summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Duration" value="--" sub="Minutes" />
        <StatCard icon={DollarSign} label="Cost" value="--" sub="Rate x duration" />
        <StatCard icon={Phone} label="Status" value="--" sub={`Call ${callId}`} />
      </div>

      {/* Detail sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderSection
          icon={Phone}
          title="Call Details"
          description="Auto-filled expert fields, cost calculator, status timeline (scheduled, completed, cancelled)."
        />
        <PlaceholderSection
          icon={FileText}
          title="Transcript"
          description="Upload or link a transcript. View full text with keyword highlighting."
        />
      </div>
      <PlaceholderSection
        icon={BarChart3}
        title="KPI Extraction"
        description="Extracted KPIs, quotes, and data points from the linked transcript."
      />
    </div>
  )
}
