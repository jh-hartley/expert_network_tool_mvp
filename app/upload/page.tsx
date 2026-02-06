"use client"

import { Upload, FileText, Users, AlertCircle, CheckCircle2 } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import PageHeader from "../components/page-header"
import WipBanner from "../components/wip-banner"
import EmptyState from "../components/empty-state"
import { useStore } from "@/lib/use-store"
import { uid } from "@/lib/storage"
import type { Expert, Network, Industry, ComplianceStatus } from "@/lib/types"

interface ParsedRow {
  name: string
  title: string
  company: string
  industry: Industry
  network: Network
  compliance: ComplianceStatus
  tags: string[]
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []
  // skip header
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    return {
      name: cols[0] || "Unknown",
      title: cols[1] || "",
      company: cols[2] || "",
      industry: (cols[3] as Industry) || "Technology",
      network: (cols[4] as Network) || "Direct",
      compliance: (cols[5] as ComplianceStatus) || "pending",
      tags: cols[6] ? cols[6].split(";").map((t) => t.trim()) : [],
    }
  })
}

export default function UploadPage() {
  const { items: experts, add } = useStore("experts")
  const [dragOver, setDragOver] = useState(false)
  const [parsed, setParsed] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      setParsed(rows)
      if (rows.length === 0) {
        toast.error("No valid rows found in the file.")
      } else {
        toast.success(`Parsed ${rows.length} expert${rows.length === 1 ? "" : "s"} from ${file.name}`)
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleImport() {
    const now = new Date().toISOString()
    let duplicates = 0
    parsed.forEach((row) => {
      const exists = experts.some(
        (ex) => ex.name.toLowerCase() === row.name.toLowerCase() && ex.company.toLowerCase() === row.company.toLowerCase(),
      )
      if (exists) {
        duplicates++
        return
      }
      const expert: Expert = {
        id: uid(),
        name: row.name,
        title: row.title,
        company: row.company,
        industry: row.industry,
        network: row.network,
        compliance: row.compliance,
        tags: row.tags,
        callCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      add(expert)
    })
    const imported = parsed.length - duplicates
    toast.success(`Imported ${imported} expert${imported === 1 ? "" : "s"}${duplicates > 0 ? `, ${duplicates} duplicate${duplicates === 1 ? "" : "s"} skipped` : ""}`)
    setParsed([])
    setFileName(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Upload"
        description="Import expert profiles from CSV files exported from GLG, AlphaSights, or other network platforms."
      />
      <WipBanner feature="upload" />

      {/* Drop zone */}
      <div className="mt-6">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileRef.current?.click()
          }}
          className={[
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors",
            dragOver
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/30",
          ].join(" ")}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Drop a CSV file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Expects columns: Name, Title, Company, Industry, Network, Compliance, Tags
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      </div>

      {/* Parsed preview */}
      {parsed.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Preview ({parsed.length} records from {fileName})
              </h2>
            </div>
            <button
              type="button"
              onClick={handleImport}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Import All
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Network</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsed.slice(0, 10).map((row, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-sm text-foreground">{row.name}</td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.title}</td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.company}</td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.network}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={row.compliance} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.length > 10 && (
              <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                ...and {parsed.length - 10} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {parsed.length === 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">CSV Format</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Standard CSV with headers. Supports exports from GLG, AlphaSights, Third Bridge, and Guidepoint.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Deduplication</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Duplicates are automatically detected by name and company during import.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Compliance</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              New experts default to "pending" compliance status until manually reviewed and cleared.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    cleared: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    blocked: "bg-red-50 text-red-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
