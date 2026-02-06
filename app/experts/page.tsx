"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { Plus, Download } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import {
  getExpertProfiles,
  saveExpertProfiles,
  type ExpertProfile,
} from "@/lib/expert-profiles"
import { exportToExcel, type ExcelColumnDef } from "@/lib/export-excel"

/* Dynamically import the lens table with SSR disabled so it never
   renders on the server -- this eliminates any localStorage-driven
   hydration mismatches. */
const ExpertLensTable = dynamic(
  () => import("../components/expert-lens-table"),
  { ssr: false },
)

/* ------------------------------------------------------------------ */
/*  Experts page                                                       */
/*                                                                     */
/*  State is held here so shortlisting, notes, and CID updates are    */
/*  reflected immediately. Every mutation persists to localStorage.    */
/* ------------------------------------------------------------------ */

export default function ExpertsPage() {
  const [experts, setExperts] = useState<ExpertProfile[]>([])
  const [loaded, setLoaded] = useState(false)

  // Hydrate from localStorage after mount
  useEffect(() => {
    setExperts(getExpertProfiles())
    setLoaded(true)
  }, [])

  const handleUpdate = useCallback(
    (index: number, updates: Partial<ExpertProfile>) => {
      setExperts((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], ...updates }
        saveExpertProfiles(next)
        return next
      })
    },
    [],
  )

  const handleExport = useCallback(() => {
    const EXPERT_COLUMNS: ExcelColumnDef[] = [
      { key: "name", header: "Name" },
      { key: "company", header: "Company" },
      { key: "original_role", header: "Role" },
      { key: "role", header: "Anonymised Role" },
      { key: "expert_type", header: "Type", transform: (v) => {
        const labels: Record<string, string> = { customer: "Customer", competitor: "Competitor", target: "Target", competitor_customer: "Comp. Customer" }
        return labels[String(v)] ?? v
      }},
      { key: "network", header: "Network" },
      { key: "shortlisted", header: "Shortlisted", transform: (v) => v ? "Yes" : "No" },
      { key: "cid_clearance_requested", header: "CID Requested", transform: (v) => v ? "Yes" : "No" },
      { key: "compliance_flags", header: "Compliance Flags", transform: (v) => {
        const arr = v as string[] | undefined
        return arr && arr.length > 0 ? arr.join(", ") : ""
      }},
      { key: "notes", header: "Notes" },
      { key: "additional_info", header: "Additional Info" },
    ]
    // Add network price columns dynamically
    const networkNames = new Set<string>()
    for (const e of experts) {
      for (const n of Object.keys(e.network_prices)) networkNames.add(n)
    }
    const networkCols: ExcelColumnDef[] = [...networkNames].sort().map((n) => ({
      key: `_price_${n}`,
      header: `${n} ($/hr)`,
      transform: (_v, row) => {
        const prices = row.network_prices as Record<string, number | null> | undefined
        const price = prices?.[n]
        return price != null ? price : ""
      },
    }))
    exportToExcel({
      fileName: "Helmsman_Experts",
      rows: experts as unknown as Record<string, unknown>[],
      columns: [...EXPERT_COLUMNS, ...networkCols],
    })
  }, [experts])

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading expert profiles...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <PageHeader
        title="Experts"
        description="Browse expert profiles by type, review screening responses, and build your shortlist. Use the lens tabs to switch between customer, competitor, and target views with type-specific screening columns. Data is persisted in your browser -- shortlists, notes, and new experts from the Upload page are saved automatically."
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <Link
              href="/upload"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Experts
            </Link>
          </>
        }
      />
      {/* Lens table */}
      <div className="mt-6">
        <ExpertLensTable
          experts={experts}
          onUpdateExpert={handleUpdate}
        />
      </div>
    </div>
  )
}
