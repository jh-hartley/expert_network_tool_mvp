import { PageHeader } from "@/components/page-header"
import { ExpertDetailContent } from "@/components/experts/expert-detail-content"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
      >
        <Link
          href="/experts"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Experts
        </Link>
      </PageHeader>
      <ExpertDetailContent expertId={id} />
    </>
  )
}
