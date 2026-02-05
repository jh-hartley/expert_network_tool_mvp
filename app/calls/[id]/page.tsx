import { PageHeader } from "@/components/page-header"
import { CallDetailContent } from "@/components/calls/call-detail-content"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <PageHeader
        title="Call Detail"
        description="View and edit call details, upload transcripts, and extract KPIs."
      >
        <Link
          href="/calls"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Calls
        </Link>
      </PageHeader>
      <CallDetailContent callId={id} />
    </>
  )
}
