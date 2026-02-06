"use client"

import {
  Upload,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  ClipboardPaste,
  File,
  Mail,
  Table2,
  X,
  ChevronDown,
  ChevronUp,
  Braces,
} from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import PageHeader from "../components/page-header"
import WipBanner from "../components/wip-banner"
import { useStore } from "@/lib/use-store"
import { uid } from "@/lib/storage"
import type { Expert, Network, Industry, ComplianceStatus } from "@/lib/types"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type InputFormat = "csv" | "eml" | "text" | "unknown"

interface ParsedRow {
  name: string
  title: string
  company: string
  industry: Industry
  network: Network
  compliance: ComplianceStatus
  tags: string[]
}

interface ParseResult {
  format: InputFormat
  rows: ParsedRow[]
  rawInput: string
  /** What would be sent to the LLM for unstructured inputs */
  llmPayload: LLMPayload | null
}

interface LLMPayload {
  systemPrompt: string
  userContent: string
  expectedSchema: Record<string, string>
}

/* ------------------------------------------------------------------ */
/*  Format detection                                                   */
/* ------------------------------------------------------------------ */

function detectFormat(text: string, fileName?: string): InputFormat {
  const ext = fileName?.split(".").pop()?.toLowerCase()
  if (ext === "csv") return "csv"
  if (ext === "eml" || ext === "msg") return "eml"
  if (ext === "txt") return "text"

  // Content-based detection
  const trimmed = text.trim()
  const firstLine = trimmed.split("\n")[0]

  // CSV: first line looks like a header row with commas
  if (
    firstLine.includes(",") &&
    trimmed.split("\n").length > 1 &&
    firstLine.split(",").length >= 3
  ) {
    // Check if most lines have the same number of commas
    const lines = trimmed.split("\n").filter((l) => l.trim())
    const commaCount = firstLine.split(",").length
    const matchingLines = lines.filter(
      (l) => Math.abs(l.split(",").length - commaCount) <= 1
    )
    if (matchingLines.length > lines.length * 0.7) return "csv"
  }

  // EML: starts with RFC 822 headers
  if (
    /^(From|To|Subject|Date|MIME-Version|Content-Type):\s/im.test(
      trimmed.slice(0, 500)
    )
  ) {
    return "eml"
  }

  // Default to raw text
  return "text"
}

/* ------------------------------------------------------------------ */
/*  CSV parser (structured)                                            */
/* ------------------------------------------------------------------ */

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  const header = lines[0].toLowerCase()
  const hasExpectedHeaders =
    header.includes("name") && (header.includes("company") || header.includes("title"))

  if (!hasExpectedHeaders) return []

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

/* ------------------------------------------------------------------ */
/*  EML parser (semi-structured)                                       */
/* ------------------------------------------------------------------ */

function parseEML(text: string): { body: string; headers: Record<string, string> } {
  const headers: Record<string, string> = {}
  const lines = text.split("\n")
  let bodyStart = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === "") {
      bodyStart = i + 1
      break
    }
    const match = line.match(/^([\w-]+):\s*(.*)$/)
    if (match) {
      headers[match[1].toLowerCase()] = match[2].trim()
    }
  }

  return { body: lines.slice(bodyStart).join("\n").trim(), headers }
}

/* ------------------------------------------------------------------ */
/*  Best-effort name extraction for preview                            */
/* ------------------------------------------------------------------ */

function extractNamesFromText(text: string): ParsedRow[] {
  const rows: ParsedRow[] = []

  // Pattern: "Name: <name>" or numbered lists "1. <name>"
  const namePatterns = [
    /Name:\s*(.+)/gi,
    /^\d+\.\s+(?:Dr\.\s+|Prof\.\s+)?([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/gm,
  ]

  const seenNames = new Set<string>()

  for (const pattern of namePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim().replace(/[,;:]+$/, "")
      if (name.length < 3 || name.length > 60) continue
      if (seenNames.has(name.toLowerCase())) continue
      seenNames.add(name.toLowerCase())

      // Try to extract title/company from surrounding text
      const contextStart = Math.max(0, match.index - 20)
      const contextEnd = Math.min(text.length, match.index + 500)
      const context = text.slice(contextStart, contextEnd)

      let title = ""
      let company = ""
      let network: Network = "Direct"
      let compliance: ComplianceStatus = "pending"

      const titleMatch = context.match(
        /(?:Title|Current Role|Role):\s*(.+?)(?:\n|$)/i
      )
      if (titleMatch) {
        const parts = titleMatch[1].split(/,\s*/)
        title = parts[0].trim()
        if (parts.length > 1) company = parts.slice(1).join(", ").trim()
      }

      const companyMatch = context.match(
        /(?:Company|Organization|Employer):\s*(.+?)(?:\n|$)/i
      )
      if (companyMatch) company = companyMatch[1].trim()

      if (/\bGLG\b/i.test(context)) network = "GLG"
      else if (/\bAlphaSights\b/i.test(context)) network = "AlphaSights"
      else if (/\bThird Bridge\b/i.test(context)) network = "Third Bridge"
      else if (/\bGuidepoint\b/i.test(context)) network = "Guidepoint"

      if (/\bcleared?\b/i.test(context)) compliance = "cleared"
      else if (/\bblocked?\b|restrict/i.test(context)) compliance = "blocked"

      rows.push({
        name,
        title,
        company,
        industry: "Technology",
        network,
        compliance,
        tags: [],
      })
    }
  }

  return rows
}

/* ------------------------------------------------------------------ */
/*  Build LLM payload                                                  */
/* ------------------------------------------------------------------ */

const LLM_SYSTEM_PROMPT = `You are a data extraction assistant for an expert network management tool. Your job is to parse unstructured text containing expert profile information and return structured JSON.

Extract every expert mentioned in the input. For each expert, extract:
- name: Full name
- title: Current or most recent job title
- company: Current or most recent company
- industry: Best-fit category from [Technology, Healthcare, Energy, Finance, Consumer]
- network: Which expert network referred them, from [GLG, AlphaSights, Third Bridge, Guidepoint, Direct]
- compliance: Compliance status from [cleared, pending, blocked] based on any compliance notes
- tags: Array of relevant keywords/topics
- rate: Hourly rate if mentioned (include currency)
- networkId: Network member ID if mentioned

Return a JSON array of objects. If a field cannot be determined, use null.`

const EXPECTED_SCHEMA: Record<string, string> = {
  name: "string — Full name of the expert",
  title: "string — Current or most recent job title",
  company: "string — Current or most recent company",
  industry: "Technology | Healthcare | Energy | Finance | Consumer",
  network: "GLG | AlphaSights | Third Bridge | Guidepoint | Direct",
  compliance: "cleared | pending | blocked",
  tags: "string[] — Relevant keywords",
  rate: "string | null — Hourly rate with currency",
  networkId: "string | null — Network member ID",
}

function buildLLMPayload(
  text: string,
  format: InputFormat,
  headers?: Record<string, string>
): LLMPayload {
  let userContent = ""

  if (format === "eml" && headers) {
    userContent = `[Email metadata]\nFrom: ${headers.from || "unknown"}\nTo: ${headers.to || "unknown"}\nSubject: ${headers.subject || "unknown"}\nDate: ${headers.date || "unknown"}\n\n[Email body]\n${text}`
  } else {
    userContent = text
  }

  return {
    systemPrompt: LLM_SYSTEM_PROMPT,
    userContent,
    expectedSchema: EXPECTED_SCHEMA,
  }
}

/* ------------------------------------------------------------------ */
/*  Master parse function                                              */
/* ------------------------------------------------------------------ */

function parseInput(rawInput: string, fileName?: string): ParseResult {
  const format = detectFormat(rawInput, fileName)

  if (format === "csv") {
    const rows = parseCSV(rawInput)
    return {
      format,
      rows,
      rawInput,
      llmPayload: null, // CSV is already structured -- no LLM needed
    }
  }

  if (format === "eml") {
    const { body, headers } = parseEML(rawInput)
    const rows = extractNamesFromText(body)
    return {
      format,
      rows,
      rawInput,
      llmPayload: buildLLMPayload(body, format, headers),
    }
  }

  // Raw text
  const rows = extractNamesFromText(rawInput)
  return {
    format,
    rows,
    rawInput,
    llmPayload: buildLLMPayload(rawInput, format),
  }
}

/* ------------------------------------------------------------------ */
/*  Component: StatusBadge                                             */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    cleared: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    blocked: "bg-red-50 text-red-700",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status] || styles.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Component: FormatBadge                                             */
/* ------------------------------------------------------------------ */

function FormatBadge({ format }: { format: InputFormat }) {
  const config: Record<
    InputFormat,
    { label: string; icon: React.ElementType; className: string }
  > = {
    csv: {
      label: "CSV",
      icon: Table2,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
    },
    eml: {
      label: "Email",
      icon: Mail,
      className: "bg-blue-50 text-blue-700 ring-blue-200/50",
    },
    text: {
      label: "Raw Text",
      icon: FileText,
      className: "bg-violet-50 text-violet-700 ring-violet-200/50",
    },
    unknown: {
      label: "Unknown",
      icon: AlertCircle,
      className: "bg-muted text-muted-foreground ring-border",
    },
  }
  const c = config[format]
  const Icon = c.icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${c.className}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {c.label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UploadPage() {
  const { items: experts, add } = useStore("experts")
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState("")
  const [showDebug, setShowDebug] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    setPasteMode(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseInput(text, file.name)
      setResult(parsed)
      if (parsed.rows.length === 0 && parsed.format === "csv") {
        toast.error("No valid rows found. Check the CSV headers match the expected format.")
      } else if (parsed.rows.length === 0) {
        toast.success(
          `File loaded (${parsed.format.toUpperCase()} format). No experts extracted yet -- LLM parsing needed.`
        )
      } else {
        toast.success(
          `Parsed ${parsed.rows.length} expert${parsed.rows.length === 1 ? "" : "s"} from ${file.name} (${parsed.format.toUpperCase()})`
        )
      }
    }
    reader.readAsText(file)
  }

  function handlePaste() {
    if (!pasteText.trim()) {
      toast.error("Please paste or type some text first.")
      return
    }
    setFileName(null)
    const parsed = parseInput(pasteText)
    setResult(parsed)
    if (parsed.rows.length > 0) {
      toast.success(
        `Detected ${parsed.format.toUpperCase()} format. Extracted ${parsed.rows.length} expert${parsed.rows.length === 1 ? "" : "s"}.`
      )
    } else {
      toast.success(
        `Text loaded (${parsed.format.toUpperCase()} format). Full extraction will require LLM parsing.`
      )
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleClear() {
    setResult(null)
    setFileName(null)
    setPasteText("")
    setPasteMode(false)
    setShowDebug(false)
  }

  function handleImport() {
    if (!result) return
    const now = new Date().toISOString()
    let duplicates = 0
    result.rows.forEach((row) => {
      const exists = experts.some(
        (ex) =>
          ex.name.toLowerCase() === row.name.toLowerCase() &&
          ex.company.toLowerCase() === row.company.toLowerCase()
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
    const imported = result.rows.length - duplicates
    toast.success(
      `Imported ${imported} expert${imported === 1 ? "" : "s"}${duplicates > 0 ? `, ${duplicates} duplicate${duplicates === 1 ? "" : "s"} skipped` : ""}`
    )
    handleClear()
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Upload"
        description="Import expert profiles from CSV files, email exports, or raw text copied from network recommendations."
      />
      <WipBanner feature="upload" />

      {/* ---- Input mode toggle ---- */}
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setPasteMode(false)
            handleClear()
          }}
          className={[
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            !pasteMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          ].join(" ")}
        >
          <File className="h-3 w-3" />
          Upload file
        </button>
        <button
          type="button"
          onClick={() => {
            setPasteMode(true)
            setResult(null)
            setFileName(null)
          }}
          className={[
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            pasteMode
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          ].join(" ")}
        >
          <ClipboardPaste className="h-3 w-3" />
          Paste text
        </button>
        {result && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* ---- File drop zone ---- */}
      {!pasteMode && !result && (
        <div className="mt-4">
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
              Drop a file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports .csv, .eml, and .txt files
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.eml,.txt,.msg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>
        </div>
      )}

      {/* ---- Paste text area ---- */}
      {pasteMode && !result && (
        <div className="mt-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste expert recommendation text, an email body, or CSV data here..."
            className="min-h-[240px] w-full rounded-lg border border-border bg-muted/20 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handlePaste}
              disabled={!pasteText.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Parse text
            </button>
            <p className="text-xs text-muted-foreground">
              The parser will auto-detect the format (CSV, email, or raw text)
            </p>
          </div>
        </div>
      )}

      {/* ---- Parsed preview ---- */}
      {result && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Preview
                {fileName && <span> -- {fileName}</span>}
              </h2>
              <FormatBadge format={result.format} />
              <span className="text-[11px] text-muted-foreground">
                {result.rows.length} expert{result.rows.length === 1 ? "" : "s"}{" "}
                extracted
              </span>
            </div>
            {result.rows.length > 0 && (
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Import All
              </button>
            )}
          </div>

          {result.rows.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Title
                      </th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Company
                      </th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Network
                      </th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.rows.slice(0, 20).map((row, i) => (
                      <tr key={i} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                          {row.name}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground">
                          {row.title || (
                            <span className="italic text-muted-foreground/50">
                              needs LLM
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground">
                          {row.company || (
                            <span className="italic text-muted-foreground/50">
                              needs LLM
                            </span>
                          )}
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
              {result.rows.length > 20 && (
                <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                  ...and {result.rows.length - 20} more
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    No experts extracted by the rule-based parser
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    This is expected for unstructured text. Once the LLM
                    pipeline is connected, this data will be sent for
                    AI-powered extraction. See the debug panel below for the
                    payload that would be sent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Extraction method note */}
          {result.llmPayload && result.rows.length > 0 && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3">
              <p className="text-xs leading-relaxed text-blue-800">
                <span className="font-semibold">Note:</span> The preview above
                was generated by a rule-based parser (regex pattern matching).
                When the LLM pipeline is connected, this data will be sent for
                more accurate AI extraction. Toggle the debug panel below to see
                the LLM payload.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---- Debug panel ---- */}
      {result && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/30"
          >
            <Braces className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-foreground">
              Debug: Parsed data &amp; LLM payload
            </span>
            <span className="text-[11px] text-muted-foreground">
              {showDebug ? "Hide" : "Show"}
            </span>
            {showDebug ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          {showDebug && (
            <div className="mt-3 space-y-4">
              {/* Parse summary */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Parse Summary
                </h3>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Detected format
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {result.format.toUpperCase()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Input size
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {result.rawInput.length.toLocaleString()} chars
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Experts found
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {result.rows.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Needs LLM
                    </dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      {result.llmPayload ? "Yes" : "No (structured CSV)"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Extracted rows as JSON */}
              {result.rows.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Extracted Data (JSON)
                  </h3>
                  <pre className="mt-3 max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground/80 font-mono">
                    {JSON.stringify(result.rows, null, 2)}
                  </pre>
                </div>
              )}

              {/* LLM payload */}
              {result.llmPayload && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    LLM Payload (what would be sent to the model)
                  </h3>

                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        System Prompt
                      </p>
                      <pre className="mt-1 max-h-32 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground/80 font-mono">
                        {result.llmPayload.systemPrompt}
                      </pre>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        User Content (input to parse)
                      </p>
                      <pre className="mt-1 max-h-48 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground/80 font-mono">
                        {result.llmPayload.userContent}
                      </pre>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Expected Response Schema
                      </p>
                      <pre className="mt-1 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground/80 font-mono">
                        {JSON.stringify(
                          result.llmPayload.expectedSchema,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw input */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Raw Input
                </h3>
                <pre className="mt-3 max-h-48 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-[11px] leading-relaxed text-foreground/80 font-mono whitespace-pre-wrap">
                  {result.rawInput}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Tips (shown when no result) ---- */}
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
              Standard CSV with headers. Parsed directly without LLM. Supports
              exports from GLG, AlphaSights, Third Bridge, and Guidepoint.
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
              Upload .eml files directly. Headers are extracted for metadata and
              the body is parsed for expert profiles.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              Paste Raw Text
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Copy and paste text from emails, documents, or screening
              responses. Auto-detected and queued for LLM parsing.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
