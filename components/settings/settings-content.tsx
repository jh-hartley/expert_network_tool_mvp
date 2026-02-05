"use client"

import {
  Briefcase,
  EyeOff,
  HardDrive,
  Trash2,
  Download,
  Upload,
} from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

const sections = [
  {
    icon: Briefcase,
    title: "Case Setup",
    description:
      "Case code, networks in use, default boilerplate rationale for CID requests.",
  },
  {
    icon: EyeOff,
    title: "Anonymisation Rules",
    description:
      "Target terms to redact, regex patterns, and anonymisation label configuration.",
  },
  {
    icon: HardDrive,
    title: "Data Retention",
    description:
      "All data is stored in localStorage only. Clearing browser data will remove all records.",
  },
  {
    icon: Trash2,
    title: "Reset All Data",
    description:
      "Clear all localStorage data and re-seed with default mock records.",
  },
  {
    icon: Download,
    title: "Export JSON",
    description:
      "Download all workspace data as a JSON file for backup or transfer.",
  },
  {
    icon: Upload,
    title: "Import JSON",
    description:
      "Import a previously exported JSON file to restore workspace data.",
  },
]

export function SettingsContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <PlaceholderSection
          key={section.title}
          icon={section.icon}
          title={section.title}
          description={section.description}
        />
      ))}
    </div>
  )
}
