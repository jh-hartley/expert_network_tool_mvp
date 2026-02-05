import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export default function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-600"
      : changeType === "negative"
        ? "text-red-600"
        : "text-muted-foreground"

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {change && (
          <span className={`text-[11px] font-medium ${changeColor}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  )
}
