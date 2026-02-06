"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import {
  FileText,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  Calendar,
  SlidersHorizontal,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react"
import PageHeader from "../components/page-header"
import EmptyState from "../components/empty-state"
import { getTranscripts, type Transcript } from "@/lib/transcripts"
import { searchExperts } from "@/lib/engagements"
import type { ExpertProfile } from "@/lib/expert-profiles"

/* ------------------------------------------------------------------ */
/*  Expert type metadata                                               */
/* ------------------------------------------------------------------ */

type ExpertType = "customer" | "competitor" | "target" | "competitor_customer"

const TYPE_LABELS: Record<string, string> = {
  customer: "Customer",
  competitor: "Competitor",
  target: "Target",
  competitor_customer: "Comp. Customer",
}
const TYPE_COLORS: Record<string, string> = {
  customer: "bg-blue-50 text-blue-700 border-blue-200",
  competitor: "bg-rose-50 text-rose-700 border-rose-200",
  target: "bg-amber-50 text-amber-700 border-amber-200",
  competitor_customer: "bg-violet-50 text-violet-700 border-violet-200",
}

const EXPERT_TYPES: { key: ExpertType; label: string }[] = [
  { key: "customer", label: "Customer" },
  { key: "competitor", label: "Competitor" },
  { key: "target", label: "Target" },
  { key: "competitor_customer", label: "Comp. Customer" },
]

/* ------------------------------------------------------------------ */
/*  Suggested queries                                                  */
/* ------------------------------------------------------------------ */

const SUGGESTED_QUERIES = [
  "What are the main strengths and weaknesses mentioned across these calls?",
  "Find me direct quotes about pricing or cost comparisons",
  "How do different expert types view the competitive landscape?",
  "What recurring themes appear across multiple transcripts?",
  "Summarise each expert's key takeaways in bullet points",
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  if (!iso) return "--"
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "..."
}

/* ------------------------------------------------------------------ */
/*  SSE stream parser                                                  */
/* ------------------------------------------------------------------ */

async function* parseSSEStream(response: Response) {
  if (!response.body) throw new Error("No response body")
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith("data:")) {
        const data = trimmed.slice(5).trim()
        if (data === "[DONE]") return
        try {
          yield JSON.parse(data)
        } catch {
          /* skip invalid JSON */
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loaded, setLoaded] = useState(false)

  /* Filters */
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [selectedExperts, setSelectedExperts] = useState<
    { name: string; company: string }[]
  >([])
  const [expertQuery, setExpertQuery] = useState("")
  const [acResults, setAcResults] = useState<ExpertProfile[]>([])
  const [acOpen, setAcOpen] = useState(false)
  const acRef = useRef<HTMLDivElement>(null)

  /* Expanded transcripts */
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  /* Query panel */
  const [queryOpen, setQueryOpen] = useState(false)
  const [queryText, setQueryText] = useState("")
  const [queryResult, setQueryResult] = useState("")
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const queryInputRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTranscripts(getTranscripts())
    setLoaded(true)
  }, [])

  /* Close autocomplete on outside click */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (acRef.current && !acRef.current.contains(e.target as Node))
        setAcOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  /* Expert search autocomplete */
  const handleExpertQueryChange = useCallback((value: string) => {
    setExpertQuery(value)
    if (value.length >= 2) {
      setAcResults(searchExperts(value))
      setAcOpen(true)
    } else {
      setAcResults([])
      setAcOpen(false)
    }
  }, [])

  const addExpert = useCallback(
    (expert: ExpertProfile) => {
      const already = selectedExperts.some(
        (e) => e.name === expert.name && e.company === expert.company
      )
      if (!already) {
        setSelectedExperts((prev) => [
          ...prev,
          { name: expert.name, company: expert.company },
        ])
      }
      setExpertQuery("")
      setAcResults([])
      setAcOpen(false)
    },
    [selectedExperts]
  )

  const removeExpert = useCallback((name: string, company: string) => {
    setSelectedExperts((prev) =>
      prev.filter((e) => !(e.name === name && e.company === company))
    )
  }, [])

  const clearAllFilters = useCallback(() => {
    setTypeFilter("")
    setSelectedExperts([])
    setExpertQuery("")
  }, [])

  /* Toggle transcript expansion */
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = transcripts
    if (typeFilter) {
      list = list.filter((t) => t.expert_type === typeFilter)
    }
    if (selectedExperts.length > 0) {
      list = list.filter((t) =>
        selectedExperts.some(
          (e) => e.name === t.expert_name && e.company === t.expert_company
        )
      )
    }
    return list
  }, [transcripts, typeFilter, selectedExperts])

  const hasActiveFilters = typeFilter !== "" || selectedExperts.length > 0

  /* ---------------------------------------------------------------- */
  /*  Query handler                                                    */
  /* ---------------------------------------------------------------- */

  const handleQuery = useCallback(
    async (question?: string) => {
      const q = question ?? queryText.trim()
      if (!q || filtered.length === 0) return

      setQueryText(q)
      setQueryLoading(true)
      setQueryError(null)
      setQueryResult("")
      setCopied(false)

      try {
        const response = await fetch("/api/transcripts-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q,
            transcripts: filtered.map((t) => ({
              engagement_id: t.engagement_id,
              expert_name: t.expert_name,
              expert_company: t.expert_company,
              expert_type: t.expert_type,
              engagement_type: t.engagement_type,
              text: t.text,
              uploaded_at: t.uploaded_at,
            })),
          }),
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null)
          throw new Error(
            errorBody?.error ?? `Request failed (${response.status})`
          )
        }

        let fullContent = ""
        for await (const chunk of parseSSEStream(response)) {
          if (chunk.type === "text-delta" && chunk.textDelta) {
            fullContent += chunk.textDelta
            setQueryResult(fullContent)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setQueryError(message)
      } finally {
        setQueryLoading(false)
      }
    },
    [queryText, filtered]
  )

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(queryResult).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [queryResult])

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (!loaded) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading transcripts...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Transcripts"
        description="Browse all call transcripts. Filter by expert type or select specific experts, then query across them with natural language."
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </div>

          {/* Expert type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
            aria-label="Expert Type"
          >
            <option value="">Expert Type</option>
            {EXPERT_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Expert name autocomplete */}
          <div className="relative flex-1 sm:max-w-xs" ref={acRef}>
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={expertQuery}
              onChange={(e) => handleExpertQueryChange(e.target.value)}
              placeholder="Search expert to add..."
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Search expert"
            />
            {acOpen && acResults.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                <ul className="max-h-48 overflow-y-auto py-1">
                  {acResults.map((expert) => (
                    <li key={`${expert.name}-${expert.company}`}>
                      <button
                        type="button"
                        onClick={() => addExpert(expert)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-accent"
                      >
                        <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {expert.name}
                        </span>
                        <span className="text-muted-foreground">
                          {expert.company}
                        </span>
                        <span
                          className={`ml-auto inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                            TYPE_COLORS[expert.expert_type] ?? ""
                          }`}
                        >
                          {TYPE_LABELS[expert.expert_type] ?? expert.expert_type}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Selected expert chips */}
        {selectedExperts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">
              Showing transcripts for:
            </span>
            {selectedExperts.map((e) => (
              <span
                key={`${e.name}-${e.company}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground"
              >
                {e.name}
                <button
                  type="button"
                  onClick={() => removeExpert(e.name, e.company)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-accent"
                  aria-label={`Remove ${e.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="mt-3 text-[11px] text-muted-foreground">
        {filtered.length} transcript{filtered.length === 1 ? "" : "s"}
        {hasActiveFilters ? " (filtered)" : ""}
      </p>

      {/* ============================================================ */}
      {/*  Query Panel                                                  */}
      {/* ============================================================ */}
      <div className="mt-4 rounded-lg border border-border bg-card overflow-hidden">
        {/* Toggle header */}
        <button
          type="button"
          onClick={() => {
            setQueryOpen((prev) => !prev)
            if (!queryOpen) {
              setTimeout(() => queryInputRef.current?.focus(), 100)
            }
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
          aria-expanded={queryOpen}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Ask a Question
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Query across{" "}
              {filtered.length === transcripts.length
                ? `all ${filtered.length} transcript${filtered.length === 1 ? "" : "s"}`
                : `${filtered.length} of ${transcripts.length} transcript${transcripts.length === 1 ? "" : "s"} (filtered)`}{" "}
              using natural language
            </p>
          </div>
          <div className="shrink-0 text-muted-foreground">
            {queryOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {queryOpen && (
          <div className="border-t border-border px-4 py-4">
            {/* Context indicator */}
            <div className="mb-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                Transcripts included in this query:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {filtered.map((t) => (
                  <span
                    key={t.engagement_id}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      TYPE_COLORS[t.expert_type] ?? "bg-muted text-foreground border-border"
                    }`}
                  >
                    {t.expert_name}
                    <span className="opacity-60">
                      ({TYPE_LABELS[t.expert_type] ?? t.expert_type})
                    </span>
                  </span>
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  No transcripts match your filters. Adjust filters above to
                  include transcripts in your query.
                </p>
              )}
            </div>

            {/* Suggested queries */}
            {!queryResult && !queryLoading && (
              <div className="mb-3">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                  Suggested questions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUERIES.map((sq) => (
                    <button
                      key={sq}
                      type="button"
                      onClick={() => {
                        setQueryText(sq)
                        handleQuery(sq)
                      }}
                      disabled={filtered.length === 0}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-foreground transition-colors hover:bg-accent hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  ref={queryInputRef}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleQuery()
                    }
                  }}
                  placeholder='e.g. "Find me quotes about pricing comparisons" or "What do customers think about support response times?"'
                  rows={2}
                  className="w-full resize-none rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  aria-label="Query transcripts"
                />
              </div>
              <button
                type="button"
                onClick={() => handleQuery()}
                disabled={
                  queryLoading ||
                  !queryText.trim() ||
                  filtered.length === 0
                }
                className="inline-flex h-auto items-center gap-1.5 self-end rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {queryLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Querying...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Ask
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {queryError && (
              <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {queryError}
                </p>
              </div>
            )}

            {/* Result */}
            {(queryResult || queryLoading) && (
              <div className="mt-3" ref={resultRef}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Response
                  </p>
                  {queryResult && !queryLoading && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="max-h-[500px] overflow-y-auto rounded-md border border-border bg-muted/20 p-4">
                  {queryResult ? (
                    <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {queryResult}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysing transcripts...
                    </div>
                  )}
                  {queryLoading && queryResult && (
                    <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  Transcript list                                              */}
      {/* ============================================================ */}
      {filtered.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {filtered.map((t) => {
            const isExpanded = expandedIds.has(t.engagement_id)
            return (
              <div
                key={t.engagement_id}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(t.engagement_id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
                  aria-expanded={isExpanded}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">
                        {t.expert_name}
                      </h3>
                      <span
                        className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                          TYPE_COLORS[t.expert_type] ?? ""
                        }`}
                      >
                        {TYPE_LABELS[t.expert_type] ?? t.expert_type}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {t.expert_company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(t.uploaded_at)}
                      </span>
                      <span className="capitalize">{t.engagement_type}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Preview (collapsed) */}
                {!isExpanded && (
                  <div className="border-t border-border px-4 py-2.5">
                    <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                      {truncateText(t.text, 250)}
                    </p>
                  </div>
                )}

                {/* Full transcript (expanded) */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4">
                    <div className="max-h-[500px] overflow-y-auto rounded-md border border-border bg-muted/20 p-4">
                      <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-foreground/90 font-mono">
                        {t.text}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={FileText}
            title="No transcripts found"
            description={
              hasActiveFilters
                ? "No transcripts match your current filters. Try adjusting your selection."
                : "No transcripts have been uploaded yet. Upload transcripts from the Calls page by clicking 'Upload Transcript' on completed calls."
            }
            actionLabel={hasActiveFilters ? undefined : "Go to Calls"}
            actionHref={hasActiveFilters ? undefined : "/calls"}
          />
        </div>
      )}
    </div>
  )
}
