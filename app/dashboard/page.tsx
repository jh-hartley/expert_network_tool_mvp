import { PageHeader } from "@/components/page-header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Expert network operations at a glance."
      />
      <DashboardContent />
    </>
  )
}
