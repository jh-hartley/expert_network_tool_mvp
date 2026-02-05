"use client"

import { useState } from "react"
import { User, FileQuestion, Phone, StickyNote, ShieldCheck } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Profile", icon: User },
  { label: "Screening", icon: FileQuestion },
  { label: "Calls", icon: Phone },
  { label: "Notes", icon: StickyNote },
  { label: "Compliance", icon: ShieldCheck },
]

export function ExpertDetailContent({ expertId }: { expertId: string }) {
  const [activeTab, setActiveTab] = useState("Profile")

  return (
    <div className="mt-6 space-y-6">
      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
              activeTab === tab.label
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content placeholder */}
      <PlaceholderSection
        icon={tabs.find((t) => t.label === activeTab)?.icon || User}
        title={`${activeTab} -- Expert ${expertId}`}
        description={`${activeTab} data for this expert will be displayed here. This includes standardised profile fields, screening Q&A, call history, notes, and compliance status.`}
      />
    </div>
  )
}
