"use client"

import { ClipboardList } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

export function SurveysContent() {
  return (
    <div className="space-y-6">
      <PlaceholderSection
        icon={ClipboardList}
        title="AI Surveys Table"
        description="Table with columns: Company, Respondent Type, Date, KPI Fields (NPS, etc.), Status, Linked Call/Expert. Row actions: View/Edit survey."
      />
    </div>
  )
}
