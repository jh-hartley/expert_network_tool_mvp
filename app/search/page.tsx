import { PageHeader } from "@/components/page-header"
import { SearchContent } from "@/components/search/search-content"

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Search"
        description="Query experts and transcripts using structured filters or natural language."
      />
      <SearchContent />
    </>
  )
}
