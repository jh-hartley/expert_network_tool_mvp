import { PageHeader } from "@/components/page-header"
import { CallDetailContent } from "@/components/calls/call-detail-content"

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
      />
      <CallDetailContent callId={id} />
    </>
  )
}
