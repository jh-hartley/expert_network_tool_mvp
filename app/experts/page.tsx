import { PageHeader } from "@/components/page-header"
import { ExpertsContent } from "@/components/experts/experts-content"

export default function ExpertsPage() {
  return (
    <>
      <PageHeader
        title="Experts"
        description="Manage your expert database. Filter, shortlist, and track compliance status."
      >
        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Add Expert
        </button>
      </PageHeader>
      <ExpertsContent />
    </>
  )
}
