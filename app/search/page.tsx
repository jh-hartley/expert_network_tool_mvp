import { Search, FileText, Users, MessageSquare } from "lucide-react"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import EmptyState from "../components/empty-state"

const filters = [
  {
    label: "Type",
    options: ["Experts", "Transcripts", "Survey Responses", "All"],
  },
  {
    label: "Industry",
    options: ["Technology", "Healthcare", "Energy", "Finance", "Consumer"],
  },
  {
    label: "Date Range",
    options: ["Last 7 days", "Last 30 days", "Last 90 days", "All time"],
  },
]

const mockResults = [
  {
    type: "Expert",
    icon: Users,
    title: "Dr. Sarah Chen",
    snippet:
      "VP of R&D at BioGen Corp. Specialises in mRNA therapeutic development and regulatory strategy. 4 calls completed.",
    match: "92% relevance",
  },
  {
    type: "Transcript",
    icon: FileText,
    title: "Call: Battery Supply Chain Deep Dive",
    snippet:
      '...the key bottleneck is cathode material sourcing. "We expect lithium carbonate prices to stabilise by Q3, but nickel remains volatile"...',
    match: "87% relevance",
  },
  {
    type: "Survey",
    icon: MessageSquare,
    title: "Response: SaaS Pricing Trends Survey",
    snippet:
      "Expert consensus: 70% expect usage-based pricing to become dominant by 2027. Key concern is customer predictability of costs.",
    match: "81% relevance",
  },
]

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Search"
        description="Search across experts, call transcripts, and survey responses using filters or natural language queries."
      />

      {/* NL search bar */}
      <div className="mt-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Try: &quot;experts with battery supply chain experience&quot; or &quot;NPS scores above 70&quot;"
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            aria-label="Natural language search"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Supports natural language queries and structured filters. Mock results
          shown below.
        </p>
      </div>

      <div className="mt-4">
        <FilterPanel
          filters={filters}
          searchPlaceholder="Refine with keywords..."
        />
      </div>

      {/* Mock results */}
      <div className="mt-6 flex flex-col gap-3">
        {mockResults.map((result, i) => {
          const Icon = result.icon
          return (
            <div
              key={i}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {result.type}
                  </span>
                  <span className="text-xs text-primary font-medium">
                    {result.match}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-semibold text-foreground">
                  {result.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {result.snippet}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full empty state for when no search has been performed */}
      <div className="mt-8">
        <EmptyState
          icon={Search}
          title="More results available"
          description="This is a mock search interface. In the full product, results will be powered by semantic search across all ingested expert data and transcripts."
        />
      </div>
    </div>
  )
}
