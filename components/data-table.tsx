import { cn } from "@/lib/utils"

export interface Column {
  key: string
  label: string
  className?: string
}

interface DataTableProps {
  columns: Column[]
  rows: Record<string, React.ReactNode>[]
  onRowClick?: (index: number) => void
  emptyMessage?: string
}

export function DataTable({ columns, rows, onRowClick, emptyMessage }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage || "No data available"}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "transition-colors hover:bg-secondary/30",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(i)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-foreground", col.className)}>
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
