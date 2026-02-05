import { ClipboardList, Plus, BarChart3, Clock, CheckCircle2 } from "lucide-react"
import PageHeader from "../components/page-header"
import StatCard from "../components/stat-card"
import DataTable from "../components/data-table"
import EmptyState from "../components/empty-state"

const columns = [
  { key: "name", label: "Survey" },
  { key: "topic", label: "Topic" },
  { key: "sent", label: "Sent To" },
  { key: "responses", label: "Responses" },
  { key: "avgNps", label: "Avg NPS", className: "text-right" },
  { key: "status", label: "Status" },
]

const mockSurveys = [
  {
    name: "Battery Tech Outlook Q1",
    topic: "EV battery supply chain",
    sent: "8 experts",
    responses: "6 / 8",
    avgNps: 78,
    status: (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Completed
      </span>
    ),
  },
  {
    name: "SaaS Pricing Trends",
    topic: "B2B SaaS pricing models",
    sent: "12 experts",
    responses: "9 / 12",
    avgNps: 65,
    status: (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Completed
      </span>
    ),
  },
  {
    name: "Healthcare AI Adoption",
    topic: "AI in clinical workflows",
    sent: "10 experts",
    responses: "3 / 10",
    avgNps: "--",
    status: (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        In Progress
      </span>
    ),
  },
]

export default function AiSurveysPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="AI Surveys"
        description="Create AI-powered surveys, distribute them to experts, and extract KPIs from aggregated responses."
        actions={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Survey
          </button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Completed"
          value={24}
          change="+3 this week"
          changeType="positive"
          icon={CheckCircle2}
        />
        <StatCard
          label="In Progress"
          value={8}
          change="awaiting responses"
          changeType="neutral"
          icon={Clock}
        />
        <StatCard
          label="Avg NPS"
          value={72}
          change="across all surveys"
          changeType="positive"
          icon={BarChart3}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Surveys
        </h2>
        <DataTable columns={columns} rows={mockSurveys} />
      </div>

      {/* KPI extraction placeholder */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          KPI Extraction
        </h2>
        <EmptyState
          icon={BarChart3}
          title="AI KPI extraction coming soon"
          description="Select a completed survey to automatically extract key performance indicators, sentiment scores, and notable quotes from expert responses."
        />
      </div>
    </div>
  )
}
