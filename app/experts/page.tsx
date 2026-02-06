"use client"

import { useState, useCallback } from "react"
import { Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import WipBanner from "../components/wip-banner"
import ExpertLensTable from "../components/expert-lens-table"
import {
  getExpertProfiles,
  saveExpertProfiles,
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
        saveExpertProfiles(next)
        return next
      })
    },
    [],
  )

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <PageHeader
        title="Experts"
        description="Browse expert profiles by type, review screening responses, and build your shortlist. Use the lens tabs to switch between customer, competitor, and target views with type-specific screening columns. Data is persisted in your browser -- shortlists, notes, and new experts from the Upload page are saved automatically."
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
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
        <p className="text-xs leading-relaxed text-sky-800">
          <span className="font-medium">Browser storage active.</span> The
          table is initialised with demo profiles from the Project Atlas
          scenario and persists changes (shortlists, notes, CID requests) in
          your browser. New experts uploaded via the Upload page are merged
          automatically -- duplicates are detected by fuzzy name + company
          matching. Data is private to this browser and will be lost if you
          clear site data.
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
