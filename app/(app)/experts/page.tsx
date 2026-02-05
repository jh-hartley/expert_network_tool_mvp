import { PageHeader } from "@/components/page-header"
import { ExpertsContent } from "@/components/experts/experts-content"

export default function ExpertsPage() {
  return (
    <>
      <PageHeader
        title="Experts"
        description="Manage your expert database. Filter, shortlist, and track compliance status."
      />
      <ExpertsContent />
    </>
  )
}
