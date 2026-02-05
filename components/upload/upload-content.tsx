"use client"

import { Upload, FileText, ClipboardPaste, AlertTriangle } from "lucide-react"
import { PlaceholderSection } from "@/components/placeholder-section"

export function UploadContent() {
  return (
    <div className="space-y-6">
      {/* Data safety banner */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Data Safety Reminder:</span>{" "}
          All data is stored locally in your browser. Do not upload real client or
          confidential data in this prototype.
        </p>
      </div>

      {/* Input methods */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderSection
          icon={Upload}
          title="Drag & Drop Upload"
          description="Support for PDF, DOCX, XLSX, TXT, and HTML files. Drop files here or click to browse."
        />
        <PlaceholderSection
          icon={ClipboardPaste}
          title="Paste Text"
          description="Paste raw email content, web page text, or unstructured expert data."
        />
      </div>

      {/* Metadata & processing */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderSection
          icon={FileText}
          title="Metadata & Processing"
          description="Network name, case code, data type selection, and processing mode options will appear here."
        />
        <PlaceholderSection
          icon={FileText}
          title="Structured Preview"
          description="Parsed results, duplicate detection panel, and save/discard actions will render here."
        />
      </div>
    </div>
  )
}
