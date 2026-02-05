import { PageHeader } from "@/components/page-header"
import { UploadContent } from "@/components/upload/upload-content"

export default function UploadPage() {
  return (
    <>
      <PageHeader
        title="Upload"
        description="Ingest expert profiles, transcripts, or survey data from your networks."
      />
      <UploadContent />
    </>
  )
}
