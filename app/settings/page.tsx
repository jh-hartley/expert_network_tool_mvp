"use client"

import { useState, useRef } from "react"
import { Download, Upload, RotateCcw, Database, Shield, Bell } from "lucide-react"
import { toast } from "sonner"
import PageHeader from "../components/page-header"
import Modal from "../components/modal"
import { exportJSON, importJSON, resetAll } from "@/lib/storage"
import { notifyStoreChange } from "@/lib/use-store"

export default function SettingsPage() {
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const json = exportJSON()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consensus-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported successfully.")
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const result = importJSON(text)
      if (result.success) {
        notifyStoreChange()
        toast.success("Data imported successfully.")
      } else {
        toast.error(`Import failed: ${result.error}`)
      }
    }
    reader.readAsText(file)
    // reset so the same file can be re-selected
    e.target.value = ""
  }

  function handleReset() {
    resetAll()
    notifyStoreChange()
    setResetModalOpen(false)
    toast.success("All data has been reset to demo defaults.")
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Settings"
  description="Manage application data, export backups, and configure preferences."
      />

      <div className="mt-6 flex flex-col gap-4">
        {/* Data Management section */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Data Management
          </h2>
          <div className="flex flex-col gap-3">
            {/* Export */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Export Data</p>
                  <p className="text-xs text-muted-foreground">Download all experts, calls, transcripts, and surveys as JSON.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Import Data</p>
                  <p className="text-xs text-muted-foreground">Restore from a previously exported JSON backup.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Upload className="h-3.5 w-3.5" />
                Import JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>

            {/* Reset */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Reset to Defaults</p>
                  <p className="text-xs text-muted-foreground">Clear all data and reload the synthetic demo dataset.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset All
              </button>
            </div>
          </div>
        </section>

        {/* Placeholder sections */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Preferences
          </h2>
          <div className="flex flex-col gap-3">
            <SettingsRow
              icon={Database}
              title="Storage"
              description="Data is stored in browser localStorage. No server connection required."
              badge="Local"
            />
            <SettingsRow
              icon={Shield}
              title="Compliance Rules"
              description="Configure automatic compliance screening rules and blocked-entity lists."
              badge="Coming Soon"
            />
            <SettingsRow
              icon={Bell}
              title="Notifications"
              description="Email and in-app notification preferences for call reminders and survey completions."
              badge="Coming Soon"
            />
          </div>
        </section>
      </div>

      {/* Reset confirmation modal */}
      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset All Data"
        description="This action cannot be undone."
      >
        <p className="text-sm text-muted-foreground">
          This will permanently delete all current data and replace it with the default demo dataset.
          Consider exporting your data first.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setResetModalOpen(false)}
            className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-8 items-center rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Reset All Data
          </button>
        </div>
      </Modal>
    </div>
  )
}

function SettingsRow({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  badge: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {badge}
      </span>
    </div>
  )
}
