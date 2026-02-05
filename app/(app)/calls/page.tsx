import { PageHeader } from "@/components/page-header"
import { CallsContent } from "@/components/calls/calls-content"

export default function CallsPage() {
  return (
    <>
      <PageHeader
        title="Calls"
        description="Track scheduled, completed, and cancelled expert calls."
      />
      <CallsContent />
    </>
  )
}
