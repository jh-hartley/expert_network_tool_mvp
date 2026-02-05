"use client"

import { useState, useMemo } from "react"
import { Search, FileText, Users, MessageSquare } from "lucide-react"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import EmptyState from "../components/empty-state"
import { useStore } from "@/lib/use-store"

const filters = [
  { label: "Type", options: ["Experts", "Transcripts", "Survey Responses", "All"] },
  { label: "Industry", options: ["Technology", "Healthcare", "Energy", "Finance", "Consumer"] },
  { label: "Date Range", options: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"] },
]

interface SearchResult {
  type: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  snippet: string
  score: number
}

export default function SearchPage() {
  const { items: experts } = useStore("experts")
  const { items: transcripts } = useStore("transcripts")
  const { items: surveys } = useStore("surveys")
  const [query, setQuery] = useState("")

  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []

    const hits: SearchResult[] = []

    // Search experts
    experts.forEach((e) => {
      const haystack = `${e.name} ${e.title} ${e.company} ${e.industry} ${e.tags.join(" ")}`.toLowerCase()
      if (haystack.includes(q)) {
        hits.push({
          type: "Expert",
          icon: Users,
          title: e.name,
          snippet: `${e.title} at ${e.company}. ${e.industry}. ${e.callCount} calls completed. Tags: ${e.tags.join(", ")}.`,
          score: 90,
        })
      }
    })

    // Search transcripts
    transcripts.forEach((t) => {
      const haystack = `${t.expertName} ${t.summary} ${t.keyTopics.join(" ")}`.toLowerCase()
      if (haystack.includes(q)) {
        hits.push({
          type: "Transcript",
          icon: FileText,
          title: `Call: ${t.expertName}`,
          snippet: t.summary,
          score: 85,
        })
      }
    })

    // Search surveys
    surveys.forEach((s) => {
      const haystack = `${s.name} ${s.topic}`.toLowerCase()
      if (haystack.includes(q)) {
        hits.push({
          type: "Survey",
          icon: MessageSquare,
          title: s.name,
          snippet: `Topic: ${s.topic}. ${s.responses}/${s.sentTo} responses.${s.avgNps !== null ? ` Avg NPS: ${s.avgNps}.` : ""}`,
          score: 80,
        })
      }
    })

    return hits.sort((a, b) => b.score - a.score)
  }, [query, experts, transcripts, surveys])

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Search"
        description="Search across experts, call transcripts, and survey responses using filters or natural language queries."
      />

      {/* Search input */}
      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={'Try: "battery", "healthcare", or an expert name'}
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            aria-label="Natural language search"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {query
            ? `${results.length} result${results.length === 1 ? "" : "s"} found`
            : "Type to search across all data. Filters available below."}
        </p>
      </div>

      <div className="mt-3">
        <FilterPanel filters={filters} searchPlaceholder="Refine with keywords..." />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {results.map((result, i) => {
            const Icon = result.icon
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{result.type}</span>
                    <span className="text-[11px] font-semibold text-primary">{result.score}%</span>
                  </div>
                  <h3 className="mt-0.5 text-sm font-semibold text-foreground">{result.title}</h3>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">{result.snippet}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={Search}
            title="No results found"
            description={`No matches for "${query}". Try a different search term or adjust your filters.`}
          />
        </div>
      )}

      {!query && (
        <div className="mt-6">
          <EmptyState
            icon={Search}
            title="Start searching"
            description="Enter a query above to search across experts, call transcripts, and survey responses."
          />
        </div>
      )}
    </div>
  )
}
