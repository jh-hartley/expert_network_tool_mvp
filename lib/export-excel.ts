/* ------------------------------------------------------------------ */
/*  Shared Excel export utility                                        */
/*                                                                     */
/*  One function to rule them all -- pass rows and it creates a        */
/*  multi-sheet workbook with an "All" sheet plus one sheet per        */
/*  expert_type.  Uses the SheetJS (xlsx) library.                     */
/* ------------------------------------------------------------------ */

/** Column mapping: key from the data object -> header label in Excel */
export interface ExcelColumnDef {
  key: string
  header: string
  /** Optional transform applied before writing the cell value */
  transform?: (value: unknown, row: Record<string, unknown>) => unknown
}

interface ExportOptions {
  /** File name without extension */
  fileName: string
  /** The rows to export -- plain objects */
  rows: Record<string, unknown>[]
  /** Column definitions (order = column order in Excel) */
  columns: ExcelColumnDef[]
  /** The key used to split rows into separate sheets by expert type (default: "expert_type") */
  typeKey?: string
}

const TYPE_LABELS: Record<string, string> = {
  customer: "Customer",
  competitor: "Competitor",
  target: "Target",
  competitor_customer: "Comp. Customer",
}

/**
 * Build and download an .xlsx file.
 * Creates sheets: "All", then one per unique expert_type value.
 *
 * xlsx is dynamically imported at call-time to avoid Turbopack panics
 * caused by SheetJS's Node.js shims being statically analysed.
 */
export async function exportToExcel({ fileName, rows, columns, typeKey = "expert_type" }: ExportOptions) {
  const XLSX = await import("xlsx")

  const wb = XLSX.utils.book_new()

  function buildSheetData(data: Record<string, unknown>[]) {
    const headers = columns.map((c) => c.header)
    const body = data.map((row) =>
      columns.map((col) => {
        const raw = row[col.key]
        return col.transform ? col.transform(raw, row) : (raw ?? "")
      }),
    )
    return [headers, ...body]
  }

  // "All" sheet
  const allData = buildSheetData(rows)
  const wsAll = XLSX.utils.aoa_to_sheet(allData)
  autoWidth(XLSX, wsAll, allData)
  XLSX.utils.book_append_sheet(wb, wsAll, "All")

  // Per-type sheets
  const types = [...new Set(rows.map((r) => String(r[typeKey] ?? "")))]
    .filter(Boolean)
    .sort()

  for (const t of types) {
    const filtered = rows.filter((r) => String(r[typeKey]) === t)
    if (filtered.length === 0) continue
    const label = TYPE_LABELS[t] ?? t
    // Excel sheet names max 31 chars, no special chars
    const sheetName = label.slice(0, 31)
    const data = buildSheetData(filtered)
    const ws = XLSX.utils.aoa_to_sheet(data)
    autoWidth(XLSX, ws, data)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  // Trigger download
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Set column widths to fit content */
function autoWidth(XLSX: any, ws: any, data: unknown[][]) {
  if (data.length === 0) return
  const colWidths = (data[0] as unknown[]).map((_, ci) => {
    let max = 10
    for (const row of data) {
      const cell = String((row as unknown[])[ci] ?? "")
      if (cell.length > max) max = cell.length
    }
    return { wch: Math.min(max + 2, 50) }
  })
  ws["!cols"] = colWidths
}
