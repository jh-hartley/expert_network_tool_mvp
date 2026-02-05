import { Users, Plus } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import DataTable from "../components/data-table"

const filters = [
  {
    label: "Status",
    options: ["Cleared", "Pending", "Blocked"],
  },
  {
    label: "Network",
    options: ["GLG", "AlphaSights", "Third Bridge", "Guidepoint", "Direct"],
  },
  {
    label: "Industry",
    options: ["Technology", "Healthcare", "Energy", "Finance", "Consumer"],
  },
]

const columns = [
  { key: "name", label: "Name" },
  { key: "title", label: "Title / Role" },
  { key: "industry", label: "Industry" },
  { key: "network", label: "Network" },
  { key: "status", label: "Status" },
  { key: "calls", label: "Calls", className: "text-right" },
]

const mockExperts = [
  {
    name: "Dr. Sarah Chen",
    title: "VP of R&D, BioGen Corp",
    industry: "Healthcare",
    network: "GLG",
    status: (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Cleared
      </span>
    ),
    calls: 4,
  },
  {
    name: "James Rivera",
    title: "Former CTO, DataStream Inc",
    industry: "Technology",
    network: "AlphaSights",
    status: (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Cleared
      </span>
    ),
    calls: 2,
  },
  {
    name: "Mark Thompson",
    title: "Director of Strategy, EnergyX",
    industry: "Energy",
    network: "Third Bridge",
    status: (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        Blocked
      </span>
    ),
    calls: 0,
  },
  {
    name: "Priya Sharma",
    title: "Head of Product, FinTech Solutions",
    industry: "Finance",
    network: "GLG",
    status: (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        Pending
      </span>
    ),
    calls: 1,
  },
  {
    name: "Alex Nguyen",
    title: "SVP Operations, ConsumerCo",
    industry: "Consumer",
    network: "Guidepoint",
    status: (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Cleared
      </span>
    ),
    calls: 3,
  },
]

export default function ExpertsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Experts"
        description="Browse and manage expert profiles, qualifications, and compliance status."
        actions={
          <Link
            href="/upload"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Experts
          </Link>
        }
      />

      <div className="mt-6">
        <FilterPanel
          filters={filters}
          searchPlaceholder="Search experts by name, role, or industry..."
        />
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={mockExperts} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing 5 of 247 experts
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-8 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground"
            disabled
          >
            Previous
          </button>
          <button
            type="button"
            className="h-8 rounded-md border border-border bg-card px-3 text-xs text-foreground hover:bg-accent"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
