import { Upload, FileText, Mail, Table, FileCode } from "lucide-react"
import PageHeader from "../components/page-header"
import EmptyState from "../components/empty-state"

const inputTypes = [
  {
    icon: FileText,
    label: "Call Transcript",
    description: "PDF or text transcripts from expert calls",
  },
  {
    icon: Mail,
    label: "Email / Web Page",
    description: "Paste email threads or expert profile URLs",
  },
  {
    icon: Table,
    label: "Spreadsheet",
    description: "CSV or Excel exports from expert networks (GLG, AlphaSights, etc.)",
  },
  {
    icon: FileCode,
    label: "Structured Data",
    description: "JSON or XML expert records for bulk import",
  },
]

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Upload"
        description="Ingest expert data from multiple sources. Supported formats include transcripts, emails, spreadsheets, and structured data."
      />

      {/* Input type cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {inputTypes.map(({ icon: Icon, label, description }) => (
          <button
            key={label}
            type="button"
            className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/30 hover:bg-accent"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Drop zone placeholder */}
      <div className="mt-8">
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Drag and drop files here, or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            CSV, XLSX, PDF, TXT, JSON up to 10 MB
          </p>
        </div>
      </div>

      {/* Recent uploads -- empty state */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Recent Uploads
        </h2>
        <EmptyState
          icon={FileText}
          title="No uploads yet"
          description="Upload your first batch of expert data to get started. The system will automatically parse and standardise profiles."
        />
      </div>
    </div>
  )
}
