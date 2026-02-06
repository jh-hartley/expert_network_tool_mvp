"use client"

import { useMemo } from "react"
import { Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import PageHeader from "../components/page-header"
import WipBanner from "../components/wip-banner"
import ExpertLensTable from "../components/expert-lens-table"
import { getExpertProfiles } from "@/lib/expert-profiles"

/* ------------------------------------------------------------------ */
/*  Experts page                                                       */
/*                                                                     */
/*  Architecture: getExpertProfiles() is a pure function that returns  */
/*  seed data today. When localStorage is fixed, swap its body to      */
/*  read from storage (falling back to seeds). The page and lens       */
/*  table consume ExtractedExpert[] without caring about the source.   */
/* ------------------------------------------------------------------ */

export default function ExpertsPage() {
  const experts = useMemo(() => getExpertProfiles(), [])

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
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
          <span className="font-medium">Seed data only.</span>{" "}
          The table below displays synthetic demo profiles from the Project Atlas scenario.
          When the localStorage persistence layer is stabilised, experts extracted via the
          Upload page will appear here automatically.
        </p>
      </div>

      {/* Lens table */}
      <div className="mt-6">
        <ExpertLensTable experts={experts} pageSize={10} />
      </div>
    </div>
  )
}
