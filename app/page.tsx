import Link from "next/link"
import { LandingContent } from "@/components/landing-content"
import { Compass } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal landing header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-foreground" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Helmsman
            </span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <LandingContent />
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-screen-xl px-4">
          <p className="text-center text-xs text-muted-foreground">
            Helmsman Prototype — Hackathon Submission. Not for production use.
          </p>
        </div>
      </footer>
    </div>
  )
}
