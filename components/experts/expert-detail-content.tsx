"use client"

import { User, FileQuestion, Phone, StickyNote, ShieldCheck } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

const tabs = [
  { label: "Profile", icon: User },
  { label: "Screening", icon: FileQuestion },
  { label: "Calls", icon: Phone },
  { label: "Notes", icon: StickyNote },
  { label: "Compliance", icon: ShieldCheck },
]

export function ExpertDetailContent({ expertId }: { expertId: string }) {
  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              i === 0
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <PlaceholderSection
        icon={User}
        title={`Expert ${expertId}`}
        description="Standardised profile fields, screening Q&A, call history, notes, and CID compliance status will be displayed across tabs here."
      />
    </div>
  )
}
