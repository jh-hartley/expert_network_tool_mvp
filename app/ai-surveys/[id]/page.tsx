import { PageHeader } from "@/components/page-header"
import { SurveyDetailContent } from "@/components/surveys/survey-detail-content"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <PageHeader
        title="Survey Detail"
        description="Edit KPI fields, attach transcripts, and extract structured data."
      >
        <Link
          href="/ai-surveys"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Surveys
        </Link>
      </PageHeader>
      <SurveyDetailContent surveyId={id} />
    </>
  )
}
