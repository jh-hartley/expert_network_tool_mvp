"use client"

import { ClipboardList, BarChart3 } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

export function SurveyDetailContent({ surveyId }: { surveyId: string }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderSection
          icon={ClipboardList}
          title={`Survey ${surveyId} — Editor`}
          description="Manual edit of KPI fields, response text, and linked transcript/call/expert."
        />
        <PlaceholderSection
          icon={BarChart3}
          title="Extract KPIs"
          description="Mocked KPI extraction from response text. Shows extracted values upon button press."
        />
      </div>
    </div>
  )
}
