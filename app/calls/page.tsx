import { PageHeader } from "@/components/page-header"
import { CallsContent } from "@/components/calls/calls-content"

export default function CallsPage() {
  return (
    <>
      <PageHeader
        title="Calls"
        description="Track scheduled, completed, and cancelled expert calls."
      >
        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Schedule Call
        </button>
      </PageHeader>
      <CallsContent />
    </>
  )
}
