import { Plus, BarChart3, Clock, CheckCircle2 } from "lucide-react"
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

function Badge({ label, variant }: { label: string; variant: "green" | "amber" }) {
  const styles = { green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700" }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

const mockSurveys = [
  { name: "Battery Tech Outlook Q1", topic: "EV battery supply chain", sent: "8 experts", responses: "6 / 8", avgNps: 78, status: <Badge label="Completed" variant="green" /> },
  { name: "SaaS Pricing Trends", topic: "B2B SaaS pricing models", sent: "12 experts", responses: "9 / 12", avgNps: 65, status: <Badge label="Completed" variant="green" /> },
  { name: "Healthcare AI Adoption", topic: "AI in clinical workflows", sent: "10 experts", responses: "3 / 10", avgNps: "--", status: <Badge label="In Progress" variant="amber" /> },
]

export default function AiSurveysPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="AI Surveys"
        description="Create AI-powered surveys, distribute to experts, and extract KPIs from aggregated responses."
        actions={
          <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            New Survey
          </button>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Completed" value={24} change="+3 this week" changeType="positive" icon={CheckCircle2} />
        <StatCard label="In Progress" value={8} change="awaiting responses" changeType="neutral" icon={Clock} />
        <StatCard label="Avg NPS" value={72} change="across all surveys" changeType="positive" icon={BarChart3} />
      </div>

      <div className="mt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Surveys</h2>
        <DataTable columns={columns} rows={mockSurveys} />
      </div>

      <div className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">KPI Extraction</h2>
        <EmptyState
          icon={BarChart3}
          title="AI KPI extraction coming soon"
          description="Select a completed survey to automatically extract key performance indicators, sentiment scores, and notable quotes."
        />
      </div>
    </div>
  )
}
