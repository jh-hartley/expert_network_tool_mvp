"use client"

import { useState, useCallback } from "react"
import { Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import WipBanner from "../components/wip-banner"
import ExpertLensTable from "../components/expert-lens-table"
import {
  getExpertProfiles,
  type ExpertProfile,
} from "@/lib/expert-profiles"

/* ------------------------------------------------------------------ */
/*  Experts page                                                       */
/*                                                                     */
/*  State is held here so shortlisting, notes, and CID updates are    */
/*  reflected immediately. When localStorage is stabilised, persist    */
/*  `experts` on every update via saveExpertProfiles().                */
/* ------------------------------------------------------------------ */

export default function ExpertsPage() {
  const [experts, setExperts] = useState<ExpertProfile[]>(() =>
    getExpertProfiles(),
  )

  const handleUpdate = useCallback(
    (index: number, updates: Partial<ExpertProfile>) => {
      setExperts((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], ...updates }
        // TODO: saveExpertProfiles(next) once localStorage is stable
        return next
      })
    },
    [],
  )

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <PageHeader
        title="Experts"
        description="Browse expert profiles by type, review screening responses, and build your shortlist. Use the lens tabs to switch between customer, competitor, and target views with type-specific screening columns."
        actions={
          <Link
            href="/upload"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Experts
          </Link>
        }
      />
      <WipBanner feature="experts" />

      {/* Persistence note */}
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">
          <span className="font-medium">Seed data only.</span> The table below
          displays synthetic demo profiles from the Project Atlas scenario.
          Shortlisting, notes, and CID clearance actions work in-session but
          will reset on page reload until localStorage persistence is
          stabilised.
        </p>
      </div>

      {/* Lens table */}
      <div className="mt-6">
        <ExpertLensTable
          experts={experts}
          pageSize={10}
          onUpdateExpert={handleUpdate}
        />
      </div>
    </div>
  )
}
