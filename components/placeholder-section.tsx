import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlaceholderSectionProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function PlaceholderSection({
  icon: Icon,
  title,
  description,
  className,
}: PlaceholderSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <h3 className="mt-3 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
