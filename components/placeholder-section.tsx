import type { LucideIcon } from "lucide-react"

interface PlaceholderSectionProps {
  icon: LucideIcon
  title: string
  description: string
}

export function PlaceholderSection({
  icon: Icon,
  title,
  description,
}: PlaceholderSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
