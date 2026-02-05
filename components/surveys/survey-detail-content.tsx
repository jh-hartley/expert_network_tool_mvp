"use client"

import { ClipboardList, BarChart3, Link as LinkIcon } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

export function SurveyDetailContent({ surveyId }: { surveyId: string }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderSection
          icon={ClipboardList}
          title={`Survey ${surveyId} -- Editor`}
          description="Manual edit of KPI fields, response text, linked transcript/call/expert references."
        />
        <PlaceholderSection
          icon={BarChart3}
          title="KPI Extraction"
          description="Trigger extraction from response text. Shows extracted values, confidence scores, and source references."
        />
      </div>
      <PlaceholderSection
        icon={LinkIcon}
        title="Linked Records"
        description="Connected experts, calls, and transcripts associated with this survey."
      />
    </div>
  )
}
