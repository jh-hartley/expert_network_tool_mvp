import { Info } from "lucide-react"

interface PageShellProps {
  title: string
  description: string
}

export default function PageShell({ title, description }: PageShellProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Under construction / prototype scaffold
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This page is part of the Helmsman hackathon prototype. Functionality
            will be implemented in upcoming iterations.
          </p>
        </div>
      </div>
    </div>
  )
}
