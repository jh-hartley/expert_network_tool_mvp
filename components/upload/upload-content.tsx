"use client"

import { Upload, ClipboardPaste, FileText, AlertTriangle, Eye } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PlaceholderSection } from "@/components/placeholder-section"

export function UploadContent() {
  return (
    <div className="mt-6 space-y-6">
      {/* Data safety notice */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-5 py-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium text-foreground">Data Safety Reminder</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            This is a prototype. Do not upload real client or confidential data.
          </p>
        </div>
      </div>

      {/* Input methods */}
      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState
          icon={Upload}
          title="Drag & Drop Upload"
          description="Support for PDF, DOCX, XLSX, TXT, and HTML files. Drop files here or click to browse."
          action={
            <button className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
              Browse Files
            </button>
          }
        />
        <EmptyState
          icon={ClipboardPaste}
          title="Paste Raw Text"
          description="Paste email content, web page text, or unstructured expert data from any source."
          action={
            <button className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
              Open Text Editor
            </button>
          }
        />
      </div>

      {/* Metadata & processing */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderSection
          icon={FileText}
          title="Metadata & Processing Options"
          description="Network name, case code, data type selector, and processing mode configuration."
        />
        <PlaceholderSection
          icon={Eye}
          title="Structured Preview"
          description="Parsed results, duplicate detection panel, and save/discard actions."
        />
      </div>
    </div>
  )
}
