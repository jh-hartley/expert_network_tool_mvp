import { Search, FileText, Users, MessageSquare } from "lucide-react"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import EmptyState from "../components/empty-state"

const filters = [
  { label: "Type", options: ["Experts", "Transcripts", "Survey Responses", "All"] },
  { label: "Industry", options: ["Technology", "Healthcare", "Energy", "Finance", "Consumer"] },
  { label: "Date Range", options: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"] },
]

const mockResults = [
  {
    type: "Expert",
    icon: Users,
    title: "Dr. Sarah Chen",
    snippet: "VP of R&D at BioGen Corp. Specialises in mRNA therapeutic development and regulatory strategy. 4 calls completed.",
    match: "92%",
  },
  {
    type: "Transcript",
    icon: FileText,
    title: "Call: Battery Supply Chain Deep Dive",
    snippet: "...the key bottleneck is cathode material sourcing. We expect lithium carbonate prices to stabilise by Q3, but nickel remains volatile...",
    match: "87%",
  },
  {
    type: "Survey",
    icon: MessageSquare,
    title: "Response: SaaS Pricing Trends Survey",
    snippet: "Expert consensus: 70% expect usage-based pricing to become dominant by 2027. Key concern is customer predictability of costs.",
    match: "81%",
  },
]

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Search"
        description="Search across experts, call transcripts, and survey responses using filters or natural language queries."
      />

      {/* NL search */}
      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={'Try: "experts with battery supply chain experience"'}
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            aria-label="Natural language search"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Supports natural language queries and structured filters. Mock results shown below.
        </p>
      </div>

      <div className="mt-3">
        <FilterPanel filters={filters} searchPlaceholder="Refine with keywords..." />
      </div>

      {/* Results */}
      <div className="mt-4 flex flex-col gap-2">
        {mockResults.map((result, i) => {
          const Icon = result.icon
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{result.type}</span>
                  <span className="text-[11px] font-semibold text-primary">{result.match}</span>
                </div>
                <h3 className="mt-0.5 text-sm font-semibold text-foreground">{result.title}</h3>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">{result.snippet}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <EmptyState
          icon={Search}
          title="More results available"
          description="This is a mock search interface. In the full product, results will be powered by semantic search across all ingested data."
        />
      </div>
    </div>
  )
}
