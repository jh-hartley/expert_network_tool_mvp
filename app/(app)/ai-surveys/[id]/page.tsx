import { PageHeader } from "@/components/page-header"
import { SurveyDetailContent } from "@/components/surveys/survey-detail-content"

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
        description="Edit KPI fields, attach transcripts, and extract KPIs."
      />
      <SurveyDetailContent surveyId={id} />
    </>
  )
}
