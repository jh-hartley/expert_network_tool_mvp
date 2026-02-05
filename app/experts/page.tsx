import { Plus } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import FilterPanel from "../components/filter-panel"
import DataTable from "../components/data-table"

const filters = [
  { label: "Status", options: ["Cleared", "Pending", "Blocked"] },
  { label: "Network", options: ["GLG", "AlphaSights", "Third Bridge", "Guidepoint", "Direct"] },
  { label: "Industry", options: ["Technology", "Healthcare", "Energy", "Finance", "Consumer"] },
]

const columns = [
  { key: "name", label: "Name" },
  { key: "title", label: "Title / Role" },
  { key: "industry", label: "Industry" },
  { key: "network", label: "Network" },
  { key: "status", label: "Status" },
  { key: "calls", label: "Calls", className: "text-right" },
]

function Badge({ label, variant }: { label: string; variant: "green" | "red" | "amber" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {label}
    </span>
  )
}

const mockExperts = [
  { name: "Dr. Sarah Chen", title: "VP of R&D, BioGen Corp", industry: "Healthcare", network: "GLG", status: <Badge label="Cleared" variant="green" />, calls: 4 },
  { name: "James Rivera", title: "Former CTO, DataStream Inc", industry: "Technology", network: "AlphaSights", status: <Badge label="Cleared" variant="green" />, calls: 2 },
  { name: "Mark Thompson", title: "Director of Strategy, EnergyX", industry: "Energy", network: "Third Bridge", status: <Badge label="Blocked" variant="red" />, calls: 0 },
  { name: "Priya Sharma", title: "Head of Product, FinTech Solutions", industry: "Finance", network: "GLG", status: <Badge label="Pending" variant="amber" />, calls: 1 },
  { name: "Alex Nguyen", title: "SVP Operations, ConsumerCo", industry: "Consumer", network: "Guidepoint", status: <Badge label="Cleared" variant="green" />, calls: 3 },
]

export default function ExpertsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Experts"
        description="Browse and manage expert profiles, qualifications, and compliance status."
        actions={
          <Link
            href="/upload"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Experts
          </Link>
        }
      />

      <div className="mt-4">
        <FilterPanel filters={filters} searchPlaceholder="Search by name, role, or industry..." />
      </div>

      <div className="mt-3">
        <DataTable columns={columns} rows={mockExperts} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">Showing 5 of 247 experts</p>
        <div className="flex items-center gap-1">
          <button type="button" className="h-7 rounded-md border border-border bg-card px-2.5 text-[11px] text-muted-foreground" disabled>Previous</button>
          <button type="button" className="h-7 rounded-md border border-border bg-card px-2.5 text-[11px] text-foreground hover:bg-accent">Next</button>
        </div>
      </div>
    </div>
  )
}
