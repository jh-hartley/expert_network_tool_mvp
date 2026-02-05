import { Upload, FileText, Mail, Table, FileCode } from "lucide-react"
import PageHeader from "../components/page-header"
import EmptyState from "../components/empty-state"

const inputTypes = [
  { icon: FileText, label: "Call Transcript", desc: "PDF or text transcripts from expert calls" },
  { icon: Mail, label: "Email / Web Page", desc: "Paste email threads or expert profile URLs" },
  { icon: Table, label: "Spreadsheet", desc: "CSV or Excel exports from expert networks" },
  { icon: FileCode, label: "Structured Data", desc: "JSON or XML expert records for bulk import" },
]

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Upload"
        description="Ingest expert data from multiple sources. Supported formats: transcripts, emails, spreadsheets, structured data."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {inputTypes.map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            type="button"
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-accent/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div className="mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-6 py-14 text-center">
        <Upload className="h-7 w-7 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          Drag and drop files here, or click to browse
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          CSV, XLSX, PDF, TXT, JSON up to 10 MB
        </p>
      </div>

      {/* Recent uploads */}
      <div className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
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
