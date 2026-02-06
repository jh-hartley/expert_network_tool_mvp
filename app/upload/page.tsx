"use client"

import {
  Upload, FileText, CheckCircle2, ClipboardPaste, Mail, Table2, X,
  ChevronDown, ChevronUp, Braces, ArrowRight, AlertCircle,
} from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import PageHeader from "../components/page-header"
import WipBanner from "../components/wip-banner"
import { useStore } from "@/lib/use-store"
import { uid } from "@/lib/storage"
import { buildExtractionPayload } from "@/lib/llm"
import type { InputFormat as LlmInputFormat } from "@/lib/llm"
import type { Expert, Network, Industry, ComplianceStatus } from "@/lib/types"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type InputFormat = "csv" | "email" | "raw-text"

interface ParsedRow {
  name: string
  title: string
  company: string
  industry: Industry
  network: Network
  compliance: ComplianceStatus
  tags: string[]
}

interface IngestResult {
  format: InputFormat
  sourceName: string
  rawContent: string
  fullRaw: string
  parsedRows: ParsedRow[]
  needsLlm: boolean
}

/* ------------------------------------------------------------------ */
/*  Parsers & helpers                                                  */
/* ------------------------------------------------------------------ */

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    return {
      name: cols[0] || "Unknown", title: cols[1] || "", company: cols[2] || "",
      industry: (cols[3] as Industry) || "Technology",
      network: (cols[4] as Network) || "Direct",
      compliance: (cols[5] as ComplianceStatus) || "pending",
      tags: cols[6] ? cols[6].split(";").map((t) => t.trim()) : [],
    }
  })
}

function parseEmlBody(raw: string): string {
  const idx = raw.indexOf("\n\n")
  return idx === -1 ? raw : raw.slice(idx + 2).trim()
}

function extractEmlMeta(raw: string) {
  const get = (k: string) => {
    const m = raw.match(new RegExp(`^${k}:\\s*(.+)$`, "mi"))
    return m ? m[1].trim() : ""
  }
  return { from: get("From"), to: get("To"), subject: get("Subject"), date: get("Date") }
}

function detectFormat(file: File): InputFormat {
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "csv") return "csv"
  if (ext === "eml" || ext === "msg") return "email"
  return "raw-text"
}

function buildLlmPayload(r: IngestResult): object {
  return buildExtractionPayload(r.rawContent, r.format as LlmInputFormat)
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function UploadPage() {
  const { items: experts, add } = useStore("experts")
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [pasteText, setPasteText] = useState("")
  const [showPaste, setShowPaste] = useState(false)
  const [debugOpen, setDebugOpen] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const fmt = detectFormat(file)
    const reader = new FileReader()
    reader.onload = (e) => processInput(e.target?.result as string, fmt, file.name)
    reader.readAsText(file)
  }

  function handlePaste() {
    if (!pasteText.trim()) {
      toast.error("Please paste some text first.")
      return
    }
    processInput(pasteText, "raw-text", "Pasted text")
  }

  function processInput(text: string, format: InputFormat, source: string) {
    const rows = format === "csv" ? parseCSV(text) : []
    const needsLlm = format !== "csv"
    const ir: IngestResult = {
      format,
      sourceName: source,
      rawContent: format === "email" ? parseEmlBody(text) : text,
      fullRaw: text,
      parsedRows: rows,
      needsLlm,
    }
    setResult(ir)
    if (format === "csv") {
      rows.length === 0
        ? toast.error("No valid rows found.")
        : toast.success(`Parsed ${rows.length} expert${rows.length === 1 ? "" : "s"} from ${source}`)
    } else {
      toast.success(`Loaded ${format === "email" ? "email" : "raw text"} from ${source} -- ready for LLM parsing`)
    }
  }

  function handleImport() {
    if (!result || result.parsedRows.length === 0) return
    const now = new Date().toISOString()
    let dupes = 0
    result.parsedRows.forEach((row) => {
      if (
        experts.some(
          (ex) =>
            ex.name.toLowerCase() === row.name.toLowerCase() &&
            ex.company.toLowerCase() === row.company.toLowerCase()
        )
      ) {
        dupes++
        return
      }
      const expert: Expert = {
        id: uid(),
        ...row,
        callCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      add(expert)
    })
    const n = result.parsedRows.length - dupes
    toast.success(
      `Imported ${n} expert${n === 1 ? "" : "s"}${dupes > 0 ? `, ${dupes} skipped` : ""}`
    )
    setResult(null)
  }

  function clear() {
    setResult(null)
    setPasteText("")
    setShowPaste(false)
  }

  const eml =
    result?.format === "email" ? extractEmlMeta(result.fullRaw) : null

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Upload"
        description="Import expert profiles from CSV files, network emails, or pasted text. Structured CSV is parsed directly; unstructured content is queued for LLM extraction."
      />
      <WipBanner feature="upload" />

      {/* ---- Input methods ---- */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* File drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
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
            Drop a file here, or click to browse
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Table2 className="h-2.5 w-2.5" /> .csv
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Mail className="h-2.5 w-2.5" /> .eml
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <FileText className="h-2.5 w-2.5" /> .txt
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.eml,.txt,.msg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </div>

        {/* Paste raw text */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <button
            type="button"
            onClick={() => setShowPaste(!showPaste)}
            className="flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <ClipboardPaste className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Paste raw text
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Paste an email body, screening notes, or any unstructured expert
                data
              </p>
            </div>
            {showPaste ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showPaste && (
            <div className="border-t border-border px-5 py-4">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste expert recommendation text here..."
                rows={8}
                className="w-full resize-none rounded-md border border-border bg-muted/20 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={!pasteText.trim()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Process text
                </button>
                {pasteText.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {pasteText.length.toLocaleString()} characters
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- CSV preview table ---- */}
      {result && result.format === "csv" && result.parsedRows.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                CSV Preview ({result.parsedRows.length} records from{" "}
                {result.sourceName})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Import All
              </button>
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Name", "Title", "Company", "Network", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.parsedRows.slice(0, 10).map((row, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-2.5 text-sm text-foreground">
                        {row.name}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {row.title}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {row.company}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {row.network}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={row.compliance} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.parsedRows.length > 10 && (
              <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                ...and {result.parsedRows.length - 10} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Unstructured content (email / raw text) ---- */}
      {result && result.needsLlm && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.format === "email" ? (
                <Mail className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {result.format === "email" ? "Email" : "Raw text"} loaded from{" "}
                {result.sourceName}
              </h2>
            </div>
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {eml && eml.subject && (
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 rounded-md border border-border bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
              {eml.from && (
                <span>
                  <span className="font-semibold text-foreground/70">
                    From:
                  </span>{" "}
                  {eml.from}
                </span>
              )}
              {eml.subject && (
                <span>
                  <span className="font-semibold text-foreground/70">
                    Subject:
                  </span>{" "}
                  {eml.subject}
                </span>
              )}
              {eml.date && (
                <span>
                  <span className="font-semibold text-foreground/70">
                    Date:
                  </span>{" "}
                  {eml.date}
                </span>
              )}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Extracted content
              </span>
              <span className="text-[11px] text-muted-foreground">
                {result.rawContent.length.toLocaleString()} characters
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/80">
                {result.rawContent}
              </pre>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-sm leading-relaxed text-blue-800">
              <span className="font-medium">Unstructured content</span>{" "}
              <span className="text-blue-700">
                -- this data will be sent to an LLM for structured extraction
                once the parsing pipeline is connected. See the debug panel
                below for the planned payload.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ---- Debug panel ---- */}
      {result && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setDebugOpen(!debugOpen)}
            className="flex w-full items-center gap-2 rounded-t-lg border border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <Braces className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {"Debug: Parse result & LLM payload"}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              Dev only
            </span>
            {debugOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          {debugOpen && (
            <div className="overflow-hidden rounded-b-lg border border-t-0 border-border bg-card">
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                <DebugCell label="Format" value={result.format} />
                <DebugCell label="Source" value={result.sourceName} />
                <DebugCell
                  label="Content length"
                  value={`${result.rawContent.length.toLocaleString()} chars`}
                />
                <DebugCell
                  label="Parse method"
                  value={
                    result.needsLlm ? "LLM (pending)" : "CSV (direct)"
                  }
                />
              </div>

              {!result.needsLlm && result.parsedRows.length > 0 && (
                <div className="border-t border-border p-4">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Parsed rows (direct CSV extraction)
                  </h3>
                  <div className="max-h-48 overflow-auto rounded-md bg-muted/20 p-3">
                    <pre className="font-mono text-[11px] leading-relaxed text-foreground/70">
                      {JSON.stringify(result.parsedRows, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {result.needsLlm && (
                <div className="border-t border-border p-4">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Planned LLM payload
                  </h3>
                  <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                    The following JSON shows the API call that will be made to
                    the LLM once the parsing pipeline is connected.
                  </p>
                  <div className="max-h-64 overflow-auto rounded-md bg-muted/20 p-3">
                    <pre className="font-mono text-[11px] leading-relaxed text-foreground/70">
                      {JSON.stringify(buildLlmPayload(result), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="border-t border-border p-4">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Raw content (first 2,000 characters)
                </h3>
                <div className="max-h-48 overflow-auto rounded-md bg-muted/20 p-3">
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/70">
                    {result.rawContent.slice(0, 2000)}
                    {result.rawContent.length > 2000 && "\n\n... truncated"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Tips (no result loaded) ---- */}
      {!result && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Table2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              CSV / Spreadsheet
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Standard CSV with headers. Parsed directly into structured expert
              records.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              Email Files
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Upload .eml files from network emails. Headers extracted, body
              queued for LLM parsing.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              Raw Text Paste
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Paste any unstructured text -- email bodies, screening notes, or
              copied profiles.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    cleared: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    blocked: "bg-red-50 text-red-700",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${s[status] || s.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function DebugCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
