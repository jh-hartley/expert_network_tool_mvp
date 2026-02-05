import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  className?: string
}

export function StatCard({ label, value, sub, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  )
}
