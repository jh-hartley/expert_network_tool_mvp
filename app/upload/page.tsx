"use client"

import {
  Upload, FileText, CheckCircle2, ClipboardPaste, Mail, Table2, X,
  ChevronDown, ChevronUp, ArrowRight, AlertCircle, Loader2, Sparkles,
  Plug, ArrowRightLeft,
} from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import PageHeader from "../components/page-header"
import { useStore } from "@/lib/use-store"
import { uid } from "@/lib/storage"
import { extractExperts, type ExtractionError } from "@/lib/llm-client"
import type { ExtractionResult, InputFormat as LlmInputFormat } from "@/lib/llm"
import type { ExtractedExpert } from "@/lib/llm"
import { mergeNewExperts, type MergeResult } from "@/lib/expert-profiles"
import type { Expert, Network, Industry, ComplianceStatus } from "@/lib/types"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type InputFormat = "csv" | "email" | "raw-text"
type InputMode = "file" | "paste" | null

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

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function UploadPage() {
  const { items: experts, add } = useStore("experts")

  // Input state
  const [inputMode, setInputMode] = useState<InputMode>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pasteText, setPasteText] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Processing state
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extractionDebug, setExtractionDebug] = useState<Record<string, unknown> | null>(null)
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null)
  const [rawLlmText, setRawLlmText] = useState<string | null>(null)

  // Raw content view -- visible before submission so user can sense-check
  const [rawOpen, setRawOpen] = useState(false)
  // LLM response view -- collapsed by default
  const [llmResponseOpen, setLlmResponseOpen] = useState(false)
  // Preview of parsed input (shown before LLM call)
  const [preview, setPreview] = useState<IngestResult | null>(null)

  const hasInput = inputMode === "file" ? !!selectedFile : inputMode === "paste" ? pasteText.trim().length > 0 : false

  function buildIngestResult(text: string, format: InputFormat, source: string): IngestResult {
    const rows = format === "csv" ? parseCSV(text) : []
    return {
      format,
      sourceName: source,
      rawContent: format === "email" ? parseEmlBody(text) : text,
      fullRaw: text,
      parsedRows: rows,
      needsLlm: format !== "csv",
    }
  }

  async function selectFile(file: File) {
    setSelectedFile(file)
    setInputMode("file")
    setPasteText("")
    setResult(null)
    setExtraction(null)
    setExtractionError(null)
    // Immediately parse file to show preview
    try {
      const text = await file.text()
      const fmt = detectFormat(file)
      setPreview(buildIngestResult(text, fmt, file.name))
    } catch {
      setPreview(null)
    }
  }

  function selectPaste() {
    setInputMode("paste")
    setSelectedFile(null)
    setResult(null)
    setExtraction(null)
    setExtractionError(null)
    setPreview(null)
  }

  // Update preview whenever paste text changes
  function handlePasteChange(text: string) {
    setPasteText(text)
    if (text.trim().length > 0) {
      setPreview(buildIngestResult(text, "raw-text", "Pasted text"))
    } else {
      setPreview(null)
    }
  }

  function clear() {
    setInputMode(null)
    setSelectedFile(null)
    setPasteText("")
    setResult(null)
    setExtraction(null)
    setExtractionError(null)
    setExtractionDebug(null)
    setMergeResult(null)
    setRawLlmText(null)
    setProcessing(false)
    setRawOpen(false)
    setLlmResponseOpen(false)
    setPreview(null)
  }

  async function handleProcess() {
    if (!hasInput || !preview) return
    setProcessing(true)
    setExtractionError(null)
    setExtraction(null)

    const ir = preview
    setResult(ir)

    try {
      if (ir.format === "csv") {
        // CSV -- parsed directly, import into tracker
        if (ir.parsedRows.length === 0) {
          toast.error("No valid rows found in CSV.")
        } else {
          const now = new Date().toISOString()
          let dupes = 0
          ir.parsedRows.forEach((row) => {
            if (experts.some(
              (ex) => ex.name.toLowerCase() === row.name.toLowerCase() &&
                ex.company.toLowerCase() === row.company.toLowerCase()
            )) {
              dupes++
              return
            }
            const expert: Expert = {
              id: uid(), ...row, callCount: 0, createdAt: now, updatedAt: now,
            }
            add(expert)
          })
          const n = ir.parsedRows.length - dupes
          toast.success(`Imported ${n} expert${n === 1 ? "" : "s"}${dupes > 0 ? `, ${dupes} duplicates skipped` : ""}`)
        }
        setProcessing(false)
        return
      }

      // Unstructured -- send to LLM
      const { result: data, rawLlmText: llmText } = await extractExperts(
        ir.rawContent,
        ir.format as LlmInputFormat,
      )
      setExtraction(data)
      setRawLlmText(llmText)

      // Merge into localStorage
      const merge = mergeNewExperts(data.experts)
      setMergeResult(merge)

      // Build descriptive toast
      const parts: string[] = []
      if (merge.added > 0) parts.push(`${merge.added} new expert${merge.added === 1 ? "" : "s"} added`)
      if (merge.duplicates > 0) parts.push(`${merge.duplicates} already in table`)
      if (merge.pricesMerged > 0) parts.push(`${merge.pricesMerged} new network price${merge.pricesMerged === 1 ? "" : "s"} merged`)
      toast.success(parts.join(", ") || `Processed ${data.experts.length} expert${data.experts.length === 1 ? "" : "s"}`)
    } catch (err) {
      // ExtractionError from llm-client includes rawLlmText
      const isExtErr = err && typeof err === "object" && "message" in err && "rawLlmText" in err
      const msg = isExtErr
        ? (err as ExtractionError).message
        : err instanceof Error ? err.message : "Processing failed"
      setExtractionError(msg)
      if (isExtErr) {
        setRawLlmText((err as ExtractionError).rawLlmText)
        setExtractionDebug((err as ExtractionError).debug)
      }
      toast.error("Extraction failed")
    } finally {
      setProcessing(false)
    }
  }

  const emlSource = preview?.format === "email" ? extractEmlMeta(preview.fullRaw) : null
  const eml = result?.format === "email" ? extractEmlMeta(result.fullRaw) : null

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Upload"
        description="Import expert profiles from CSV files, network emails, or pasted text. Structured CSV is parsed directly; unstructured content is sent to an LLM for extraction. New experts are saved to the expert tracker in your browser. Duplicates are detected by fuzzy name + company matching; if an existing expert is found via a new network, the new price is merged automatically."
      />

      {/* ---- Direct integration note ---- */}
      <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <Plug className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sky-900">
              Direct network integration
            </p>
            <p className="mt-1 text-xs leading-relaxed text-sky-800">
              In a complete product, this system would interface directly with
              expert networks (e.g. AlphaView, GLS, GuidePost) on a
              per-project basis. Expert profiles, availability, and pricing
              would flow into the platform automatically and be parsed in
              real-time, removing the need for manual batch uploads entirely.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-sky-600">
              <ArrowRightLeft className="h-3 w-3" />
              <span>API-driven sync would replace the upload workflow below</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Input methods ---- */}
      {!processing && !extraction && (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* File drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files[0]
                if (f) selectFile(f)
              }}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click() }}
              className={[
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 px-6 py-14 text-center transition-colors",
                inputMode === "file"
                  ? "border-primary bg-primary/5"
                  : dragOver
                    ? "border-primary/50 bg-primary/5 border-dashed"
                    : inputMode === "paste"
                      ? "border-border bg-muted/10 opacity-50 border-dashed"
                      : "border-border bg-muted/20 hover:border-primary/30 hover:bg-muted/30 border-dashed",
              ].join(" ")}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${inputMode === "file" ? "bg-primary/10" : "bg-muted"}`}>
                <Upload className={`h-5 w-5 ${inputMode === "file" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              {selectedFile ? (
                <>
                  <p className="mt-3 text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB -- click to change
                  </p>
                </>
              ) : (
                <>
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
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.eml,.txt,.msg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) selectFile(f)
                }}
              />
            </div>

            {/* Paste raw text */}
            <div
              className={[
                "flex flex-col overflow-hidden rounded-lg border-2 transition-colors",
                inputMode === "paste"
                  ? "border-primary bg-card"
                  : inputMode === "file"
                    ? "border-border bg-card opacity-50"
                    : "border-border bg-card hover:border-primary/30",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={selectPaste}
                className="flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${inputMode === "paste" ? "bg-primary/10" : "bg-muted"}`}>
                  <ClipboardPaste className={`h-5 w-5 ${inputMode === "paste" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Paste raw text</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Paste an email body, screening notes, or any unstructured expert data
                  </p>
                </div>
                {inputMode === "paste" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {inputMode === "paste" && (
                <div className="border-t border-border px-5 py-4">
                  <textarea
                    value={pasteText}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="Paste expert recommendation text here..."
                    rows={8}
                    className="w-full resize-none rounded-md border border-border bg-muted/20 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    autoFocus
                  />
                  {pasteText.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {pasteText.length.toLocaleString()} characters
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ---- Raw content preview (collapsed by default, before LLM submit) ---- */}
          {preview && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setRawOpen(!rawOpen)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Raw content to be submitted ({preview.rawContent.length.toLocaleString()} characters)
                </span>
                {rawOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              {rawOpen && (
                <div className="overflow-hidden rounded-b-lg border border-t-0 border-border bg-card">
                  {emlSource && emlSource.subject && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                      {emlSource.from && (
                        <span><span className="font-semibold text-foreground/70">From:</span> {emlSource.from}</span>
                      )}
                      {emlSource.subject && (
                        <span><span className="font-semibold text-foreground/70">Subject:</span> {emlSource.subject}</span>
                      )}
                      {emlSource.date && (
                        <span><span className="font-semibold text-foreground/70">Date:</span> {emlSource.date}</span>
                      )}
                    </div>
                  )}
                  <div className="max-h-64 overflow-y-auto p-4">
                    <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/80">
                      {preview.rawContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- Process button ---- */}
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleProcess}
              disabled={!hasInput}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Process Input
            </button>
            {inputMode && (
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
            {!hasInput && inputMode && (
              <span className="text-xs text-muted-foreground">
                {inputMode === "file" ? "Select a file to continue" : "Paste some text to continue"}
              </span>
            )}
          </div>

          {/* Error from previous attempt */}
          {extractionError && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <p className="flex-1 text-sm font-medium text-destructive">Extraction failed</p>
                  <button
                    type="button"
                    onClick={handleProcess}
                    className="inline-flex h-7 items-center gap-1.5 rounded-md border border-destructive/30 px-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Retry
                  </button>
                </div>
                <div className="mt-2 max-h-32 overflow-auto rounded-md bg-destructive/5 p-2">
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-destructive/80">
                    {extractionError}
                  </pre>
                </div>
                {extractionDebug && (
                  <div className="mt-2 max-h-32 overflow-auto rounded-md bg-destructive/5 p-2">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-destructive/60">Debug info</p>
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-destructive/80">
                      {JSON.stringify(extractionDebug, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* LLM Raw Response -- on error */}
              {rawLlmText && (
                <div>
                  <button
                    type="button"
                    onClick={() => setLlmResponseOpen(!llmResponseOpen)}
                    className="flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100"
                  >
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="flex-1 text-[11px] font-semibold uppercase tracking-widest text-amber-700">
                      LLM raw response ({rawLlmText.length.toLocaleString()} characters)
                    </span>
                    {llmResponseOpen ? (
                      <ChevronUp className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-amber-600" />
                    )}
                  </button>
                  {llmResponseOpen && (
                    <div className="overflow-hidden rounded-b-lg border border-t-0 border-amber-200 bg-card">
                      <div className="max-h-96 overflow-y-auto p-4">
                        <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/80">
                          {rawLlmText}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ---- Processing spinner ---- */}
      {processing && (
        <div className="mt-10 flex flex-col items-center justify-center py-16">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="mt-5 text-sm font-medium text-foreground">
            Processing input...
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {inputMode === "file" && selectedFile
              ? `Analysing ${selectedFile.name}`
              : `Analysing ${pasteText.length.toLocaleString()} characters of pasted text`}
            {" "}with GPT-4.1. This typically takes 10-30 seconds.
          </p>
        </div>
      )}

      {/* ---- Results ---- */}
      {extraction && extraction.experts.length > 0 && (
        <div className="mt-6">
          {/* Success banner */}
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">
                {extraction.experts.length} expert{extraction.experts.length === 1 ? "" : "s"} extracted from {result?.sourceName ?? "uploaded content"}
              </p>
              {mergeResult && (
                <p className="mt-0.5 text-xs text-emerald-700">
                  {mergeResult.added > 0 && (
                    <span className="font-medium">{mergeResult.added} new</span>
                  )}
                  {mergeResult.added > 0 && mergeResult.duplicates > 0 && " / "}
                  {mergeResult.duplicates > 0 && (
                    <span>{mergeResult.duplicates} already in table</span>
                  )}
                  {mergeResult.pricesMerged > 0 && (
                    <span> ({mergeResult.pricesMerged} new network price{mergeResult.pricesMerged === 1 ? "" : "s"} merged)</span>
                  )}
                  {" -- "}saved to expert tracker
                </p>
              )}
              {!mergeResult && (
                <p className="mt-0.5 text-xs text-emerald-700">
                  From {result?.sourceName ?? "uploaded content"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setExtraction(null); setExtractionError(null) }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-300 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                Re-extract
              </button>
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-300 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                Upload more
              </button>
            </div>
          </div>

          {/* Results heading */}
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Extraction Results ({extraction.experts.length} experts)
            </h2>
          </div>

          {/* Results table */}
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {[
                      "Name", "Role (Anonymised)", "Company", "Type",
                      "Former", "Price/hr", "Network", "Industry", "FTEs",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {extraction.experts.map((ex, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-foreground">{ex.name}</td>
                      <td className="px-3 py-2.5 text-sm text-muted-foreground">{ex.role}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground">{ex.company}</td>
                      <td className="whitespace-nowrap px-3 py-2.5"><ExpertTypeBadge type={ex.expert_type} /></td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground">
                        {ex.former ? (
                          <span className="text-amber-600">
                            Yes{ex.date_left !== "N/A" && ex.date_left !== "Unknown" ? ` (${ex.date_left})` : ""}
                          </span>
                        ) : "Current"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground">
                        {ex.price != null ? `$${ex.price}` : "--"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground">{ex.network}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground">{ex.industry_guess}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground">{ex.fte_estimate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Screener detail cards */}
          <div className="mt-4 space-y-3">
            {extraction.experts.map((ex, i) => (
              <ExpertDetailCard key={i} expert={ex} />
            ))}
          </div>

          {/* Raw content (collapsed by default) */}
          {result && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setRawOpen(!rawOpen)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Raw source content ({result.rawContent.length.toLocaleString()} characters)
                </span>
                {rawOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              {rawOpen && (
                <div className="overflow-hidden rounded-b-lg border border-t-0 border-border bg-card">
                  {eml && eml.subject && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                      {eml.from && (
                        <span><span className="font-semibold text-foreground/70">From:</span> {eml.from}</span>
                      )}
                      {eml.subject && (
                        <span><span className="font-semibold text-foreground/70">Subject:</span> {eml.subject}</span>
                      )}
                      {eml.date && (
                        <span><span className="font-semibold text-foreground/70">Date:</span> {eml.date}</span>
                      )}
                    </div>
                  )}
                  <div className="max-h-64 overflow-y-auto p-4">
                    <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/80">
                      {result.rawContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LLM raw response (collapsed by default) */}
          {rawLlmText && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setLlmResponseOpen(!llmResponseOpen)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  LLM raw response ({rawLlmText.length.toLocaleString()} characters)
                </span>
                {llmResponseOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              {llmResponseOpen && (
                <div className="overflow-hidden rounded-b-lg border border-t-0 border-border bg-card">
                  <div className="max-h-96 overflow-y-auto p-4">
                    <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/80">
                      {rawLlmText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---- Tips (no input selected) ---- */}
      {!inputMode && !processing && !extraction && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Table2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">CSV / Spreadsheet</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Standard CSV with headers. Parsed directly into structured expert records.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Email Files</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Upload .eml files from network emails. Headers extracted, body sent to LLM for parsing.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">Raw Text Paste</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Paste any unstructured text -- email bodies, screening notes, or copied profiles.
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

function ExpertTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    customer: "bg-blue-50 text-blue-700",
    competitor: "bg-orange-50 text-orange-700",
    target: "bg-violet-50 text-violet-700",
    competitor_customer: "bg-teal-50 text-teal-700",
  }
  const labels: Record<string, string> = {
    customer: "Customer",
    competitor: "Competitor",
    target: "Target",
    competitor_customer: "Comp. Customer",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[type] || styles.customer}`}
    >
      {labels[type] || type}
    </span>
  )
}

function ExpertDetailCard({ expert }: { expert: ExtractedExpert }) {
  const [open, setOpen] = useState(false)

  const screeners: Array<{ label: string; value: string | null }> =
    expert.expert_type === "customer"
      ? [
          { label: "Vendors evaluated", value: expert.screener_vendors_evaluated },
          { label: "Selection driver", value: expert.screener_vendor_selection_driver },
          { label: "Satisfaction", value: expert.screener_vendor_satisfaction },
          { label: "Switch trigger", value: expert.screener_switch_trigger },
        ]
      : [
          { label: "Competitive landscape", value: expert.screener_competitive_landscape },
          { label: "Losing deals to", value: expert.screener_losing_deals_to },
          { label: "Pricing comparison", value: expert.screener_pricing_comparison },
          { label: "R&D investment", value: expert.screener_rd_investment },
        ]

  const hasScreeners = screeners.some((s) => s.value != null)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">{expert.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {expert.role} at {expert.company}
          </span>
        </div>
        <ExpertTypeBadge type={expert.expert_type} />
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Original title (internal)
              </p>
              <p className="mt-0.5 text-sm text-foreground">{expert.original_role}</p>
            </div>
            {expert.former && expert.date_left !== "N/A" && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Date left
                </p>
                <p className="mt-0.5 text-sm text-foreground">{expert.date_left}</p>
              </div>
            )}
          </div>
          {hasScreeners && (
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Screener responses
              </p>
              <div className="space-y-2">
                {screeners
                  .filter((s) => s.value != null)
                  .map((s) => (
                    <div key={s.label}>
                      <p className="text-xs font-medium text-foreground/70">{s.label}</p>
                      <p className="mt-0.5 text-sm text-foreground">{s.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {expert.additional_info && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Additional information
              </p>
              <p className="mt-0.5 text-sm text-foreground">{expert.additional_info}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
