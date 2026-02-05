"use client"

import { Phone, FileText, BarChart3 } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

export function CallDetailContent({ callId }: { callId: string }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderSection
          icon={Phone}
          title={`Call ${callId} — Details`}
          description="Auto-filled expert fields, cost calculator (rate x duration), status timeline (scheduled, completed, cancelled)."
        />
        <PlaceholderSection
          icon={FileText}
          title="Transcript"
          description="Upload transcript button and linked transcript text viewer."
        />
      </div>
      <PlaceholderSection
        icon={BarChart3}
        title="KPI Extraction"
        description="Extracted KPIs and quotes from the transcript will be displayed here."
      />
    </div>
  )
}
