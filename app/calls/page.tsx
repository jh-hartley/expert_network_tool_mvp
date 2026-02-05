import { Phone, Plus } from "lucide-react"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import DataTable from "../components/data-table"
import StatCard from "../components/stat-card"
import { PhoneOff, Clock, DollarSign } from "lucide-react"

const filters = [
  {
    label: "Status",
    options: ["Scheduled", "Completed", "Cancelled", "No-show"],
  },
  {
    label: "Project",
    options: ["Project Alpha", "Project Beta", "Project Gamma"],
  },
]

const columns = [
  { key: "expert", label: "Expert" },
  { key: "date", label: "Date" },
  { key: "duration", label: "Duration" },
  { key: "project", label: "Project" },
  { key: "status", label: "Status" },
  { key: "cost", label: "Cost", className: "text-right" },
]

const mockCalls = [
  {
    expert: "Dr. Sarah Chen",
    date: "Feb 3, 2026",
    duration: "45 min",
    project: "Project Alpha",
    status: (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Completed
      </span>
    ),
    cost: "$750",
  },
  {
    expert: "James Rivera",
    date: "Feb 4, 2026",
    duration: "30 min",
    project: "Project Alpha",
    status: (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Completed
      </span>
    ),
    cost: "$500",
  },
  {
    expert: "Alex Nguyen",
    date: "Feb 5, 2026",
    duration: "60 min",
    project: "Project Beta",
    status: (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        Scheduled
      </span>
    ),
    cost: "$1,000",
  },
  {
    expert: "Priya Sharma",
    date: "Feb 6, 2026",
    duration: "45 min",
    project: "Project Gamma",
    status: (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        Scheduled
      </span>
    ),
    cost: "$750",
  },
  {
    expert: "Mark Thompson",
    date: "Feb 2, 2026",
    duration: "--",
    project: "Project Alpha",
    status: (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        Cancelled
      </span>
    ),
    cost: "$0",
  },
]

export default function CallsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Calls"
        description="Track scheduled and completed expert calls, manage follow-ups, and monitor spend."
        actions={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Schedule Call
          </button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="This Week"
          value={14}
          change="8 completed"
          changeType="positive"
          icon={Phone}
        />
        <StatCard
          label="Cancelled"
          value={2}
          changeType="negative"
          icon={PhoneOff}
        />
        <StatCard
          label="Avg Duration"
          value="42 min"
          icon={Clock}
        />
        <StatCard
          label="Total Spend"
          value="$18,400"
          change="this month"
          changeType="neutral"
          icon={DollarSign}
        />
      </div>

      <div className="mt-6">
        <FilterPanel filters={filters} searchPlaceholder="Search calls..." />
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={mockCalls} />
      </div>
    </div>
  )
}
