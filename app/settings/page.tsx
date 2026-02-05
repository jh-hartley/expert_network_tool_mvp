import { PageHeader } from "@/components/page-header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Case setup, anonymisation rules, data management, and export/import."
      />
      <SettingsContent />
    </>
  )
}
