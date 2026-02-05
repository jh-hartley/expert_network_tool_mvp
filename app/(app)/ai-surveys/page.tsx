import { PageHeader } from "@/components/page-header"
import { SurveysContent } from "@/components/surveys/surveys-content"

export default function AISurveysPage() {
  return (
    <>
      <PageHeader
        title="AI Surveys"
        description="Manage survey responses, KPI data, and linked expert records."
      />
      <SurveysContent />
    </>
  )
}
