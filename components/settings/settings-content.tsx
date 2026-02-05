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
      "Retention policy configuration. Production: server-side; prototype: browser-only.",
  },
  {
    icon: Trash2,
    title: "Reset Workspace",
    description:
      "Clear all workspace data and reset to default state.",
  },
  {
    icon: Download,
    title: "Export Data",
    description:
      "Download all workspace data as a structured JSON file for backup or transfer.",
  },
  {
    icon: Upload,
    title: "Import Data",
    description:
      "Import a previously exported file to restore workspace data.",
  },
]

export function SettingsContent() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
