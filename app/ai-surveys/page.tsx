import { PageHeader } from "@/components/page-header"
import { SurveysContent } from "@/components/surveys/surveys-content"

export default function AISurveysPage() {
  return (
    <>
      <PageHeader
        title="AI Surveys"
        description="Manage survey responses, KPI data, and linked expert records."
      >
        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          New Survey
        </button>
      </PageHeader>
      <SurveysContent />
    </>
  )
}
