export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-6 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-[11px] font-medium text-muted-foreground">
          Consensus &mdash; Hackathon Prototype
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          All company names, expert profiles, and data are entirely fictional.
          Built for demonstration purposes only.
        </p>
      </div>
    </footer>
  )
}
