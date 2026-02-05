import { PageHeader } from "@/components/page-header"
import { ExpertDetailContent } from "@/components/experts/expert-detail-content"

export default async function ExpertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <PageHeader
        title="Expert Detail"
        description="View and manage expert profile, screening, calls, notes, and compliance."
      />
      <ExpertDetailContent expertId={id} />
    </>
  )
}
